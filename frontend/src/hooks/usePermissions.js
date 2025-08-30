import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/slices/authSlice';
import { PERMISSIONS, ROLES } from '../utils/constants';

export const usePermissions = () => {
  const user = useSelector(selectCurrentUser);

  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  const hasRole = (role) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  const hasAnyPermission = (permissions) => {
    if (!Array.isArray(permissions)) return false;
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions) => {
    if (!Array.isArray(permissions)) return false;
    return permissions.every(permission => hasPermission(permission));
  };

  const canAccessInvoices = () => {
    return hasAnyPermission([
      PERMISSIONS.CREATE_INVOICE,
      PERMISSIONS.EDIT_INVOICE,
      PERMISSIONS.VIEW_INVOICE
    ]);
  };

  const canManageCustomers = () => {
    return hasPermission(PERMISSIONS.MANAGE_CUSTOMERS);
  };

  const canViewReports = () => {
    return hasPermission(PERMISSIONS.VIEW_REPORTS);
  };

  const canManageSettings = () => {
    return hasPermission(PERMISSIONS.MANAGE_SETTINGS);
  };

  const isAdmin = () => {
    return hasRole(ROLES.ADMIN);
  };

  const isManager = () => {
    return hasAnyRole([ROLES.ADMIN, ROLES.MANAGER]);
  };

  const canFinalizeInvoices = () => {
    return hasPermission(PERMISSIONS.FINALIZE_INVOICE);
  };

  return {
    user,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    canAccessInvoices,
    canManageCustomers,
    canViewReports,
    canManageSettings,
    canFinalizeInvoices,
    isAdmin,
    isManager
  };
};
