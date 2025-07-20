import React from 'react';
import { AlertTriangle, Shield, Lock } from 'lucide-react';
import { hasPermission, getPermissionError } from '../../utils/permissions';
import Button from './Button';

interface PermissionGuardProps {
  permission: string;
  role: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showError?: boolean;
  onUnauthorized?: () => void;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  role,
  children,
  fallback,
  showError = false,
  onUnauthorized
}) => {
  const hasAccess = hasPermission(role, permission as any);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (onUnauthorized) {
    onUnauthorized();
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showError) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-red-500/20 p-3 rounded-full">
            <Lock className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <h3 className="text-white text-lg font-semibold mb-2">Access Denied</h3>
        <p className="text-red-400 text-sm mb-4">
          {getPermissionError(permission, role)}
        </p>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="text-red-500 border-red-500 hover:bg-red-500/10"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return null;
};

export default PermissionGuard;