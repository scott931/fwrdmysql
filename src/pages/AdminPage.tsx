import React, { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  Shield,
  Activity,
  TrendingUp,
  Award,
  UserPlus,
  Search,
  Filter,
  Download,
  Upload,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Calendar,
  DollarSign,
  Target,
  Zap,
  PlayCircle,
  GraduationCap,
  MessageSquare,
  Globe,
  Crown
} from 'lucide-react';
import { useNavigate } from '../lib/router';
import Button from '../components/ui/Button';
import { getAllCourses, getAllCategories, getAllInstructors } from '../data/mockData';
import { Course, Category, Instructor } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { usePermissions } from '../contexts/PermissionContext';
import { useAuth } from '../contexts/AuthContext';
import ErrorMessage from '../components/ui/ErrorMessage';
import PermissionGuard from '../components/ui/PermissionGuard';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'instructors' | 'analytics' | 'audit'>('dashboard');
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedInstructor, setSelectedInstructor] = useState<string>('all');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Get user permissions
  const { userRole, hasPermission } = usePermissions();
  const { profile } = useAuth();

  // Get admin role from context
  const adminRole = userRole;
  const adminEmail = profile?.email || 'admin@forwardafrica.com';
  const canAccessAudit = hasPermission('audit:view_logs');
  const canManageUsers = hasPermission('users:view');
  const canManageSettings = hasPermission('system:configuration');
  const canCreateAdminUsers = hasPermission('users:create');
  const canDeleteCourses = hasPermission('courses:delete');
  const canManageInstructors = hasPermission('instructors:view');

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Load data on component mount and listen for changes
  useEffect(() => {
    const loadData = () => {
      setCourses(getAllCourses());
      setCategories(getAllCategories());
      setInstructors(getAllInstructors());
    };

    loadData();

    // Listen for storage changes
    const handleStorageChange = () => {
      loadData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('coursesUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('coursesUpdated', handleStorageChange);
    };
  }, []);

  // Initialize instructors in localStorage if not present
  useEffect(() => {
    const savedInstructors = localStorage.getItem('instructors');
    if (!savedInstructors) {
      // Add the current mock instructors to localStorage
      localStorage.setItem('instructors', JSON.stringify(getAllInstructors()));
      console.log('Initialized instructors in localStorage');
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

  const handleDeleteCourse = (courseId: string) => {
    if (!canDeleteCourses) {
      setPermissionError('You do not have permission to delete courses. This action requires Admin or Super Admin privileges.');
      return;
    }

    if (confirm('Are you sure you want to delete this course?')) {
      const savedCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      const updatedCourses = savedCourses.filter((c: Course) => c.id !== courseId);
      localStorage.setItem('courses', JSON.stringify(updatedCourses));

      const course = courses.find(c => c.id === courseId);
      logAuditEvent('course_deleted', `Deleted course: ${course?.title}`);

      // Trigger update
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleDeleteInstructor = (instructorId: string) => {
    if (!canManageInstructors) {
      setPermissionError('You do not have permission to delete instructors. This action requires Content Manager, Admin, or Super Admin privileges.');
      return;
    }

    if (confirm('Are you sure you want to delete this instructor? This will affect all courses they are assigned to.')) {
      const savedInstructors = JSON.parse(localStorage.getItem('instructors') || '[]');
      const updatedInstructors = savedInstructors.filter((i: Instructor) => i.id !== instructorId);
      localStorage.setItem('instructors', JSON.stringify(updatedInstructors));

      const instructor = instructors.find(i => i.id === instructorId);
      logAuditEvent('instructor_deleted', `Deleted instructor: ${instructor?.name}`);

      // Trigger update
      window.dispatchEvent(new Event('storage'));
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesInstructor = selectedInstructor === 'all' || course.instructorId === selectedInstructor;

    return matchesSearch && matchesCategory && matchesInstructor;
  });

  const filteredInstructors = instructors.filter(instructor =>
    instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Enhanced Analytics data
  const totalStudents = 1250;
  const activeStudents = 890;
  const totalInstructors = instructors.length;
  const totalCourses = courses.length;
  const completionRate = 78.5;
  const monthlyRevenue = 45000;
  const avgSessionDuration = 24; // minutes
  const totalWatchTime = 15420; // hours
  const certificatesIssued = 342;
  const userRetentionRate = 85.2;

  // Time-based data for charts
  const getTimeRangeData = (range: string) => {
    switch (range) {
      case '7d':
        return [
          { period: 'Mon', students: 120, revenue: 3200, engagement: 85, completions: 12 },
          { period: 'Tue', students: 135, revenue: 3600, engagement: 88, completions: 15 },
          { period: 'Wed', students: 142, revenue: 3800, engagement: 82, completions: 18 },
          { period: 'Thu', students: 158, revenue: 4200, engagement: 90, completions: 22 },
          { period: 'Fri', students: 165, revenue: 4400, engagement: 87, completions: 25 },
          { period: 'Sat', students: 178, revenue: 4800, engagement: 92, completions: 28 },
          { period: 'Sun', students: 145, revenue: 3900, engagement: 89, completions: 20 },
        ];
      case '90d':
        return [
          { period: 'Month 1', students: 3200, revenue: 85000, engagement: 84, completions: 280 },
          { period: 'Month 2', students: 3600, revenue: 95000, engagement: 87, completions: 320 },
          { period: 'Month 3', students: 4100, revenue: 108000, engagement: 89, completions: 380 },
        ];
      case '1y':
        return [
          { period: 'Q1', students: 8900, revenue: 240000, engagement: 82, completions: 850 },
          { period: 'Q2', students: 10200, revenue: 275000, engagement: 85, completions: 980 },
          { period: 'Q3', students: 11800, revenue: 315000, engagement: 88, completions: 1150 },
          { period: 'Q4', students: 13500, revenue: 360000, engagement: 91, completions: 1320 },
        ];
      default: // 30d
        return [
          { period: 'Week 1', students: 800, revenue: 21000, engagement: 83, completions: 65 },
          { period: 'Week 2', students: 950, revenue: 25000, engagement: 86, completions: 78 },
          { period: 'Week 3', students: 1100, revenue: 29000, engagement: 88, completions: 92 },
          { period: 'Week 4', students: 1250, revenue: 33000, engagement: 90, completions: 105 },
        ];
    }
  };

  const timeRangeData = getTimeRangeData(analyticsTimeRange);

  const categoryData = categories.map(category => ({
    name: category.name,
    courses: courses.filter(course => course.category === category.id).length,
    students: Math.floor(Math.random() * 500) + 100,
    revenue: Math.floor(Math.random() * 15000) + 5000
  }));

  const topPerformingCourses = courses
    .map(course => ({
      ...course,
      enrollments: Math.floor(Math.random() * 500) + 50,
      rating: (Math.random() * 1.5 + 3.5).toFixed(1),
      revenue: Math.floor(Math.random() * 8000) + 2000
    }))
    .sort((a, b) => b.enrollments - a.enrollments)
    .slice(0, 5);

  const userEngagementData = [
    { metric: 'Daily Active Users', value: 420, change: '+12%', trend: 'up' },
    { metric: 'Weekly Active Users', value: 1250, change: '+8%', trend: 'up' },
    { metric: 'Monthly Active Users', value: 3200, change: '+15%', trend: 'up' },
    { metric: 'Session Duration', value: '24 min', change: '+5%', trend: 'up' },
    { metric: 'Pages per Session', value: 4.2, change: '-2%', trend: 'down' },
    { metric: 'Bounce Rate', value: '32%', change: '-8%', trend: 'up' },
  ];

  const revenueBreakdown = [
    { source: 'Course Sales', amount: 28500, percentage: 63.3, color: '#ef4444' },
    { source: 'Subscriptions', amount: 12000, percentage: 26.7, color: '#3b82f6' },
    { source: 'Certificates', amount: 3200, percentage: 7.1, color: '#10b981' },
    { source: 'Partnerships', amount: 1300, percentage: 2.9, color: '#f59e0b' },
  ];

  const auditLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

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
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage courses, instructors, and platform settings</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-white font-medium">{adminRole === 'super_admin' ? 'Super Administrator' : adminRole === 'content_manager' ? 'Content Manager' : 'Administrator'}</p>
            <p className="text-gray-400 text-sm">{adminEmail}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/admin/profile')}
            className="flex items-center"
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700 mb-8">
        <div className="flex space-x-8 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3, permission: 'analytics:view' },
            { id: 'courses', label: 'Courses', icon: BookOpen, permission: 'courses:view' },
            { id: 'instructors', label: 'Instructors', icon: Users, permission: 'instructors:view' },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp, permission: 'analytics:view' },
            { id: 'audit', label: 'Audit Logs', icon: Activity, permission: 'audit:view_logs' }
          ].map(({ id, label, icon: Icon, permission }) => (
            <PermissionGuard key={id} permission={permission}>
              <button
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
            </PermissionGuard>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center">
                <div className="bg-blue-500/10 p-3 rounded-lg mr-4">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{totalStudents.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Total Students</div>
                  <div className="text-xs text-green-400 mt-1">+12% this month</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center">
                <div className="bg-green-500/10 p-3 rounded-lg mr-4">
                  <UserPlus className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{activeStudents.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Active Students</div>
                  <div className="text-xs text-green-400 mt-1">+8% this week</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center">
                <div className="bg-red-500/10 p-3 rounded-lg mr-4">
                  <BookOpen className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{totalCourses}</div>
                  <div className="text-sm text-gray-400">Total Courses</div>
                  <div className="text-xs text-blue-400 mt-1">{courses.filter(c => c.comingSoon).length} coming soon</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center">
                <div className="bg-purple-500/10 p-3 rounded-lg mr-4">
                  <DollarSign className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">${monthlyRevenue.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Monthly Revenue</div>
                  <div className="text-xs text-green-400 mt-1">+15% vs last month</div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center">
                <div className="bg-yellow-500/10 p-3 rounded-lg mr-4">
                  <Target className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{completionRate}%</div>
                  <div className="text-sm text-gray-400">Completion Rate</div>
                  <div className="text-xs text-green-400 mt-1">+3% this month</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center">
                <div className="bg-cyan-500/10 p-3 rounded-lg mr-4">
                  <Clock className="h-6 w-6 text-cyan-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{avgSessionDuration}m</div>
                  <div className="text-sm text-gray-400">Avg Session</div>
                  <div className="text-xs text-green-400 mt-1">+5% this week</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center">
                <div className="bg-orange-500/10 p-3 rounded-lg mr-4">
                  <PlayCircle className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{totalWatchTime.toLocaleString()}h</div>
                  <div className="text-sm text-gray-400">Total Watch Time</div>
                  <div className="text-xs text-green-400 mt-1">+22% this month</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center">
                <div className="bg-emerald-500/10 p-3 rounded-lg mr-4">
                  <GraduationCap className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{certificatesIssued}</div>
                  <div className="text-sm text-gray-400">Certificates Issued</div>
                  <div className="text-xs text-green-400 mt-1">+18% this month</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <PermissionGuard permission="courses:create">
                <Button
                  variant="primary"
                  onClick={() => navigate('/admin/upload-course')}
                  className="flex items-center justify-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Course
                </Button>
              </PermissionGuard>

              <PermissionGuard permission="instructors:create">
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/add-instructor')}
                  className="flex items-center justify-center"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Instructor
                </Button>
              </PermissionGuard>

              <PermissionGuard permission="users:create">
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/create-user')}
                  className="flex items-center justify-center"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Create Admin
                </Button>
              </PermissionGuard>

              <PermissionGuard permission="users:view">
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/manage-users')}
                  className="flex items-center justify-center"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </PermissionGuard>

              <PermissionGuard permission="system:configuration">
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/security-settings')}
                  className="flex items-center justify-center"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </PermissionGuard>
            </div>
          </div>

          {/* Super Admin Features */}
          {userRole === 'super_admin' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Crown className="h-5 w-5 mr-2 text-yellow-500" />
                Super Admin Controls
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/system-configuration')}
                  className="flex items-center justify-center bg-red-600/10 border-red-600/20 text-red-400 hover:bg-red-600/20"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  System Config
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/financial-management')}
                  className="flex items-center justify-center bg-green-600/10 border-green-600/20 text-green-400 hover:bg-green-600/20"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Financial Mgmt
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/communication-center')}
                  className="flex items-center justify-center bg-blue-600/10 border-blue-600/20 text-blue-400 hover:bg-blue-600/20"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Communication
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/security-center')}
                  className="flex items-center justify-center bg-purple-600/10 border-purple-600/20 text-purple-400 hover:bg-purple-600/20"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Security Center
                </Button>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {auditLogs.slice(0, 5).map((log: any) => (
                <div key={log.id} className="flex items-center justify-between py-3 border-b border-gray-700">
                  <div>
                    <p className="text-white">{log.details}</p>
                    <p className="text-gray-400 text-sm">{new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">
                    {log.action.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              ))}

              {auditLogs.length === 0 && (
                <div className="text-center py-6">
                  <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <PermissionGuard
          permission="courses:view"
        >
          <div className="space-y-6">
            {/* Course Management Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Course Management</h2>
                <p className="text-gray-400">Manage all courses and content</p>
              </div>
              <PermissionGuard permission="courses:create">
                <Button
                  variant="primary"
                  onClick={() => navigate('/admin/upload-course')}
                  className="flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Course
                </Button>
              </PermissionGuard>
            </div>

            {/* Filters */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                <select
                  value={selectedInstructor}
                  onChange={(e) => setSelectedInstructor(e.target.value)}
                  className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Instructors</option>
                  {instructors.map(instructor => (
                    <option key={instructor.id} value={instructor.id}>{instructor.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Courses Table */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Instructor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Lessons</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredCourses.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="h-12 w-12 rounded-lg object-cover mr-4"
                            />
                            <div>
                              <div className="text-sm font-medium text-white flex items-center">
                                {course.title}
                                {course.featured && <Star className="h-4 w-4 text-yellow-500 ml-2" />}
                              </div>
                              <div className="text-sm text-gray-400 line-clamp-1">{course.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={course.instructor.image}
                              alt={course.instructor.name}
                              className="h-8 w-8 rounded-full object-cover mr-3"
                            />
                            <div>
                              <div className="text-sm font-medium text-white">{course.instructor.name}</div>
                              <div className="text-sm text-gray-400">{course.instructor.title}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">
                            {categories.find(c => c.id === course.category)?.name || course.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {course.comingSoon ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Coming Soon
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400 flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Published
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {course.lessons.length} lessons
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/course/${course.id}`)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>

                            <PermissionGuard permission="courses:edit">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/admin/upload-course?edit=${course.id}`)}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                            </PermissionGuard>

                            <PermissionGuard permission="courses:delete">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteCourse(course.id)}
                                className="text-red-500 border-red-500 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </PermissionGuard>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredCourses.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white text-lg font-medium mb-2">No courses found</h3>
                  <p className="text-gray-400 mb-4">Get started by creating your first course.</p>
                  <PermissionGuard permission="courses:create">
                    <Button
                      variant="primary"
                      onClick={() => navigate('/admin/upload-course')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Course
                    </Button>
                  </PermissionGuard>
                </div>
              )}
            </div>
          </div>
        </PermissionGuard>
      )}

              {activeTab === 'instructors' && (
          <PermissionGuard
            permission="instructors:view"
          >
          <div className="space-y-6">
            {/* Instructor Management Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Instructor Management</h2>
                <p className="text-gray-400">Manage instructor profiles and assignments</p>
              </div>
              <Button
                variant="primary"
                onClick={() => navigate('/admin/add-instructor')}
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Instructor
              </Button>
            </div>

            {/* Search */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search instructors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Instructors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInstructors.map((instructor) => {
                const instructorCourses = courses.filter(course => course.instructorId === instructor.id);

                return (
                  <div key={instructor.id} className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <img
                        src={instructor.image}
                        alt={instructor.name}
                        className="h-16 w-16 rounded-full object-cover mr-4"
                      />
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{instructor.name}</h3>
                        <p className="text-gray-400 text-sm">{instructor.title}</p>
                        <p className="text-gray-500 text-xs">{instructor.email}</p>
                      </div>
                    </div>

                    {/* Expertise Tags */}
                    {instructor.expertise && instructor.expertise.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {instructor.expertise.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                          {instructor.expertise.length > 3 && (
                            <span className="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs">
                              +{instructor.expertise.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{instructorCourses.length}</div>
                        <div className="text-xs text-gray-400">Courses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{instructor.experience}</div>
                        <div className="text-xs text-gray-400">Years Exp.</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/instructor/${instructor.id}`)}
                        className="flex-1"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/add-instructor?edit=${instructor.id}`)}
                        className="flex-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteInstructor(instructor.id)}
                        className="text-red-500 border-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredInstructors.length === 0 && (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-white text-lg font-medium mb-2">No instructors found</h3>
                <p className="text-gray-400 mb-4">Get started by adding your first instructor.</p>
                <Button
                  variant="primary"
                  onClick={() => navigate('/admin/add-instructor')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Instructor
                </Button>
              </div>
            )}
          </div>
        </PermissionGuard>
      )}

              {activeTab === 'analytics' && (
          <PermissionGuard
            permission="analytics:view"
          >
          <div className="space-y-8">
            {/* Analytics Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
              <div className="flex items-center space-x-4">
                <select
                  value={analyticsTimeRange}
                  onChange={(e) => setAnalyticsTimeRange(e.target.value as any)}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
                <Button variant="outline" className="flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>

            {/* Key Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">${monthlyRevenue.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">Monthly Revenue</div>
                    <div className="text-xs text-green-400 mt-1">+15% vs last month</div>
                  </div>
                  <div className="bg-green-500/10 p-3 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">{completionRate}%</div>
                    <div className="text-sm text-gray-400">Completion Rate</div>
                    <div className="text-xs text-green-400 mt-1">+3% this month</div>
                  </div>
                  <div className="bg-blue-500/10 p-3 rounded-lg">
                    <Target className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">{userRetentionRate}%</div>
                    <div className="text-sm text-gray-400">User Retention</div>
                    <div className="text-xs text-green-400 mt-1">+2% this quarter</div>
                  </div>
                  <div className="bg-purple-500/10 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">{avgSessionDuration}m</div>
                    <div className="text-sm text-gray-400">Avg Session Duration</div>
                    <div className="text-xs text-green-400 mt-1">+5% this week</div>
                  </div>
                  <div className="bg-orange-500/10 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Student Growth */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-white text-lg font-semibold mb-4">Student Growth</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timeRangeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="period" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="students"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Revenue Trends */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-white text-lg font-semibold mb-4">Revenue Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeRangeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="period" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Course Categories Distribution */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-white text-lg font-semibold mb-4">Course Distribution by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="courses"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* User Engagement */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-white text-lg font-semibold mb-4">User Engagement Metrics</h3>
                <div className="space-y-4">
                  {userEngagementData.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div>
                        <div className="text-white font-medium">{metric.metric}</div>
                        <div className="text-gray-400 text-sm">{metric.value}</div>
                      </div>
                      <div className={`flex items-center text-sm ${
                        metric.trend === 'up' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        <TrendingUp className={`h-4 w-4 mr-1 ${
                          metric.trend === 'down' ? 'rotate-180' : ''
                        }`} />
                        {metric.change}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-white text-lg font-semibold mb-4">Revenue Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {revenueBreakdown.map((item, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white font-medium">{item.source}</div>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      ${item.amount.toLocaleString()}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {item.percentage}% of total
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performing Courses */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-white text-lg font-semibold mb-4">Top Performing Courses</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Course</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Enrollments</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rating</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Revenue</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Completion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {topPerformingCourses.map((course, index) => (
                      <tr key={course.id}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="h-10 w-10 rounded-lg object-cover mr-3"
                            />
                            <div>
                              <div className="text-sm font-medium text-white">{course.title}</div>
                              <div className="text-sm text-gray-400">{course.instructor.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                          {course.enrollments.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="text-sm text-white">{course.rating}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                          ${course.revenue.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${Math.random() * 40 + 60}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </PermissionGuard>
      )}

              {activeTab === 'audit' && (
          <PermissionGuard
            permission="audit:view_logs"
          >
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Audit Logs</h2>
                <p className="text-gray-400">System activity and security logs</p>
              </div>
              <Button variant="outline" className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
            </div>

            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Timestamp</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {auditLogs.slice(0, 20).map((log: any) => (
                      <tr key={log.id} className="hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {log.user}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">
                            {log.action.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300 max-w-md truncate">
                          {log.details}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {log.ipAddress}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {auditLogs.length === 0 && (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white text-lg font-medium mb-2">No audit logs</h3>
                  <p className="text-gray-400">System activity will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </PermissionGuard>
      )}
    </div>
  );
};

export default AdminPage;