const { redisClient } = require('../../config/redis');
const logger = require('../../shared/utils/logger');

class RedisCache {
  constructor() {
    this.client = redisClient;
    this.defaultTTL = 3600; // 1 hour
  }

  async get(key) {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis get error', { key, error: error.message });
      return null;
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    try {
      const serializedValue = JSON.stringify(value);
      await this.client.setex(key, ttl, serializedValue);
      return true;
    } catch (error) {
      logger.error('Redis set error', { key, error: error.message });
      return false;
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis delete error', { key, error: error.message });
      return false;
    }
  }

  async exists(key) {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis exists error', { key, error: error.message });
      return false;
    }
  }

  async increment(key, increment = 1) {
    try {
      return await this.client.incrby(key, increment);
    } catch (error) {
      logger.error('Redis increment error', { key, error: error.message });
      return null;
    }
  }

  async setHash(key, field, value, ttl = this.defaultTTL) {
    try {
      await this.client.hset(key, field, JSON.stringify(value));
      await this.client.expire(key, ttl);
      return true;
    } catch (error) {
      logger.error('Redis hash set error', { key, field, error: error.message });
      return false;
    }
  }

  async getHash(key, field) {
    try {
      const value = await this.client.hget(key, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis hash get error', { key, field, error: error.message });
      return null;
    }
  }

  async getAllHash(key) {
    try {
      const hash = await this.client.hgetall(key);
      const result = {};
      
      for (const [field, value] of Object.entries(hash)) {
        result[field] = JSON.parse(value);
      }
      
      return result;
    } catch (error) {
      logger.error('Redis hash getall error', { key, error: error.message });
      return {};
    }
  }

  // Cache patterns for common operations
  async cacheInvoice(invoice) {
    const key = `invoice:${invoice.id}`;
    return await this.set(key, invoice, 1800); // 30 minutes
  }

  async getCachedInvoice(invoiceId) {
    const key = `invoice:${invoiceId}`;
    return await this.get(key);
  }

  async cacheCustomer(customer) {
    const key = `customer:${customer.id}`;
    return await this.set(key, customer, 3600); // 1 hour
  }

  async getCachedCustomer(customerId) {
    const key = `customer:${customerId}`;
    return await this.get(key);
  }

  async cacheReport(reportType, params, data) {
    const paramsHash = Buffer.from(JSON.stringify(params)).toString('base64');
    const key = `report:${reportType}:${paramsHash}`;
    return await this.set(key, data, 900); // 15 minutes
  }

  async getCachedReport(reportType, params) {
    const paramsHash = Buffer.from(JSON.stringify(params)).toString('base64');
    const key = `report:${reportType}:${paramsHash}`;
    return await this.get(key);
  }

  // Session management
  async setUserSession(userId, sessionData) {
    const key = `session:${userId}`;
    return await this.set(key, sessionData, 86400); // 24 hours
  }

  async getUserSession(userId) {
    const key = `session:${userId}`;
    return await this.get(key);
  }

  async invalidateUserSession(userId) {
    const key = `session:${userId}`;
    return await this.del(key);
  }

  // Rate limiting
  async checkRateLimit(identifier, maxRequests, windowSeconds) {
    const key = `rate_limit:${identifier}`;
    
    try {
      const current = await this.client.get(key);
      
      if (current === null) {
        await this.client.setex(key, windowSeconds, 1);
        return { allowed: true, remaining: maxRequests - 1 };
      }
      
      const count = parseInt(current);
      if (count >= maxRequests) {
        const ttl = await this.client.ttl(key);
        return { 
          allowed: false, 
          remaining: 0, 
          resetTime: Date.now() + (ttl * 1000) 
        };
      }
      
      await this.client.incr(key);
      return { allowed: true, remaining: maxRequests - count - 1 };
    } catch (error) {
      logger.error('Rate limit check error', { identifier, error: error.message });
      return { allowed: true, remaining: maxRequests }; // Fail open
    }
  }
}

module.exports = new RedisCache();
