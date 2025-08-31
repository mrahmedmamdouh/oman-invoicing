const rateLimit = require('express-rate-limit');
const { RateLimiterMemory, RateLimiterRedis } = require('rate-limiter-flexible');

let redisClient;
try {
  redisClient = require('../../config/redis').redisClient;
} catch (error) {
  console.warn('Redis not available, using memory rate limiting');
  redisClient = null;
}

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

// Rate limiting for create operations
const createLimiter = createRateLimiter({
  keyGenerator: (req) => req.ip,
  points: 20, // requests
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

// Simple rate limiting fallback if rate-limiter-flexible fails
const simpleRateLimit = (maxRequests = 100, windowMs = 60000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const now = Date.now();
    const ip = req.ip;
    
    if (!requests.has(ip)) {
      requests.set(ip, []);
    }
    
    const userRequests = requests.get(ip);
    const windowStart = now - windowMs;
    
    // Clean old requests
    const validRequests = userRequests.filter(time => time > windowStart);
    requests.set(ip, validRequests);
    
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message_ar: 'تم تجاوز الحد المسموح للطلبات'
      });
    }
    
    validRequests.push(now);
    next();
  };
};

module.exports = {
  standardLimit: process.env.NODE_ENV === 'test' 
    ? (req, res, next) => next() 
    : customRateLimit(standardLimiter),
  loginLimit: process.env.NODE_ENV === 'test' 
    ? (req, res, next) => next() 
    : customRateLimit(authLimiter),
  downloadLimit: process.env.NODE_ENV === 'test' 
    ? (req, res, next) => next() 
    : customRateLimit(downloadLimiter),
  createLimit: process.env.NODE_ENV === 'test' 
    ? (req, res, next) => next() 
    : customRateLimit(createLimiter),
  expressRateLimit,
  
  // Fallback simple rate limits
  simpleStandardLimit: simpleRateLimit(100, 60000),
  simpleLoginLimit: simpleRateLimit(5, 900000),
  simpleCreateLimit: simpleRateLimit(20, 60000)
};