import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, MoreVertical, Shield, Ban, CheckCircle, XCircle, User, Mail, Calendar, Activity, Crown, UserPlus, Eye, Settings, Plus } from 'lucide-react';
import Button from '../components/ui/Button';
import { useNavigate } from '../lib/router';
import { usePermissions } from '../contexts/PermissionContext';
import PermissionGuard from '../components/ui/PermissionGuard';
import ErrorMessage from '../components/ui/ErrorMessage';

interface UserData {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'suspended' | 'pending';
  role: 'user' | 'content_manager' | 'admin' | 'super_admin';
  joinDate: string;
  lastActive: string;
  coursesEnrolled: number;
  coursesCompleted: number;
  avatar?: string;
  permissions?: {
    view_courses: boolean;
    enroll_courses: boolean;
    create_courses: boolean;
    edit_courses: boolean;
    delete_courses: boolean;
    manage_users: boolean;
    view_analytics: boolean;
    manage_settings: boolean;
    access_audit_logs: boolean;
  };
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'content_manager' | 'admin' | 'super_admin';
  password: string;
  createdAt: Date;
  createdBy: string;
}

const ManageUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { userRole, hasPermission } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'pending'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'content_manager' | 'admin' | 'super_admin'>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Check if user has permission to manage users
  const canManageUsers = hasPermission('manage_users');

  // Redirect if user doesn't have permission
  if (!canManageUsers) {
    return (
      <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <PermissionGuard
          permission="manage_users"
          role={userRole}
          showError={true}
        />
      </div>
    );
  }

  // Load admin users from localStorage
  useEffect(() => {
    const savedAdminUsers = localStorage.getItem('adminUsers');
    if (savedAdminUsers) {
      const parsedUsers = JSON.parse(savedAdminUsers).map((user: any) => ({
        ...user,
        createdAt: new Date(user.createdAt)
      }));
      setAdminUsers(parsedUsers);
    }
  }, []);

  // Clear permission error after 5 seconds
  useEffect(() => {
    if (permissionError) {
      const timer = setTimeout(() => {
        setPermissionError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [permissionError]);

  // Check current user role
  const currentUserRole = userRole;
  const canCreateSuperAdmin = currentUserRole === 'super_admin';

  // Mock user data with permissions
  const [users, setUsers] = useState<UserData[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      status: 'active',
      role: 'user',
      joinDate: '2024-01-15',
      lastActive: '2024-01-20',
      coursesEnrolled: 5,
      coursesCompleted: 3,
      permissions: {
        view_courses: true,
        enroll_courses: true,
        create_courses: false,
        edit_courses: false,
        delete_courses: false,
        manage_users: false,
        view_analytics: false,
        manage_settings: false,
        access_audit_logs: false
      }
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      status: 'active',
      role: 'admin',
      joinDate: '2024-01-10',
      lastActive: '2024-01-19',
      coursesEnrolled: 8,
      coursesCompleted: 6,
      permissions: {
        view_courses: true,
        enroll_courses: true,
        create_courses: true,
        edit_courses: true,
        delete_courses: true,
        manage_users: true,
        view_analytics: true,
        manage_settings: true,
        access_audit_logs: true
      }
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      status: 'suspended',
      role: 'user',
      joinDate: '2024-01-05',
      lastActive: '2024-01-18',
      coursesEnrolled: 2,
      coursesCompleted: 1,
      permissions: {
        view_courses: true,
        enroll_courses: false,
        create_courses: false,
        edit_courses: false,
        delete_courses: false,
        manage_users: false,
        view_analytics: false,
        manage_settings: false,
        access_audit_logs: false
      }
    },
    {
      id: '4',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      status: 'active',
      role: 'content_manager',
      joinDate: '2024-01-20',
      lastActive: '2024-01-20',
      coursesEnrolled: 1,
      coursesCompleted: 0,
      permissions: {
        view_courses: true,
        enroll_courses: true,
        create_courses: true,
        edit_courses: true,
        delete_courses: false,
        manage_users: false,
        view_analytics: false,
        manage_settings: false,
        access_audit_logs: false
      }
    }
  ]);

  // Add admin users to the users list
  useEffect(() => {
    if (adminUsers.length > 0) {
      // Convert admin users to user data format
      const adminUserData = adminUsers.map(admin => {
        // Check if this admin user is already in the users list
        const existingUser = users.find(user => user.email === admin.email);
        if (existingUser) return null;

        return {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          status: 'active' as const,
          role: admin.role,
          joinDate: admin.createdAt.toISOString().split('T')[0],
          lastActive: new Date().toISOString().split('T')[0],
          coursesEnrolled: 0,
          coursesCompleted: 0,
          permissions: getRolePermissions(admin.role)
        };
      }).filter(Boolean) as UserData[];

      // Add new admin users to the users list
      if (adminUserData.length > 0) {
        setUsers(prev => [...prev, ...adminUserData]);
      }
    }
  }, [adminUsers]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const logAuditEvent = (action: string, details: string) => {
    const auditLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      user: localStorage.getItem('adminEmail') || 'Unknown',
      action,
      details,
      ipAddress: '192.168.1.100'
    };

    const existingLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
    existingLogs.unshift(auditLog);
    localStorage.setItem('auditLogs', JSON.stringify(existingLogs.slice(0, 1000)));
  };

  const handleUserAction = (userId: string, action: 'view' | 'suspend' | 'activate' | 'delete' | 'promote' | 'permissions') => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    // Check permissions for actions
    if (action === 'delete' && !hasPermission('manage_users')) {
      setPermissionError('You do not have permission to delete users. This action requires Admin or Super Admin privileges.');
      return;
    }

    if ((action === 'suspend' || action === 'activate') && !hasPermission('manage_users')) {
      setPermissionError('You do not have permission to change user status. This action requires Admin or Super Admin privileges.');
      return;
    }

    // Check if trying to modify a higher role user
    if (['suspend', 'activate', 'delete', 'permissions'].includes(action)) {
      if (
        (user.role === 'super_admin' && currentUserRole !== 'super_admin') ||
        (user.role === 'admin' && currentUserRole !== 'super_admin' && currentUserRole !== 'admin')
      ) {
        setPermissionError(`You cannot modify a ${user.role.replace('_', ' ')} account with your current role (${currentUserRole.replace('_', ' ')}).`);
        return;
      }
    }

    switch (action) {
      case 'view':
        setSelectedUser(user);
        setShowUserModal(true);
        logAuditEvent('user_viewed', `Viewed user profile: ${user.name} (${user.email})`);
        break;
      case 'suspend':
        setUsers(prev => prev.map(u =>
          u.id === userId ? { ...u, status: 'suspended' as const } : u
        ));
        logAuditEvent('user_suspended', `Suspended user: ${user.name} (${user.email})`);
        break;
      case 'activate':
        setUsers(prev => prev.map(u =>
          u.id === userId ? { ...u, status: 'active' as const } : u
        ));
        logAuditEvent('user_activated', `Activated user: ${user.name} (${user.email})`);
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
          setUsers(prev => prev.filter(u => u.id !== userId));
          logAuditEvent('user_deleted', `Deleted user: ${user.name} (${user.email})`);
        }
        break;
      case 'promote':
        setSelectedUser(user);
        setShowUserModal(true);
        break;
      case 'permissions':
        setSelectedUser(user);
        setShowPermissionsModal(true);
        logAuditEvent('user_permissions_viewed', `Viewed permissions for: ${user.name} (${user.email})`);
        break;
    }
  };

  const handleBulkAction = (action: 'suspend' | 'activate' | 'delete') => {
    if (selectedUsers.length === 0) return;

    // Check permissions for bulk actions
    if (!hasPermission('manage_users')) {
      setPermissionError('You do not have permission to perform bulk user actions. This action requires Admin or Super Admin privileges.');
      return;
    }

    if (action === 'delete') {
      if (!confirm(`Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`)) {
        return;
      }
    }

    // Check if any selected users have higher roles
    const hasHigherRoleUsers = users
      .filter(user => selectedUsers.includes(user.id))
      .some(user =>
        (user.role === 'super_admin' && currentUserRole !== 'super_admin') ||
        (user.role === 'admin' && currentUserRole !== 'super_admin' && currentUserRole !== 'admin')
      );

    if (hasHigherRoleUsers) {
      setPermissionError('You cannot modify some selected users because they have higher roles than your current role.');
      return;
    }

    selectedUsers.forEach(userId => {
      handleUserAction(userId, action);
    });
    setSelectedUsers([]);
  };

  const handlePromoteUser = (userId: string, newRole: 'user' | 'content_manager' | 'admin' | 'super_admin') => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    // Check if current user can promote to this role
    if (newRole === 'super_admin' && currentUserRole !== 'super_admin') {
      setPermissionError('Only super admins can promote users to super admin role');
      return;
    }

    // Check if current user can promote to admin role
    if (newRole === 'admin' && !['admin', 'super_admin'].includes(currentUserRole)) {
      setPermissionError('Only admins and super admins can promote users to admin role');
      return;
    }

    const rolePermissions = getRolePermissions(newRole);

    setUsers(prev => prev.map(u =>
      u.id === userId ? {
        ...u,
        role: newRole,
        permissions: rolePermissions
      } : u
    ));
    logAuditEvent('user_role_changed', `Changed user role: ${user.name} (${user.email}) from ${user.role} to ${newRole}`);
    setShowUserModal(false);
  };

  const handlePermissionChange = (userId: string, permission: string, value: boolean) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    // Check if current user can modify permissions
    if (
      (user.role === 'super_admin' && currentUserRole !== 'super_admin') ||
      (user.role === 'admin' && !['admin', 'super_admin'].includes(currentUserRole))
    ) {
      setPermissionError(`You cannot modify permissions for a ${user.role.replace('_', ' ')} account with your current role.`);
      return;
    }

    setUsers(prev => prev.map(u =>
      u.id === userId ? {
        ...u,
        permissions: { ...u.permissions, [permission]: value }
      } : u
    ));
    logAuditEvent('user_permission_changed', `Changed permission ${permission} to ${value} for: ${user.name} (${user.email})`);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-500/20 text-green-500',
      suspended: 'bg-red-500/20 text-red-500',
      pending: 'bg-yellow-500/20 text-yellow-500'
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      user: 'bg-gray-500/20 text-gray-400',
      content_manager: 'bg-green-500/20 text-green-400',
      admin: 'bg-blue-500/20 text-blue-400',
      super_admin: 'bg-purple-500/20 text-purple-400'
    };
    return styles[role as keyof typeof styles] || styles.user;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <Crown className="h-4 w-4 text-purple-500" />;
      case 'admin': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'content_manager': return <UserPlus className="h-4 w-4 text-green-500" />;
      default: return <User className="h-4 w-4 text-gray-400" />;
    }
  };

  function getRolePermissions(role: string): any {
    const permissions = {
      user: {
        view_courses: true,
        enroll_courses: true,
        create_courses: false,
        edit_courses: false,
        delete_courses: false,
        manage_users: false,
        view_analytics: false,
        manage_settings: false,
        access_audit_logs: false
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
        access_audit_logs: false
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
        access_audit_logs: true
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
        access_audit_logs: true
      }
    };

    return permissions[role as keyof typeof permissions] || permissions.user;
  }

  return (
    <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      {/* Permission Error Message */}
      {permissionError && (
        <div className="mb-6">
          <ErrorMessage
            title="Permission Denied"
            message={permissionError}
            onClose={() => setPermissionError(null)}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin')}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <p className="text-gray-400 mt-2">Manage user accounts, roles, and permissions</p>
          </div>
        </div>

        <PermissionGuard permission="create_admin_users" role={userRole}>
          <Button
            variant="primary"
            onClick={() => navigate('/admin/create-user')}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Admin User
          </Button>
        </PermissionGuard>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="content_manager">Content Manager</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="mt-4 flex items-center gap-4">
            <span className="text-gray-400">{selectedUsers.length} users selected</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('activate')}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Activate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('suspend')}
              >
                <Ban className="h-4 w-4 mr-2" />
                Suspend
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                className="text-red-500 border-red-500 hover:bg-red-500/10"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(filteredUsers.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    className="rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Courses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(prev => [...prev, user.id]);
                        } else {
                          setSelectedUsers(prev => prev.filter(id => id !== user.id));
                        }
                      }}
                      className="rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center mr-4">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          <User className="h-5 w-5 text-gray-300" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{user.name}</div>
                        <div className="text-sm text-gray-400 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getRoleIcon(user.role)}
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getRoleBadge(user.role)}`}>
                        {user.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(user.status)}`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="flex items-center space-x-4">
                      <span>{user.coursesCompleted}/{user.coursesEnrolled}</span>
                      <div className="w-16 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full"
                          style={{
                            width: `${user.coursesEnrolled > 0 ? (user.coursesCompleted / user.coursesEnrolled) * 100 : 0}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 mr-2 text-gray-400" />
                      {new Date(user.lastActive).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUserAction(user.id, 'view')}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUserAction(user.id, 'permissions')}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Permissions
                      </Button>

                      {user.status === 'active' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserAction(user.id, 'suspend')}
                          className="text-red-500 border-red-500 hover:bg-red-500/10"
                        >
                          <Ban className="h-3 w-3 mr-1" />
                          Suspend
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserAction(user.id, 'activate')}
                          className="text-green-500 border-green-500 hover:bg-green-500/10"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Activate
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-white text-lg font-medium mb-2">No users found</h3>
            <p className="text-gray-400">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-green-500/10 p-3 rounded-lg mr-4">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {users.filter(u => u.status === 'active').length}
              </div>
              <div className="text-sm text-gray-400">Active Users</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-red-500/10 p-3 rounded-lg mr-4">
              <Ban className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {users.filter(u => u.status === 'suspended').length}
              </div>
              <div className="text-sm text-gray-400">Suspended</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-blue-500/10 p-3 rounded-lg mr-4">
              <Shield className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {users.filter(u => u.role === 'admin' || u.role === 'super_admin').length}
              </div>
              <div className="text-sm text-gray-400">Admins</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-yellow-500/10 p-3 rounded-lg mr-4">
              <Calendar className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {users.filter(u => {
                  const joinDate = new Date(u.joinDate);
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  return joinDate > thirtyDaysAgo;
                }).length}
              </div>
              <div className="text-sm text-gray-400">New (30 days)</div>
            </div>
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">User Profile & Role Management</h3>
              <Button
                variant="ghost"
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </Button>
            </div>

            {/* User Info */}
            <div className="flex items-center mb-6">
              <div className="h-16 w-16 rounded-full bg-gray-600 flex items-center justify-center mr-4">
                {selectedUser.avatar ? (
                  <img src={selectedUser.avatar} alt={selectedUser.name} className="h-16 w-16 rounded-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-gray-300" />
                )}
              </div>
              <div>
                <div className="text-white font-bold text-lg">{selectedUser.name}</div>
                <div className="text-gray-400">{selectedUser.email}</div>
                <div className="flex items-center mt-2">
                  {getRoleIcon(selectedUser.role)}
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getRoleBadge(selectedUser.role)}`}>
                    {selectedUser.role.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{selectedUser.coursesCompleted}</div>
                <div className="text-sm text-gray-400">Completed</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{selectedUser.coursesEnrolled}</div>
                <div className="text-sm text-gray-400">Enrolled</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {new Date(selectedUser.joinDate).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-400">Joined</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {new Date(selectedUser.lastActive).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-400">Last Active</div>
              </div>
            </div>

            {/* Role Management */}
            <div className="mb-6">
              <h4 className="text-white font-medium mb-3">Role Management</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { role: 'user', label: 'User', icon: <User className="h-4 w-4" /> },
                  { role: 'content_manager', label: 'Content Manager', icon: <UserPlus className="h-4 w-4" /> },
                  { role: 'admin', label: 'Admin', icon: <Shield className="h-4 w-4" />, disabled: !['admin', 'super_admin'].includes(currentUserRole) },
                  { role: 'super_admin', label: 'Super Admin', icon: <Crown className="h-4 w-4" />, disabled: !canCreateSuperAdmin }
                ].map(({ role, label, icon, disabled }) => (
                  <Button
                    key={role}
                    variant={selectedUser.role === role ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => !disabled && handlePromoteUser(selectedUser.id, role as any)}
                    className="flex items-center justify-center"
                    disabled={selectedUser.role === role || disabled}
                  >
                    {icon}
                    <span className="ml-2 text-xs">{label}</span>
                    {disabled && <span className="ml-1 text-xs">(Restricted)</span>}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowUserModal(false)}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowUserModal(false);
                  setShowPermissionsModal(true);
                }}
                className="flex-1"
              >
                Edit Permissions
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">User Permissions</h3>
              <Button
                variant="ghost"
                onClick={() => setShowPermissionsModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </Button>
            </div>

            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-600 flex items-center justify-center mr-4">
                  <User className="h-6 w-6 text-gray-300" />
                </div>
                <div>
                  <div className="text-white font-bold">{selectedUser.name}</div>
                  <div className="text-gray-400">{selectedUser.email}</div>
                </div>
              </div>
            </div>

            {/* Permission Error */}
            {permissionError && (
              <div className="mb-6">
                <ErrorMessage
                  title="Permission Error"
                  message={permissionError}
                  onClose={() => setPermissionError(null)}
                />
              </div>
            )}

            <div className="space-y-4">
              <h4 className="text-white font-medium">Individual Permissions</h4>

              {selectedUser.permissions && Object.entries(selectedUser.permissions).map(([permission, value]) => {
                // Check if current user can modify this permission for this user
                const canModify = !(
                  (selectedUser.role === 'super_admin' && currentUserRole !== 'super_admin') ||
                  (selectedUser.role === 'admin' && !['admin', 'super_admin'].includes(currentUserRole))
                );

                return (
                  <div key={permission} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div>
                      <div className="text-white font-medium">
                        {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {getPermissionDescription(permission)}
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handlePermissionChange(selectedUser.id, permission, e.target.checked)}
                        className="sr-only peer"
                        disabled={!canModify || (selectedUser.role === 'user' && !['view_courses', 'enroll_courses'].includes(permission))}
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                );
              })}
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowPermissionsModal(false)}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowPermissionsModal(false);
                  logAuditEvent('user_permissions_updated', `Updated permissions for: ${selectedUser.name} (${selectedUser.email})`);
                }}
                className="flex-1"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const getPermissionDescription = (permission: string): string => {
  const descriptions: { [key: string]: string } = {
    view_courses: 'Can view and browse available courses',
    enroll_courses: 'Can enroll in courses and access content',
    create_courses: 'Can create new courses and upload content',
    edit_courses: 'Can edit existing course content and details',
    delete_courses: 'Can delete courses from the platform',
    manage_users: 'Can view, edit, and manage user accounts',
    view_analytics: 'Can access analytics and reporting data',
    manage_settings: 'Can modify platform settings and configuration',
    access_audit_logs: 'Can view system audit logs and activity'
  };
  return descriptions[permission] || 'Permission description not available';
};

export default ManageUsersPage;