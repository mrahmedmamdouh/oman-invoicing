const { createClient } = require('redis');
const logger = require('../shared/utils/logger');

const client = createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
});

const connectRedis = async () => {
  try {
    await client.connect();
    logger.info('🔴 Redis connected successfully');
    return client;
  } catch (error) {
    logger.error('❌ Redis connection failed:', error);
    throw error;
  }
};

client.on('error', (err) => {
  logger.error('Redis Client Error', err);
});

module.exports = {
  redisClient: client,
  connectRedis
};