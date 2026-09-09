const { getRedisClient, isRedisHealthy } = require('../../config/redis');
const { broadcastToSession } = require('../../config/socket');
const prisma = require('../../database/prisma');
const AppError = require('../../shared/errors/AppError');

// =========================================================================
// 1. REDIS LUA SCRIPTS
// =========================================================================

/**
 * Atomic All-or-Nothing Multi-Seat Lock Lua Script
 * KEYS: Array of seat lock keys ['lock:sess1:seatA1', 'lock:sess1:seatA2']
 * ARGV[1]: userId
 * ARGV[2]: TTL in seconds (300 for 5 minutes)
 */
const ACQUIRE_SEATS_LUA = `
-- Step 1: Pre-flight check: Are ALL requested seats free?
for i, key in ipairs(KEYS) do
  if redis.call('EXISTS', key) == 1 then
    local currentHolder = redis.call('GET', key)
    -- If locked by someone else, abort!
    if currentHolder ~= ARGV[1] then
      return {0, key, currentHolder}
    end
  end
end

-- Step 2: All seats are available! Lock all of them atomically with TTL
for i, key in ipairs(KEYS) do
  redis.call('SET', key, ARGV[1], 'EX', tonumber(ARGV[2]))
end

return {1, 'SUCCESS'}
`;

/**
 * Safe Atomic Release Lua Script (verifies ownership before unlocking)
 * KEYS: Array of seat lock keys
 * ARGV[1]: userId
 */
const RELEASE_SEATS_LUA = `
local released = 0
for i, key in ipairs(KEYS) do
  if redis.call('GET', key) == ARGV[1] then
    redis.call('DEL', key)
    released = released + 1
  end
end
return released
`;

// In-Memory Fallback Store (Used only if Redis is unavailable)
const inMemoryLockStore = new Map();

// Periodic sweep for expired in-memory locks
setInterval(() => {
  const now = Date.now();
  for (const [key, lock] of inMemoryLockStore.entries()) {
    if (lock.expiresAt <= now) {
      inMemoryLockStore.delete(key);
      const [sessionId, seatId] = key.replace('lock:', '').split(':');
      if (sessionId && seatId) {
        broadcastToSession(sessionId, 'seat:unlocked', {
          seatIds: [seatId],
          sessionId,
          reason: 'EXPIRED',
        });
      }
    }
  }
}, 5000).unref();

class SeatLockService {
  /**
   * Acquire atomic lock on one or multiple seats for a session
   * @param {string} sessionId
   * @param {string[]} seatIds
   * @param {string} userId
   * @param {number} ttlSeconds - Default 300 (5 minutes)
   */
  async acquireLocks(sessionId, seatIds, userId, ttlSeconds = 300) {
    if (!seatIds || seatIds.length === 0) {
      throw AppError.badRequest('No seat IDs provided for locking');
    }

    if (seatIds.length > 6) {
      throw AppError.badRequest('Anti-scalping limit: You can only lock up to 6 seats at a time');
    }

    // First, verify in PostgreSQL that none of these seats are permanently BOOKED
    const permanentlyBooked = await prisma.bookingSeat.findFirst({
      where: {
        sessionId,
        venueSeatId: { in: seatIds },
        status: 'BOOKED',
      },
    });

    if (permanentlyBooked) {
      throw AppError.conflict(
        `Seat ${permanentlyBooked.seatNumber || permanentlyBooked.venueSeatId} is already booked and unavailable`
      );
    }

    const redis = getRedisClient();
    const useRedis = isRedisHealthy() && redis !== null;

    if (useRedis) {
      try {
        const keys = seatIds.map((seatId) => `lock:${sessionId}:${seatId}`);
        const result = await redis.eval(ACQUIRE_SEATS_LUA, keys.length, ...keys, userId, ttlSeconds);

        const status = Array.isArray(result) ? result[0] : result;
        if (status === 0) {
          const conflictingKey = result[1];
          const seatId = conflictingKey ? conflictingKey.split(':').pop() : 'requested';
          throw AppError.conflict(
            `Seat ${seatId} is currently held in another customer's checkout cart. Please choose a different seat.`
          );
        }

        const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

        // Broadcast real-time Socket.IO event to all users viewing this session
        broadcastToSession(sessionId, 'seat:locked', {
          seatIds,
          sessionId,
          lockedBy: userId,
          expiresAt: expiresAt.toISOString(),
          ttlSeconds,
        });

        return {
          success: true,
          engine: 'REDIS_LUA',
          sessionId,
          seatIds,
          ttlSeconds,
          expiresAt,
        };
      } catch (err) {
        if (err instanceof AppError) throw err;
        console.warn('⚠️ [SeatLock] Redis Lua failed, switching to Database Fallback:', err.message);
      }
    }

    // =========================================================================
    // FALLBACK ENGINE: In-Memory TTL Store + PostgreSQL Transaction
    // =========================================================================
    return await this._acquireFallbackLocks(sessionId, seatIds, userId, ttlSeconds);
  }

  /**
   * Fallback lock engine using In-Memory TTL Map and PostgreSQL
   * @private
   */
  async _acquireFallbackLocks(sessionId, seatIds, userId, ttlSeconds) {
    const now = Date.now();

    // Check in-memory store
    for (const seatId of seatIds) {
      const key = `lock:${sessionId}:${seatId}`;
      const existing = inMemoryLockStore.get(key);
      if (existing && existing.expiresAt > now && existing.userId !== userId) {
        throw AppError.conflict(
          `Seat ${seatId} is currently held in another customer's checkout cart. Please choose a different seat.`
        );
      }
    }

    // Check DB active locks
    const dbLocked = await prisma.bookingSeat.findFirst({
      where: {
        sessionId,
        venueSeatId: { in: seatIds },
        status: 'LOCKED',
        booking: {
          expiresAt: { gt: new Date() },
          status: 'PENDING',
        },
      },
    });

    if (dbLocked && dbLocked.booking && dbLocked.booking.userId !== userId) {
      throw AppError.conflict(
        `Seat ${dbLocked.seatNumber || dbLocked.venueSeatId} is currently held by another user.`
      );
    }

    const expiresAtMs = now + ttlSeconds * 1000;
    const expiresAt = new Date(expiresAtMs);

    // Set locks in memory
    for (const seatId of seatIds) {
      const key = `lock:${sessionId}:${seatId}`;
      inMemoryLockStore.set(key, {
        userId,
        expiresAt: expiresAtMs,
      });
    }

    // Broadcast real-time Socket.IO event
    broadcastToSession(sessionId, 'seat:locked', {
      seatIds,
      sessionId,
      lockedBy: userId,
      expiresAt: expiresAt.toISOString(),
      ttlSeconds,
    });

    return {
      success: true,
      engine: 'IN_MEMORY_FALLBACK',
      sessionId,
      seatIds,
      ttlSeconds,
      expiresAt,
    };
  }

  /**
   * Safe release of locked seats (verifies ownership)
   * @param {string} sessionId
   * @param {string[]} seatIds
   * @param {string} userId
   */
  async releaseLocks(sessionId, seatIds, userId) {
    if (!seatIds || seatIds.length === 0) return { released: 0 };

    const redis = getRedisClient();
    const useRedis = isRedisHealthy() && redis !== null;

    if (useRedis) {
      try {
        const keys = seatIds.map((seatId) => `lock:${sessionId}:${seatId}`);
        await redis.eval(RELEASE_SEATS_LUA, keys.length, ...keys, userId);
      } catch (err) {
        console.warn('⚠️ [SeatLock] Redis release failed:', err.message);
      }
    }

    // Release in memory store
    for (const seatId of seatIds) {
      const key = `lock:${sessionId}:${seatId}`;
      const existing = inMemoryLockStore.get(key);
      if (existing && existing.userId === userId) {
        inMemoryLockStore.delete(key);
      }
    }

    // Broadcast real-time Socket.IO event to all users
    broadcastToSession(sessionId, 'seat:unlocked', {
      seatIds,
      sessionId,
      releasedBy: userId,
    });

    return { success: true, released: seatIds.length };
  }

  /**
   * Get all active locked seat IDs for a given session
   * @param {string} sessionId
   * @returns {Promise<Set<string>>}
   */
  async getLockedSeatIds(sessionId) {
    const lockedSet = new Set();
    const redis = getRedisClient();
    const useRedis = isRedisHealthy() && redis !== null;

    if (useRedis) {
      try {
        const pattern = `lock:${sessionId}:*`;
        const keys = await redis.keys(pattern);
        for (const key of keys) {
          const seatId = key.split(':').pop();
          if (seatId) lockedSet.add(seatId);
        }
      } catch (err) {
        console.warn('⚠️ [SeatLock] Redis keys query failed, falling back:', err.message);
      }
    }

    // Merge in-memory store
    const now = Date.now();
    for (const [key, lock] of inMemoryLockStore.entries()) {
      if (key.startsWith(`lock:${sessionId}:`) && lock.expiresAt > now) {
        const seatId = key.split(':').pop();
        if (seatId) lockedSet.add(seatId);
      }
    }

    // Merge DB active pending locks
    const dbLocks = await prisma.bookingSeat.findMany({
      where: {
        sessionId,
        status: 'LOCKED',
        booking: {
          expiresAt: { gt: new Date() },
          status: 'PENDING',
        },
      },
      select: { venueSeatId: true },
    });

    for (const lock of dbLocks) {
      lockedSet.add(lock.venueSeatId);
    }

    return lockedSet;
  }
}

module.exports = new SeatLockService();
