import { useAuth } from '../contexts/AuthContext';
import { useCallback } from 'react';

export const useAuthEnhanced = () => {
  const auth = useAuth();

  // Enhanced login with better error handling
  const login = useCallback(async (email: string, password: string) => {
    try {
      await auth.signIn({ email, password });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }, [auth]);

  // Enhanced logout with cleanup
  const logout = useCallback(async () => {
    try {
      await auth.signOut();
      // Clear any additional local storage or state
      localStorage.removeItem('forward_africa_token');
      localStorage.removeItem('forward_africa_user');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Logout failed'
      };
    }
  }, [auth]);

  // Check if user has specific permission
  const hasPermission = useCallback((permission: string) => {
    return auth.user?.permissions?.includes(permission) || false;
  }, [auth.user]);

  // Check if user has any of the specified roles
  const hasRole = useCallback((roles: string[]) => {
    return auth.user?.role ? roles.includes(auth.user.role) : false;
  }, [auth.user]);

  // Check if user is admin (super_admin or admin)
  const isAdmin = useCallback(() => {
    return auth.isAdmin || auth.isSuperAdmin;
  }, [auth.isAdmin, auth.isSuperAdmin]);

  // Get user's display name
  const getDisplayName = useCallback(() => {
    return auth.user?.full_name || auth.user?.email || 'Unknown User';
  }, [auth.user]);

  // Check if user has completed onboarding
  const hasCompletedOnboarding = useCallback(() => {
    return auth.user?.onboarding_completed || false;
  }, [auth.user]);

  // Get user's role display name
  const getRoleDisplayName = useCallback(() => {
    const roleMap: Record<string, string> = {
      'super_admin': 'Super Administrator',
      'admin': 'Administrator',
      'content_manager': 'Content Manager',
      'community_manager': 'Community Manager',
      'user_support': 'User Support',
      'user': 'User'
    };
    return auth.user?.role ? roleMap[auth.user.role] || auth.user.role : 'Unknown';
  }, [auth.user]);

  return {
    // Basic auth state
    user: auth.user,
    loading: auth.loading,
    error: auth.error,
    isAuthenticated: auth.isAuthenticated,

    // Role checks
    isAdmin: auth.isAdmin,
    isSuperAdmin: auth.isSuperAdmin,
    hasRole,
    isAdminUser: isAdmin(), // Renamed to avoid conflict

    // Permission checks
    hasPermission,

    // User info
    getDisplayName,
    getRoleDisplayName,
    hasCompletedOnboarding,

    // Auth actions
    login,
    logout,
    signUp: auth.signUp,
    updateProfile: auth.updateProfile,
    refreshToken: auth.refreshToken,
    clearError: auth.clearError,
    checkAuthStatus: auth.checkAuthStatus,

    // Raw auth context (for advanced usage)
    auth
  };
};