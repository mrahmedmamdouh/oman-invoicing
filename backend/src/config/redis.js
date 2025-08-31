const { createClient } = require('redis');
const logger = require('../shared/utils/logger');

let client = null;

const createRedisClient = () => {
  if (!client) {
    client = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
      },
      password: process.env.REDIS_PASSWORD || undefined,
      database: process.env.REDIS_DB || 0,
      lazyConnect: true
    });

    client.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    client.on('connect', () => {
      logger.info('🔴 Redis connected successfully');
    });

    client.on('ready', () => {
      logger.info('🔴 Redis ready');
    });

    client.on('end', () => {
      logger.warn('🔴 Redis connection ended');
    });
  }
  
  return client;
};

const connectRedis = async () => {
  try {
    if (!client) {
      client = createRedisClient();
    }
    
    if (!client.isOpen) {
      await client.connect();
    }
    
    logger.info('🔴 Redis connected successfully');
    return client;
  } catch (error) {
    logger.warn('⚠️ Redis connection failed, continuing without Redis:', error.message);
    return null; // Return null instead of throwing to allow app to continue
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  if (client && client.isOpen) {
    await client.quit();
    logger.info('Redis connection closed.');
  }
});

module.exports = {
  redisClient: client,
  connectRedis,
  createRedisClient
};