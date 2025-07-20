import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '../../types';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

/**
 * PermissionGuard Component
 * Conditionally renders children based on user permissions
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null
}) => {
  const { user } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  const userPermissions = user.permissions || [];
  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(userPermissions, permission);
  } else if (permissions) {
    if (requireAll) {
      hasAccess = hasAllPermissions(userPermissions, permissions);
    } else {
      hasAccess = hasAnyPermission(userPermissions, permissions);
    }
  } else {
    // If no permissions specified, allow access
    hasAccess = true;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGuard;