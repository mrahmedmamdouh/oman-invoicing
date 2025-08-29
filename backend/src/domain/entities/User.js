const { v4: uuidv4 } = require('uuid');

class User {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.username = data.username;
    this.email = data.email;
    this.passwordHash = data.passwordHash;
    this.fullName = data.fullName;
    this.fullNameAr = data.fullNameAr;
    this.role = data.role || 'user'; // admin, manager, accountant, user
    this.isActive = data.isActive !== false;
    this.taxRegistrationNumber = data.taxRegistrationNumber;
    this.commercialRegistrationNumber = data.commercialRegistrationNumber;
    this.language = data.language || 'ar';
    this.lastLoginAt = data.lastLoginAt;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    
    // Permissions based on role
    this.permissions = this.getPermissionsByRole(this.role);
  }

  getPermissionsByRole(role) {
    const rolePermissions = {
      admin: [
        'create_invoice', 'edit_invoice', 'delete_invoice', 'finalize_invoice',
        'view_reports', 'manage_customers', 'manage_settings', 'manage_users'
      ],
      manager: [
        'create_invoice', 'edit_invoice', 'finalize_invoice',
        'view_reports', 'manage_customers'
      ],
      accountant: [
        'create_invoice', 'edit_invoice', 'finalize_invoice',
        'view_reports', 'manage_customers'
      ],
      user: [
        'create_invoice', 'edit_invoice', 'view_reports'
      ]
    };

    return rolePermissions[role] || rolePermissions.user;
  }

  hasPermission(permission) {
    return this.permissions.includes(permission);
  }

  validate() {
    const errors = [];

    if (!this.username || this.username.length < 3) {
      errors.push('Username must be at least 3 characters');
    }

    if (!this.email || !/\S+@\S+\.\S+/.test(this.email)) {
      errors.push('Valid email is required');
    }

    if (!this.fullName) {
      errors.push('Full name is required');
    }

    if (!['admin', 'manager', 'accountant', 'user'].includes(this.role)) {
      errors.push('Invalid role');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = { User };
