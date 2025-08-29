module.exports = {
  INVOICE_STATUS: {
    DRAFT: 'draft',
    SENT: 'sent',
    PAID: 'paid',
    OVERDUE: 'overdue',
    CANCELLED: 'cancelled',
    PARTIALLY_PAID: 'partially_paid'
  },

  PAYMENT_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded'
  },

  CUSTOMER_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
    BLOCKED: 'blocked'
  },

  TAX_STATUS: {
    TAXABLE: 'taxable',
    EXEMPT: 'exempt',
    ZERO_RATED: 'zero_rated',
    OUT_OF_SCOPE: 'out_of_scope'
  },

  PEPPOL_STATUS: {
    PENDING: 'pending',
    SENT: 'sent',
    DELIVERED: 'delivered',
    FAILED: 'failed',
    ACKNOWLEDGED: 'acknowledged'
  },

  DIGITAL_SIGNATURE_STATUS: {
    VALID: 'valid',
    INVALID: 'invalid',
    EXPIRED: 'expired',
    REVOKED: 'revoked',
    UNKNOWN: 'unknown'
  },

  AUDIT_ACTIONS: {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete',
    FINALIZE: 'finalize',
    SEND: 'send',
    CANCEL: 'cancel',
    LOGIN: 'login',
    LOGOUT: 'logout'
  },

  USER_ROLES: {
    ADMIN: 'admin',
    MANAGER: 'manager',
    ACCOUNTANT: 'accountant',
    USER: 'user',
    VIEWER: 'viewer'
  },

  PERMISSIONS: {
    // Invoice permissions
    CREATE_INVOICE: 'create_invoice',
    EDIT_INVOICE: 'edit_invoice',
    DELETE_INVOICE: 'delete_invoice',
    FINALIZE_INVOICE: 'finalize_invoice',
    SEND_INVOICE: 'send_invoice',
    VIEW_INVOICE: 'view_invoice',
    
    // Customer permissions
    MANAGE_CUSTOMERS: 'manage_customers',
    VIEW_CUSTOMERS: 'view_customers',
    
    // Report permissions
    VIEW_REPORTS: 'view_reports',
    EXPORT_REPORTS: 'export_reports',
    
    // System permissions
    MANAGE_SETTINGS: 'manage_settings',
    MANAGE_USERS: 'manage_users',
    MANAGE_TAX: 'manage_tax',
    
    // Compliance permissions
    MANAGE_DIGITAL_SIGNATURE: 'manage_digital_signature',
    MANAGE_PEPPOL: 'manage_peppol',
    VIEW_AUDIT_LOGS: 'view_audit_logs'
  }
};
