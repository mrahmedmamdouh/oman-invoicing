const logger = require('../../shared/utils/logger');

class AuditService {
  constructor(auditRepository) {
    this.auditRepository = auditRepository;
  }

  async logActivity(auditData) {
    try {
      const auditEntry = {
        id: require('uuid').v4(),
        userId: auditData.userId,
        entityType: auditData.entityType,
        entityId: auditData.entityId,
        action: auditData.action,
        oldValues: auditData.oldValues ? JSON.stringify(auditData.oldValues) : null,
        newValues: auditData.newValues ? JSON.stringify(auditData.newValues) : null,
        ipAddress: auditData.ipAddress,
        userAgent: auditData.userAgent,
        timestamp: new Date(),
        metadata: auditData.metadata || {}
      };

      await this.auditRepository.create(auditEntry);
      
      logger.info('Audit entry created', {
        userId: auditEntry.userId,
        action: auditEntry.action,
        entityType: auditEntry.entityType,
        entityId: auditEntry.entityId
      });

      return auditEntry;
    } catch (error) {
      logger.error('Failed to create audit entry', {
        error: error.message,
        auditData
      });
      // Don't throw error to avoid breaking main operation
    }
  }
  async getAuditTrail(entityType, entityId, options = {}) {
    try {
      const { startDate, endDate, actions, userId, limit = 100 } = options;
      
      const filters = {
        entityType,
        entityId
      };

      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      if (actions) filters.actions = actions;
      if (userId) filters.userId = userId;

      return await this.auditRepository.findByFilters(filters, { limit });
    } catch (error) {
      logger.error('Failed to get audit trail', { error: error.message });
      return [];
    }
  }

  async getUserActivity(userId, options = {}) {
    try {
      const { startDate, endDate, entityTypes, limit = 100 } = options;
      
      const filters = { userId };
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      if (entityTypes) filters.entityTypes = entityTypes;

      return await this.auditRepository.findByFilters(filters, { limit });
    } catch (error) {
      logger.error('Failed to get user activity', { error: error.message });
      return [];
    }
  }

  async getSystemActivity(options = {}) {
    try {
      const { startDate, endDate, actions, entityTypes, limit = 100 } = options;
      
      const filters = {};
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      if (actions) filters.actions = actions;
      if (entityTypes) filters.entityTypes = entityTypes;

      return await this.auditRepository.findByFilters(filters, { limit });
    } catch (error) {
      logger.error('Failed to get system activity', { error: error.message });
      return [];
    }
  }

  // Audit specific business events
  async logInvoiceCreated(invoice, userId, ipAddress) {
    return await this.logActivity({
      userId,
      entityType: 'Invoice',
      entityId: invoice.id,
      action: 'create',
      newValues: {
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.customerId,
        totalAmount: invoice.totalAmount,
        status: invoice.status
      },
      ipAddress
    });
  }

  async logInvoiceFinalized(invoice, userId, ipAddress) {
    return await this.logActivity({
      userId,
      entityType: 'Invoice',
      entityId: invoice.id,
      action: 'finalize',
      oldValues: { status: 'draft' },
      newValues: { 
        status: 'sent',
        finalizedAt: new Date(),
        digitalSignature: !!invoice.digitalSignature
      },
      ipAddress
    });
  }

  async logCustomerCreated(customer, userId, ipAddress) {
    return await this.logActivity({
      userId,
      entityType: 'Customer',
      entityId: customer.id,
      action: 'create',
      newValues: {
        name: customer.name,
        email: customer.email,
        customerType: customer.customerType
      },
      ipAddress
    });
  }

  async logUserLogin(user, ipAddress, userAgent) {
    return await this.logActivity({
      userId: user.id,
      entityType: 'User',
      entityId: user.id,
      action: 'login',
      ipAddress,
      userAgent,
      metadata: {
        loginTime: new Date(),
        role: user.role
      }
    });
  }

  async logUserLogout(userId, ipAddress) {
    return await this.logActivity({
      userId,
      entityType: 'User',
      entityId: userId,
      action: 'logout',
      ipAddress,
      metadata: {
        logoutTime: new Date()
      }
    });
  }

  async logSecurityEvent(eventType, userId, details, ipAddress) {
    return await this.logActivity({
      userId,
      entityType: 'Security',
      entityId: userId,
      action: eventType, // 'password_change', 'failed_login', 'account_locked', etc.
      ipAddress,
      metadata: {
        eventType,
        details,
        timestamp: new Date()
      }
    });
  }
}

module.exports = AuditService;
