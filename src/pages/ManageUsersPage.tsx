import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, User, Mail, Activity, Plus, Shield, Ban, CheckCircle, Eye, Settings, Loader2 } from 'lucide-react';
import Button from '../components/ui/Button';
import { useNavigate } from '../lib/router';
import { usePermissions } from '../contexts/PermissionContext';
import PermissionGuard from '../components/ui/PermissionGuard';
import ErrorMessage from '../components/ui/ErrorMessage';
import { useUsers } from '../hooks/useDatabase';

interface UserData {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'suspended' | 'pending';
  role: 'user' | 'content_manager' | 'community_manager' | 'user_support' | 'super_admin';
  joinDate: string;
  lastActive: string;
  coursesEnrolled: number;
  coursesCompleted: number;
  avatar?: string;
}

const ManageUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { userRole, hasPermission } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'pending'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'content_manager' | 'community_manager' | 'user_support' | 'super_admin'>('all');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);

  // Database hooks
  const {
    users: dbUsers,
    loading: usersLoading,
    error: usersError,
    fetchAllUsers,
    updateUser
  } = useUsers();

  // Check if user has permission to manage users
  const canManageUsers = hasPermission('users:view');

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
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

  // Fetch users from database on component mount
  useEffect(() => {
    fetchAllUsers();
  }, []);

  // Convert database users to UserData format when dbUsers changes
  useEffect(() => {
    if (dbUsers && dbUsers.length > 0) {
      const convertedUsers: UserData[] = dbUsers.map(dbUser => ({
        id: dbUser.id,
        name: dbUser.full_name || 'Unknown User',
        email: dbUser.email,
        status: 'active', // Default to active since we don't have status field in DB
        role: dbUser.role || 'user',
        joinDate: dbUser.created_at ? new Date(dbUser.created_at).toISOString().split('T')[0] : 'Unknown',
        lastActive: dbUser.updated_at ? new Date(dbUser.updated_at).toISOString().split('T')[0] : 'Unknown',
        coursesEnrolled: 0, // Will be calculated from user_progress table later
        coursesCompleted: 0, // Will be calculated from user_progress table later
        avatar: dbUser.avatar_url
      }));
      setUsers(convertedUsers);
    } else {
      setUsers([]);
    }
  }, [dbUsers]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleUserAction = (userId: string, action: 'view' | 'suspend' | 'activate' | 'delete' | 'permissions') => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    // Check permissions for actions
    if (action === 'delete' && !hasPermission('users:delete')) {
      setPermissionError('You do not have permission to delete users. This action requires Admin or Super Admin privileges.');
      return;
    }

    if ((action === 'suspend' || action === 'activate') && !hasPermission('users:suspend')) {
      setPermissionError('You do not have permission to change user status. This action requires Admin or Super Admin privileges.');
      return;
    }

    switch (action) {
      case 'view':
        // TODO: Implement user detail view
        console.log('View user:', user);
        break;
      case 'suspend':
        setUsers(prev => prev.map(u =>
          u.id === userId ? { ...u, status: 'suspended' as const } : u
        ));
        break;
      case 'activate':
        setUsers(prev => prev.map(u =>
          u.id === userId ? { ...u, status: 'active' as const } : u
        ));
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
          setUsers(prev => prev.filter(u => u.id !== userId));
        }
        break;
      case 'permissions':
        // TODO: Implement permissions modal
        console.log('Edit permissions for:', user);
        break;
    }
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
      community_manager: 'bg-blue-500/20 text-blue-400',
      user_support: 'bg-yellow-500/20 text-yellow-400',
      super_admin: 'bg-purple-500/20 text-purple-400'
    };
    return styles[role as keyof typeof styles] || styles.user;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <Shield className="h-4 w-4 text-purple-500" />;
      case 'content_manager': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'community_manager': return <User className="h-4 w-4 text-green-500" />;
      case 'user_support': return <User className="h-4 w-4 text-yellow-500" />;
      default: return <User className="h-4 w-4 text-gray-400" />;
    }
  };

  // Redirect if user doesn't have permission
  if (!canManageUsers) {
    return (
      <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-400">You do not have permission to manage users.</p>
        </div>
      </div>
    );
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

        <PermissionGuard permission="users:create">
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
              <option value="community_manager">Community Manager</option>
              <option value="user_support">User Support</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
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
              {usersLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center space-x-3">
                      <Loader2 className="h-6 w-6 animate-spin text-red-500" />
                      <span className="text-gray-400">Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : usersError ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-center">
                      <div className="text-red-500 mb-2">Failed to load users</div>
                      <div className="text-gray-400 text-sm mb-4">{usersError}</div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchAllUsers()}
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        Retry
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-center">
                      <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <div className="text-gray-400 mb-2">No users found</div>
                      <div className="text-gray-500 text-sm">
                        {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
                          ? 'Try adjusting your filters'
                          : 'No users have been registered yet'
                        }
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700/50">
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
                ))
              )}
            </tbody>
          </table>
        </div>
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
                {users.filter(u => u.role === 'content_manager' || u.role === 'super_admin').length}
              </div>
              <div className="text-sm text-gray-400">Admins</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-yellow-500/10 p-3 rounded-lg mr-4">
              <User className="h-6 w-6 text-yellow-500" />
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
    </div>
  );
};

export default ManageUsersPage;