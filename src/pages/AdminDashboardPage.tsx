import React, { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { BarChart2, BookOpen, Users, TrendingUp, Activity, UserPlus, Plus, Settings, Shield } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { usePermissions } from "../contexts/PermissionContext";
import { useAnalytics, useUsers } from "../hooks/useDatabase";

const adminNav = [
  { to: "/admin/dashboard", label: "Dashboard", icon: <BarChart2 className="h-5 w-5 mr-1" /> },
  { to: "/admin/courses", label: "Courses", icon: <BookOpen className="h-5 w-5 mr-1" /> },
  { to: "/admin/instructors", label: "Instructors", icon: <Users className="h-5 w-5 mr-1" /> },
  { to: "/admin/analytics", label: "Analytics", icon: <TrendingUp className="h-5 w-5 mr-1" /> },
  { to: "/admin/audit-logs", label: "Audit Logs", icon: <Activity className="h-5 w-5 mr-1" /> },
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { userRole } = usePermissions();

  // Database hooks
  const {
    stats: platformStats,
    loading: statsLoading,
    fetchPlatformStats
  } = useAnalytics();

  const {
    users,
    loading: usersLoading,
    fetchAllUsers
  } = useUsers();

  // Fetch data on component mount
  useEffect(() => {
    fetchPlatformStats();
    fetchAllUsers();
  }, [fetchPlatformStats, fetchAllUsers]);

  function getDisplayName(role: string): string {
    switch (role) {
      case 'super_admin': return 'Super Administrator';
      case 'admin': return 'Administrator';
      case 'content_manager': return 'Content Manager';
      default: return 'User';
    }
  }

  // Calculate active users (users who have completed at least one course)
  const activeUsers = users.filter(user => user.onboardingCompleted).length;

  return (
    <div className="min-h-screen flex bg-gray-900 text-white pt-20">
      {/* Admin Nav */}
      <nav className="flex space-x-8 border-b border-gray-800 bg-[#181c23] px-8 pt-6">
        {adminNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center pb-2 text-sm font-medium transition-colors ${
                isActive
                  ? "text-white border-b-2 border-red-500"
                  : "text-gray-400 hover:text-white"
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Header */}
      <div className="flex justify-between items-center px-8 pt-8 pb-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage courses, instructors, and platform settings</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="font-semibold">{profile?.full_name || getDisplayName(userRole)}</div>
            <div className="text-xs text-gray-400">{user?.email || profile?.email || 'admin@forwardafrica.com'}</div>
          </div>
          <button
            className="bg-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600"
            onClick={() => navigate('/admin/profile')}
          >
            Profile
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-8 py-4">
        <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center">
          <span className="text-2xl font-bold text-white">
            {statsLoading ? '...' : (platformStats?.totalUsers || users.length)}
          </span>
          <span className="text-gray-400 text-sm mt-2">Total Students</span>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center">
          <span className="text-2xl font-bold text-white">
            {usersLoading ? '...' : activeUsers}
          </span>
          <span className="text-gray-400 text-sm mt-2">Active Students</span>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center">
          <span className="text-2xl font-bold text-white">
            {statsLoading ? '...' : (platformStats?.totalCourses || 0)}
          </span>
          <span className="text-gray-400 text-sm mt-2">Total Courses</span>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center">
          <span className="text-2xl font-bold text-white">
            {statsLoading ? '...' : (platformStats?.totalInstructors || 0)}
          </span>
          <span className="text-gray-400 text-sm mt-2">Total Instructors</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-lg mx-8 my-6 p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold flex items-center"
            onClick={() => navigate("/admin/upload-course")}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Course
          </button>
          <button
            className="border border-gray-500 text-white px-6 py-2 rounded font-semibold flex items-center hover:bg-gray-700"
            onClick={() => navigate("/admin/add-instructor")}
          >
            <UserPlus className="h-4 w-4 mr-2" /> Add Instructor
          </button>
          <button
            className="border border-gray-500 text-white px-6 py-2 rounded font-semibold flex items-center hover:bg-gray-700"
            onClick={() => navigate("/admin/create-user")}
          >
            <Shield className="h-4 w-4 mr-2" /> Create Admin
          </button>
          <button
            className="border border-gray-500 text-white px-6 py-2 rounded font-semibold flex items-center hover:bg-gray-700"
            onClick={() => navigate("/admin/manage-users")}
          >
            <Users className="h-4 w-4 mr-2" /> Manage Users
          </button>
          <button
            className="border border-gray-500 text-white px-6 py-2 rounded font-semibold flex items-center hover:bg-gray-700"
            onClick={() => navigate("/admin/security-settings")}
          >
            <Settings className="h-4 w-4 mr-2" /> Settings
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mx-8 mb-8 bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Security Activity</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-gray-900 rounded px-4 py-2">
            <span>super admin login superadmin@forwardafrica.com</span>
            <span className="bg-gray-700 text-xs px-3 py-1 rounded font-semibold">ADMIN LOGIN</span>
          </div>
          <div className="flex justify-between items-center bg-gray-900 rounded px-4 py-2">
            <span>admin login admin@forwardafrica.com</span>
            <span className="bg-gray-700 text-xs px-3 py-1 rounded font-semibold">ADMIN LOGIN</span>
          </div>
          {/* Add more activity rows as needed */}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#181c23] border-t border-gray-800 pt-10 pb-6 px-8 mt-8">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="text-red-600 font-bold text-xl mb-2">FORWARDAFRICA</div>
            <p className="text-gray-400 text-sm mb-4">
              Empowering African professionals through expert-led courses and cutting-edge learning experiences.
            </p>
            <div className="flex space-x-3">
              {/* Social icons here */}
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Quick Links</h4>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>Browse Courses</li>
              <li>Afri-Sage</li>
              <li>Community</li>
              <li>About Us</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Categories</h4>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>Business</li>
              <li>Entrepreneurship</li>
              <li>Finance</li>
              <li>Personal Development</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Contact Us</h4>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>123 Innovation Hub, Digital City, Africa</li>
              <li>+234 123 456 7890</li>
              <li>support@forwardafrica.com</li>
            </ul>
          </div>
        </div>
        <div className="max-w-screen-xl mx-auto mt-8 flex flex-col md:flex-row items-center justify-between">
          <form className="flex items-center w-full md:w-auto mb-4 md:mb-0">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-2 rounded-l bg-gray-700 text-white border-none focus:ring-2 focus:ring-red-500"
            />
            <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-r text-white font-medium">
              Subscribe
            </button>
          </form>
          <div className="text-gray-500 text-xs mt-4 md:mt-0">
            © 2025 Forward Africa. All rights reserved. | Terms of Service | Privacy Policy | Cookie Policy | Accessibility | Admin Login
          </div>
        </div>
      </footer>
    </div>
  );
}