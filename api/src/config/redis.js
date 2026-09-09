const Redis = require('ioredis');
const env = require('./env');

let redisClient = null;
let isRedisAvailable = false;

if (env.REDIS_URL) {
  try {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 3) {
          console.warn('⚠️ [Redis] Max reconnection attempts reached. Using Database Fallback.');
          return null;
        }
        return Math.min(times * 200, 1000);
      },
      lazyConnect: true,
      connectTimeout: 10000,
    });

    redisClient.on('connect', () => {
      isRedisAvailable = true;
      console.log('⚡ [Redis] Successfully connected to Redis Cloud!');
    });

    redisClient.on('ready', () => {
      isRedisAvailable = true;
    });

    redisClient.on('error', (err) => {
      isRedisAvailable = false;
      console.warn('⚠️ [Redis Error]:', err.message);
    });

    redisClient.on('close', () => {
      isRedisAvailable = false;
    });

    // Initiate connection asynchronously
    redisClient.connect().catch((err) => {
      isRedisAvailable = false;
      console.warn('ℹ️ [Redis] Connection failed at startup. Will use In-Memory / DB Fallback:', err.message);
    });
  } catch (err) {
    console.warn('⚠️ [Redis Setup Error]:', err.message);
    redisClient = null;
    isRedisAvailable = false;
  }
} else {
  console.log('ℹ️ [Redis] No REDIS_URL configured. Operating in In-Memory / DB Fallback mode.');
}

const getRedisClient = () => redisClient;
const isRedisHealthy = () => isRedisAvailable && redisClient !== null && redisClient.status === 'ready';

module.exports = {
  redisClient,
  getRedisClient,
  isRedisHealthy,
};
