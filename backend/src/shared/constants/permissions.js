const PERMISSIONS = require('./status').PERMISSIONS;
const USER_ROLES = require('./status').USER_ROLES;

const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    // All permissions
    ...Object.values(PERMISSIONS)
  ],
  
  [USER_ROLES.MANAGER]: [
    // Invoice permissions
    PERMISSIONS.CREATE_INVOICE,
    PERMISSIONS.EDIT_INVOICE,
    PERMISSIONS.FINALIZE_INVOICE,
    PERMISSIONS.SEND_INVOICE,
    PERMISSIONS.VIEW_INVOICE,
    
    // Customer permissions
    PERMISSIONS.MANAGE_CUSTOMERS,
    PERMISSIONS.VIEW_CUSTOMERS,
    
    // Report permissions
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    
    // Limited system permissions
    PERMISSIONS.MANAGE_TAX,
    PERMISSIONS.MANAGE_PEPPOL,
    PERMISSIONS.VIEW_AUDIT_LOGS
  ],
  
  [USER_ROLES.ACCOUNTANT]: [
    // Invoice permissions
    PERMISSIONS.CREATE_INVOICE,
    PERMISSIONS.EDIT_INVOICE,
    PERMISSIONS.FINALIZE_INVOICE,
    PERMISSIONS.SEND_INVOICE,
    PERMISSIONS.VIEW_INVOICE,
    
    // Customer permissions
    PERMISSIONS.MANAGE_CUSTOMERS,
    PERMISSIONS.VIEW_CUSTOMERS,
    
    // Report permissions
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    
    // Tax permissions
    PERMISSIONS.MANAGE_TAX
  ],
  
  [USER_ROLES.USER]: [
    // Basic invoice permissions
    PERMISSIONS.CREATE_INVOICE,
    PERMISSIONS.EDIT_INVOICE,
    PERMISSIONS.VIEW_INVOICE,
    
    // View customers
    PERMISSIONS.VIEW_CUSTOMERS,
    
    // View reports
    PERMISSIONS.VIEW_REPORTS
  ],
  
  [USER_ROLES.VIEWER]: [
    // View only permissions
    PERMISSIONS.VIEW_INVOICE,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.VIEW_REPORTS
  ]
};

const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

const hasPermission = (userRole, requiredPermission) => {
  const permissions = getRolePermissions(userRole);
  return permissions.includes(requiredPermission);
};

const hasAnyPermission = (userRole, requiredPermissions = []) => {
  const permissions = getRolePermissions(userRole);
  return requiredPermissions.some(permission => permissions.includes(permission));
};

const hasAllPermissions = (userRole, requiredPermissions = []) => {
  const permissions = getRolePermissions(userRole);
  return requiredPermissions.every(permission => permissions.includes(permission));
};

module.exports = {
  ROLE_PERMISSIONS,
  getRolePermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions
};