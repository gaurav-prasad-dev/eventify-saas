const { Server } = require('socket.io');
const env = require('./env');

let io = null;

/**
 * Initialize Socket.IO Server attached to Express HTTP server
 * @param {import('http').Server} httpServer
 */
function initSocket(httpServer) {
  const allowedOrigins = env.CORS_ORIGIN ? env.CORS_ORIGIN.split(',') : ['http://localhost:5173', 'http://localhost:3000'];

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 30000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    // Client joins a specific session room when opening the seat map
    socket.on('join:session', (sessionId) => {
      if (sessionId) {
        socket.join(`session:${sessionId}`);
      }
    });

    // Client leaves session room when navigating away
    socket.on('leave:session', (sessionId) => {
      if (sessionId) {
        socket.leave(`session:${sessionId}`);
      }
    });

    socket.on('disconnect', () => {
      // Socket disconnected
    });
  });

  console.log('📡 [Socket.IO] Real-Time WebSocket server initialized!');
  return io;
}

/**
 * Get active Socket.IO instance
 */
function getIO() {
  return io;
}

/**
 * Broadcast event to all users in a specific session room
 * @param {string} sessionId
 * @param {string} event
 * @param {object} payload
 */
function broadcastToSession(sessionId, event, payload) {
  if (io) {
    io.to(`session:${sessionId}`).emit(event, payload);
  }
}

module.exports = {
  initSocket,
  getIO,
  broadcastToSession,
};
