const app = require('./app');
const env = require('./config/env');

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Eventify API server running on port ${PORT} [${env.NODE_ENV}]`);
  console.log(`👉 Health check: http://localhost:${PORT}/api/v1/health`);
});

// Graceful Shutdown Handler
const handleGracefulShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  server.close(() => {
    console.log('✅ HTTP server closed. Process exiting.');
    process.exit(0);
  });

  // Force close after 10 seconds if server hasn't finished closing
  setTimeout(() => {
    console.error('⚠️ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

// Unhandled Promise Rejections
process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down...');
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});

// Uncaught Exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err);
  process.exit(1);
});
