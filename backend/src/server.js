require('dotenv').config();
const app = require('./app');
const { connectDatabase } = require('./config/database');
const { connectRedis } = require('./config/redis');
const logger = require('./shared/utils/logger');

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('✅ Database connected successfully');
    
    // Connect to Redis (optional - app will work without it)
    try {
      const redisClient = await connectRedis();
      if (redisClient) {
        logger.info('✅ Redis connected successfully');
      } else {
        logger.warn('⚠️ Redis not available, continuing without caching');
      }
    } catch (redisError) {
      logger.warn('⚠️ Redis connection failed, continuing without Redis:', redisError.message);
    }
    
    // Start server
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Oman Invoicing Backend running on port ${PORT}`);
      logger.info(`📱 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🌐 Server accessible at http://localhost:${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();