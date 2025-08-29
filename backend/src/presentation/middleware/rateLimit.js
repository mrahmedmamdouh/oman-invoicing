const rateLimit = require('express-rate-limit');
const { RateLimiterMemory, RateLimiterRedis } = require('rate-limiter-flexible');
const { redisClient } = require('../../config/redis');

// Create different rate limiters
const createRateLimiter = (options) => {
  const useRedis = redisClient && process.env.NODE_ENV === 'production';
  
  if (useRedis) {
    return new RateLimiterRedis({
      storeClient: redisClient,
      ...options
    });
  }
  
  return new RateLimiterMemory(options);
};

// Standard API rate limiting
const standardLimiter = createRateLimiter({
  keyGenerator: (req) => req.ip,
  points: 100, // requests
  duration: 60, // per 60 seconds
});

// Stricter rate limiting for authentication
const authLimiter = createRateLimiter({
  keyGenerator: (req) => req.ip,
  points: 5, // requests
  duration: 60 * 15, // per 15 minutes
});

// Rate limiting for file downloads
const downloadLimiter = createRateLimiter({
  keyGenerator: (req) => req.ip,
  points: 10, // requests  
  duration: 60, // per minute
});

// Express rate limiter middleware
const expressRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: 'Too many requests',
    message_ar: 'طلبات كثيرة جداً'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Custom rate limit middleware
const customRateLimit = (limiter) => async (req, res, next) => {
  try {
    await limiter.consume(req.ip);
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    
    res.set('Retry-After', String(secs));
    res.status(429).json({
      error: 'Rate limit exceeded',
      message_ar: 'تم تجاوز الحد المسموح للطلبات',
      retryAfter: secs
    });
  }
};

module.exports = {
  standardLimit: customRateLimit(standardLimiter),
  loginLimit: customRateLimit(authLimiter),
  downloadLimit: customRateLimit(downloadLimiter),
  createLimit: customRateLimit(standardLimiter),
  expressRateLimit
};
