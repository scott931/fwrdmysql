export interface Permission {
  view_courses: boolean;
  enroll_courses: boolean;
  create_courses: boolean;
  edit_courses: boolean;
  delete_courses: boolean;
  manage_users: boolean;
  view_analytics: boolean;
  manage_settings: boolean;
  access_audit_logs: boolean;
  create_admin_users: boolean;
  manage_instructors: boolean;
  view_admin_dashboard: boolean;
}

const ROLE_HIERARCHY: { [key: string]: number } = {
  super_admin: 3,
  admin: 2,
  content_manager: 1,
  user: 0,
};

export const ROLE_PERMISSIONS: Record<string, Permission> = {
  user: {
    view_courses: true,
    enroll_courses: true,
    create_courses: false,
    edit_courses: false,
    delete_courses: false,
    manage_users: false,
    view_analytics: false,
    manage_settings: false,
    access_audit_logs: false,
    create_admin_users: false,
    manage_instructors: false,
    view_admin_dashboard: true, // Changed to true to give all users access
  },
  content_manager: {
    view_courses: true,
    enroll_courses: true,
    create_courses: true,
    edit_courses: true,
    delete_courses: false,
    manage_users: false,
    view_analytics: false,
    manage_settings: false,
    access_audit_logs: false,
    create_admin_users: false,
    manage_instructors: false,
    view_admin_dashboard: true,
  },
  admin: {
    view_courses: true,
    enroll_courses: true,
    create_courses: true,
    edit_courses: true,
    delete_courses: true,
    manage_users: true,
    view_analytics: true,
    manage_settings: true,
    access_audit_logs: true,
    create_admin_users: true,
    manage_instructors: true,
    view_admin_dashboard: true,
  },
  super_admin: {
    view_courses: true,
    enroll_courses: true,
    create_courses: true,
    edit_courses: true,
    delete_courses: true,
    manage_users: true,
    view_analytics: true,
    manage_settings: true,
    access_audit_logs: true,
    create_admin_users: true,
    manage_instructors: true,
    view_admin_dashboard: true,
  },
};

export function getUserPermissions(role: string): Permission {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.user;
}

export function hasPermission(role: string, permission: keyof Permission): boolean {
  const permissions = getUserPermissions(role);
  return permissions[permission];
}

export function canAccessAdminDashboard(role: string): boolean {
  return hasPermission(role, 'view_admin_dashboard');
}

export function canCreateSuperAdmin(role: string): boolean {
  return role === 'super_admin';
}

export function canDeleteCourses(role: string): boolean {
  return hasPermission(role, 'delete_courses');
}

export function canManageUsers(role: string): boolean {
  return hasPermission(role, 'manage_users');
}

export function canAccessAuditLogs(role: string): boolean {
  return hasPermission(role, 'access_audit_logs');
}

export function canManageSettings(role: string): boolean {
  return hasPermission(role, 'manage_settings');
}

export function canCreateAdminUsers(role: string): boolean {
  return hasPermission(role, 'create_admin_users');
}

export function canManageInstructors(role: string): boolean {
  return hasPermission(role, 'manage_instructors');
}

export function getPermissionError(action: string, role: string): string {
  const roleDisplayName = role.replace('_', ' ').toUpperCase();

  switch (action) {
    case 'delete_courses':
      return `Access Denied: Only Admins and Super Admins can delete courses. Your current role (${roleDisplayName}) does not have this permission.`;
    case 'manage_users':
      return `Access Denied: Only Admins and Super Admins can manage users. Your current role (${roleDisplayName}) does not have this permission.`;
    case 'access_audit_logs':
      return `Access Denied: Only Admins and Super Admins can access audit logs. Your current role (${roleDisplayName}) does not have this permission.`;
    case 'manage_settings':
      return `Access Denied: Only Admins and Super Admins can manage platform settings. Your current role (${roleDisplayName}) does not have this permission.`;
    case 'create_admin_users':
      return `Access Denied: Only Admins and Super Admins can create admin users. Your current role (${roleDisplayName}) does not have this permission.`;
    case 'create_super_admin':
      return `Access Denied: Only Super Admins can create other Super Admin accounts. Your current role (${roleDisplayName}) does not have this permission.`;
    case 'view_admin_dashboard':
      return `Access Denied: You do not have permission to access the admin dashboard. Your current role (${roleDisplayName}) does not have administrative privileges.`;
    default:
      return `Access Denied: You do not have permission to perform this action. Your current role (${roleDisplayName}) does not have the required permissions.`;
  }
}

export function canPerformAction(userRole: string, requiredRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
}