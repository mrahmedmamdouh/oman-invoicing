const { ForbiddenError } = require('../../shared/exceptions/AppError');

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message_ar: 'المصادقة مطلوبة'
      });
    }

    const userRole = req.user.role;
    
    if (Array.isArray(allowedRoles)) {
      if (!allowedRoles.includes(userRole)) {
        throw new ForbiddenError('Insufficient permissions');
      }
    } else {
      if (userRole !== allowedRoles) {
        throw new ForbiddenError('Insufficient permissions');
      }
    }

    next();
  };
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message_ar: 'المصادقة مطلوبة'
      });
    }

    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
};

module.exports = {
  requireRole,
  requirePermission
};
