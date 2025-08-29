const logger = require('../../shared/utils/logger');
const { db } = require('../../config/database');

const auditLogger = (action) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the audit entry
      if (req.user && res.statusCode < 400) {
        logAuditEntry(req, action, data);
      }
      originalSend.call(this, data);
    };

    next();
  };
};

const logAuditEntry = async (req, action, responseData) => {
  try {
    const auditData = {
      user_id: req.user.id,
      entity_type: getEntityTypeFromPath(req.path),
      entity_id: req.params.id || null,
      action,
      old_values: req.method === 'PUT' ? req.body : null,
      new_values: req.method === 'POST' ? responseData : null,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      created_at: new Date()
    };

    await db('audit_logs').insert(auditData);
  } catch (error) {
    logger.error('Failed to log audit entry', { error: error.message });
  }
};

const getEntityTypeFromPath = (path) => {
  if (path.includes('/invoices')) return 'Invoice';
  if (path.includes('/customers')) return 'Customer';
  if (path.includes('/users')) return 'User';
  if (path.includes('/reports')) return 'Report';
  return 'Unknown';
};

module.exports = {
  auditLogger
};
