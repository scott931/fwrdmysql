import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Bell, Shield, CreditCard, LogOut, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';
import Button from '../components/ui/Button';
import { useNavigate } from '../lib/router';
import { useAuth } from '../contexts/AuthContext';
import { useUserProgress, useCertificates } from '../hooks/useDatabase';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'security'>('profile');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Database hooks
  const {
    progress: userProgress,
    loading: progressLoading,
    fetchUserProgress
  } = useUserProgress(user?.id || '');

  const {
    certificates: userCertificates,
    loading: certificatesLoading,
    fetchUserCertificates
  } = useCertificates(user?.id || '');

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Fetch user data when user is available
  useEffect(() => {
    if (user?.id) {
      fetchUserProgress();
      fetchUserCertificates();
    }
  }, [user?.id, fetchUserProgress, fetchUserCertificates]);

  // Calculate user statistics from database
  const completedCourses = userProgress.filter(p => p.completed).length;
  const totalHoursWatched = userProgress.reduce((total, p) => total + (p.progress || 0), 0) / 100; // Rough estimate
  const certificatesEarned = userCertificates.length;

  // Get user data from auth context
  const userData = {
    name: user?.full_name || profile?.full_name || 'User',
    email: user?.email || profile?.email || 'user@example.com',
    avatar: user?.avatar_url || profile?.avatar_url || 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg',
    joinDate: new Date(), // We'll add created_at to AuthUser interface later
    coursesCompleted: completedCourses,
    hoursWatched: Math.round(totalHoursWatched * 10), // Convert to hours
    certificatesEarned: certificatesEarned,
    lastPasswordChange: new Date('2023-12-15') // This would come from user's password history
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return errors;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors([]);
    setPasswordSuccess(false);

    // Validate current password (in real app, this would be verified against backend)
    if (!passwordForm.currentPassword) {
      setPasswordErrors(['Current password is required']);
      return;
    }

    // Validate new password
    const newPasswordErrors = validatePassword(passwordForm.newPassword);
    if (newPasswordErrors.length > 0) {
      setPasswordErrors(newPasswordErrors);
      return;
    }

    // Check if passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErrors(['New passwords do not match']);
      return;
    }

    // Check if new password is different from current
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordErrors(['New password must be different from current password']);
      return;
    }

    try {
      // In a real app, this would make an API call to change the password
      console.log('Changing password...');

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setPasswordSuccess(true);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setTimeout(() => {
        setShowChangePassword(false);
        setPasswordSuccess(false);
      }, 2000);

    } catch (error) {
      setPasswordErrors(['Failed to change password. Please try again.']);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    const errors = validatePassword(password);
    const strength = Math.max(0, 5 - errors.length);

    if (strength === 0) return { strength: 0, label: 'Very Weak', color: 'bg-red-500' };
    if (strength === 1) return { strength: 20, label: 'Weak', color: 'bg-red-400' };
    if (strength === 2) return { strength: 40, label: 'Fair', color: 'bg-yellow-500' };
    if (strength === 3) return { strength: 60, label: 'Good', color: 'bg-yellow-400' };
    if (strength === 4) return { strength: 80, label: 'Strong', color: 'bg-green-500' };
    return { strength: 100, label: 'Very Strong', color: 'bg-green-600' };
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  return (
    <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-red-600">
              <img
                src={userData.avatar}
                alt={userData.name}
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full text-white text-sm">
              Change Photo
            </button>
          </div>

          {/* User Info */}
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{userData.name}</h1>
            <p className="text-gray-400 mb-4">Member since {userData.joinDate.toLocaleDateString()}</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-lg">
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {progressLoading ? '...' : userData.coursesCompleted}
                </div>
                <div className="text-sm text-gray-400">Courses Completed</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {progressLoading ? '...' : userData.hoursWatched}
                </div>
                <div className="text-sm text-gray-400">Hours Watched</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {certificatesLoading ? '...' : userData.certificatesEarned}
                </div>
                <div className="text-sm text-gray-400">Certificates</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700 mb-8">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-4 relative ${
              activeTab === 'profile'
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Profile
            {activeTab === 'profile' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-4 relative ${
              activeTab === 'security'
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Security
            {activeTab === 'security' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-4 relative ${
              activeTab === 'settings'
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Settings
            {activeTab === 'settings' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></div>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="grid gap-8">
          {/* Personal Information */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Personal Information</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <div className="text-sm text-gray-400">Full Name</div>
                  <div className="text-white">{user.name}</div>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <div className="text-sm text-gray-400">Email</div>
                  <div className="text-white">{user.email}</div>
                </div>
              </div>
            </div>
            <Button variant="outline" className="mt-6">
              Edit Profile
            </Button>
          </div>

          {/* Certificates */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Certificates</h2>
            {user.certificatesEarned > 0 ? (
              <div className="grid gap-4">
                {/* Certificate items would go here */}
                <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Business Fundamentals</h3>
                    <p className="text-gray-400 text-sm">Completed on Jan 15, 2024</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">No certificates earned yet.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="grid gap-8">
          {/* Password Security */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Password Security</h2>
                <p className="text-gray-400">
                  Last changed: {user.lastPasswordChange.toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => setShowChangePassword(true)}
                className="flex items-center"
              >
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </div>

            {/* Password Change Modal */}
            {showChangePassword && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-xl font-semibold text-white mb-6">Change Password</h3>

                  {passwordSuccess && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-green-400">Password changed successfully!</span>
                      </div>
                    </div>
                  )}

                  {passwordErrors.length > 0 && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          {passwordErrors.map((error, index) => (
                            <p key={index} className="text-red-400 text-sm">{error}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>

                      {/* Password Strength Indicator */}
                      {passwordForm.newPassword && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-400">Password Strength</span>
                            <span className={`text-xs font-medium ${
                              passwordStrength.strength >= 80 ? 'text-green-400' :
                              passwordStrength.strength >= 60 ? 'text-yellow-400' :
                              'text-red-400'
                            }`}>
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="w-full bg-gray-600 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                              style={{ width: `${passwordStrength.strength}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Password Requirements */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-white mb-2">Password Requirements:</h4>
                      <ul className="text-xs text-gray-400 space-y-1">
                        <li className={passwordForm.newPassword.length >= 8 ? 'text-green-400' : ''}>
                          • At least 8 characters long
                        </li>
                        <li className={/[A-Z]/.test(passwordForm.newPassword) ? 'text-green-400' : ''}>
                          • One uppercase letter
                        </li>
                        <li className={/[a-z]/.test(passwordForm.newPassword) ? 'text-green-400' : ''}>
                          • One lowercase letter
                        </li>
                        <li className={/\d/.test(passwordForm.newPassword) ? 'text-green-400' : ''}>
                          • One number
                        </li>
                        <li className={/[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.newPassword) ? 'text-green-400' : ''}>
                          • One special character
                        </li>
                      </ul>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowChangePassword(false);
                          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                          setPasswordErrors([]);
                          setPasswordSuccess(false);
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        className="flex-1"
                        disabled={passwordSuccess}
                      >
                        {passwordSuccess ? 'Changed!' : 'Change Password'}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Security Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                    <p className="text-gray-400 text-sm">Add extra security to your account</p>
                  </div>
                  <span className="text-red-400 text-sm">Disabled</span>
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Login Notifications</h4>
                    <p className="text-gray-400 text-sm">Get notified of new logins</p>
                  </div>
                  <span className="text-green-400 text-sm">Enabled</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Recent Security Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-700">
                <div>
                  <p className="text-white">Login from Chrome on Windows</p>
                  <p className="text-gray-400 text-sm">IP: 192.168.1.100 • Today at 2:30 PM</p>
                </div>
                <span className="text-green-400 text-sm">Current session</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-700">
                <div>
                  <p className="text-white">Login from Safari on iPhone</p>
                  <p className="text-gray-400 text-sm">IP: 192.168.1.105 • Yesterday at 8:15 AM</p>
                </div>
                <span className="text-gray-400 text-sm">Successful</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-white">Password changed</p>
                  <p className="text-gray-400 text-sm">{user.lastPasswordChange.toLocaleDateString()} at 10:45 AM</p>
                </div>
                <span className="text-blue-400 text-sm">Security update</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid gap-8">
          {/* Account Settings */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Account Settings</h2>
            <div className="space-y-6">
              <button className="w-full flex items-center justify-between text-left p-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-white">Notifications</div>
                    <div className="text-sm text-gray-400">Manage notification preferences</div>
                  </div>
                </div>
                <div className="text-gray-400">›</div>
              </button>

              <button className="w-full flex items-center justify-between text-left p-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-white">Privacy</div>
                    <div className="text-sm text-gray-400">Manage privacy settings</div>
                  </div>
                </div>
                <div className="text-gray-400">›</div>
              </button>

              <button className="w-full flex items-center justify-between text-left p-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-white">Billing</div>
                    <div className="text-sm text-gray-400">Manage payment methods and subscriptions</div>
                  </div>
                </div>
                <div className="text-gray-400">›</div>
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Danger Zone</h2>
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-between text-red-500 border-red-500 hover:bg-red-500/10"
                onClick={handleLogout}
              >
                <span className="flex items-center">
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </span>
                <span>›</span>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between text-red-500 border-red-500 hover:bg-red-500/10"
              >
                <span>Delete Account</span>
                <span>›</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;