const logger = require('../../shared/utils/logger');
const { AppError } = require('../../shared/exceptions/AppError');

const errorHandler = (err, req, res, next) => {
  let { statusCode = 500, message, message_ar } = err;

  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });

  // Handle different error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    message_ar = 'فشل في التحقق من صحة البيانات';
  }

  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Unauthorized access';
    message_ar = 'وصول غير مصرح به';
  }

  if (err.code === '23505') { // PostgreSQL unique constraint error
    statusCode = 409;
    message = 'Resource already exists';
    message_ar = 'المورد موجود بالفعل';
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal server error';
    message_ar = 'خطأ داخلي في الخادم';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    message_ar,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
