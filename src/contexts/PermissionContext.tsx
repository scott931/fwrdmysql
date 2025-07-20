import React, { createContext, useContext, useEffect, useState } from 'react';
import { Permission, getUserPermissions } from '../utils/permissions';
import { useAuth } from './AuthContext';

interface PermissionContextType {
  userRole: string;
  permissions: Permission;
  hasPermission: (permission: keyof Permission) => boolean;
  checkPermission: (permission: keyof Permission) => { hasAccess: boolean; errorMessage: string };
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const [userRole, setUserRole] = useState<string>('user');
  const [permissions, setPermissions] = useState<Permission>(getUserPermissions('user'));

  useEffect(() => {
    // Get user role from AuthContext profile
    const role = profile?.role || 'user';
    setUserRole(role);
    setPermissions(getUserPermissions(role));
  }, [profile]);

  const hasPermission = (permission: keyof Permission): boolean => {
    return permissions[permission];
  };

  const checkPermission = (permission: keyof Permission) => {
    const hasAccess = hasPermission(permission);
    const errorMessage = hasAccess ? '' : `You don't have permission to ${permission.replace('_', ' ')}`;

    return { hasAccess, errorMessage };
  };

  return (
    <PermissionContext.Provider value={{ userRole, permissions, hasPermission, checkPermission }}>
      {children}
    </PermissionContext.Provider>
  );
};