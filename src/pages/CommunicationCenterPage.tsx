import React, { useState, useEffect } from 'react';
import { useNavigate } from '../lib/router';
import { ArrowLeft, MessageSquare, Mail, Bell, Send, Users, Filter, Search, Calendar, Clock, CheckCircle, AlertTriangle, Edit, Trash2, Plus, Eye, BarChart3, Settings } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionContext';

const CommunicationCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { userRole, hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState<'announcements' | 'emails' | 'notifications' | 'templates' | 'analytics' | 'settings'>('announcements');
  const [selectedAudience, setSelectedAudience] = useState<'all' | 'users' | 'instructors' | 'admins'>('all');

  // Communication data state
  const [communications, setCommunications] = useState({
    totalAnnouncements: 45,
    totalEmails: 1234,
    totalNotifications: 5678,
    openRate: 78.5,
    clickRate: 12.3,
    deliveryRate: 99.2
  });

  // Check if user is super admin
  const isSuperAdmin = userRole === 'super_admin';

  // Redirect if not super admin
  useEffect(() => {
    if (!isSuperAdmin) {
      navigate('/admin');
    }
  }, [isSuperAdmin, navigate]);

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Communication Center</h1>
              <p className="text-gray-400">Manage announcements, emails, and notifications</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center text-green-400">
              <MessageSquare className="h-4 w-4 mr-2" />
              <span className="text-sm">Super Admin Access</span>
            </div>
            <Button
              variant="primary"
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 mb-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'announcements', label: 'Announcements', icon: Bell },
              { id: 'emails', label: 'Emails', icon: Mail },
              { id: 'notifications', label: 'Notifications', icon: MessageSquare },
              { id: 'templates', label: 'Templates', icon: Edit },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`pb-4 relative flex items-center space-x-2 whitespace-nowrap ${
                  activeTab === id
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
                {activeTab === id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Announcements Tab */}
          {activeTab === 'announcements' && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Announcements</p>
                      <p className="text-2xl font-bold text-white">{communications.totalAnnouncements}</p>
                    </div>
                    <div className="bg-blue-600/20 p-3 rounded-lg">
                      <Bell className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Open Rate</p>
                      <p className="text-2xl font-bold text-white">{formatPercentage(communications.openRate)}</p>
                    </div>
                    <div className="bg-green-600/20 p-3 rounded-lg">
                      <Eye className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Delivery Rate</p>
                      <p className="text-2xl font-bold text-white">{formatPercentage(communications.deliveryRate)}</p>
                    </div>
                    <div className="bg-purple-600/20 p-3 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Announcements List */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Recent Announcements</h3>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search announcements..."
                        className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    <Button variant="outline" className="flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="primary" className="flex items-center">
                      <Plus className="h-4 w-4 mr-2" />
                      New Announcement
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-white font-medium mb-2">Platform Maintenance Notice</h4>
                        <p className="text-gray-400 text-sm mb-2">
                          Scheduled maintenance will occur on January 20th from 2:00 AM to 4:00 AM UTC.
                          During this time, the platform will be temporarily unavailable.
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Jan 15, 2024
                          </span>
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            All Users
                          </span>
                          <span className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            1,247 views
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-white font-medium mb-2">New Course Available</h4>
                        <p className="text-gray-400 text-sm mb-2">
                          We're excited to announce our new course on "Advanced Business Strategy"
                          taught by industry expert Dr. Sarah Johnson.
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Jan 12, 2024
                          </span>
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            All Users
                          </span>
                          <span className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            892 views
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Emails Tab */}
          {activeTab === 'emails' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Email Campaigns</h3>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="primary" className="flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    New Campaign
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Campaign Name</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Audience</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Sent</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Opened</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Clicked</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 px-4 text-gray-300">Welcome Series</td>
                      <td className="py-3 px-4 text-gray-300">New Users</td>
                      <td className="py-3 px-4 text-gray-300">1,234</td>
                      <td className="py-3 px-4 text-green-400">987 (80%)</td>
                      <td className="py-3 px-4 text-blue-400">123 (10%)</td>
                      <td className="py-3 px-4">
                        <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded text-xs">Active</span>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm">View</Button>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 px-4 text-gray-300">Course Reminder</td>
                      <td className="py-3 px-4 text-gray-300">Inactive Users</td>
                      <td className="py-3 px-4 text-gray-300">567</td>
                      <td className="py-3 px-4 text-green-400">234 (41%)</td>
                      <td className="py-3 px-4 text-blue-400">45 (8%)</td>
                      <td className="py-3 px-4">
                        <span className="bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded text-xs">Draft</span>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm">Edit</Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Push Notifications</h3>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="primary" className="flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    New Notification
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-2">Course Completion</h4>
                      <p className="text-gray-400 text-sm mb-2">
                        Congratulations! You've completed the "Business Fundamentals" course.
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          2 hours ago
                        </span>
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          Course Completers
                        </span>
                        <span className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Delivered
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-2">New Lesson Available</h4>
                      <p className="text-gray-400 text-sm mb-2">
                        A new lesson is available in your enrolled course "Digital Marketing".
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          1 day ago
                        </span>
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          Enrolled Students
                        </span>
                        <span className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Delivered
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-6">Message Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Welcome Email</h4>
                  <p className="text-gray-400 text-sm mb-4">
                    Template for welcoming new users to the platform.
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm">Use</Button>
                  </div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Course Reminder</h4>
                  <p className="text-gray-400 text-sm mb-4">
                    Template for reminding users about incomplete courses.
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm">Use</Button>
                  </div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Maintenance Notice</h4>
                  <p className="text-gray-400 text-sm mb-4">
                    Template for platform maintenance announcements.
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm">Use</Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-6">Communication Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-gray-300 font-medium mb-4">Delivery Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Emails Sent</span>
                      <span className="text-white font-medium">1,234</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Delivered</span>
                      <span className="text-green-400 font-medium">1,220 (99.2%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Opened</span>
                      <span className="text-blue-400 font-medium">987 (80.5%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Clicked</span>
                      <span className="text-purple-400 font-medium">123 (12.3%)</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-gray-300 font-medium mb-4">Audience Engagement</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Active Users</span>
                      <span className="text-white font-medium">892</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Notification Opt-ins</span>
                      <span className="text-green-400 font-medium">756 (84.8%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Email Subscribers</span>
                      <span className="text-blue-400 font-medium">1,089 (92.1%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Unsubscribed</span>
                      <span className="text-red-400 font-medium">23 (2.1%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-6">Communication Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Default Sender Email
                  </label>
                  <input
                    type="email"
                    defaultValue="noreply@forwardafrica.com"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Default Sender Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Forward Africa"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    Enable email notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    Enable push notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    Require email confirmation
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    Enable SMS notifications
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunicationCenterPage;