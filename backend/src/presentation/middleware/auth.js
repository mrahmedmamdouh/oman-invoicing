const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const logger = require('../../shared/utils/logger');

const authMiddleware = async (req, res, next) => {
  try {
    const token = extractTokenFromRequest(req);
    
    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        message_ar: 'المصادقة مطلوبة'
      });
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    
    // You would typically fetch user from database here
    req.user = decoded;
    
    next();
  } catch (error) {
    logger.warn('Authentication failed:', { error: error.message, ip: req.ip });
    
    return res.status(401).json({
      error: 'Invalid or expired token',
      message_ar: 'رمز غير صالح أو منتهي الصلاحية'
    });
  }
};

const extractTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
};

module.exports = authMiddleware;
