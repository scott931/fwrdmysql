import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, Mail, Shield, Eye, EyeOff, CheckCircle, AlertTriangle, Crown, UserPlus } from 'lucide-react';
import Button from '../components/ui/Button';
import { useNavigate } from '../lib/router';
import ErrorMessage from '../components/ui/ErrorMessage';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'content_manager' | 'admin' | 'super_admin';
  password: string;
  createdAt: Date;
  createdBy: string;
}

const CreateAdminUserPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'content_manager' as 'content_manager' | 'admin' | 'super_admin',
    password: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirm: false
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if current user can create admin users
  const currentUserRole = profile?.role || 'user';
  const currentUserEmail = profile?.email || '';

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

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

  const validateForm = (): string[] => {
    const validationErrors: string[] = [];

    // Name validation
    if (!formData.name.trim()) {
      validationErrors.push('Name is required');
    }

    // Email validation
    if (!formData.email.trim()) {
      validationErrors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      validationErrors.push('Please enter a valid email address');
    }

    // Check if email already exists
    // const existingAdminUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]');
    // if (existingAdminUsers.some((user: AdminUser) => user.email === formData.email)) {
    //   validationErrors.push('An admin user with this email already exists');
    // }

    // Password validation
    const passwordErrors = validatePassword(formData.password);
    validationErrors.push(...passwordErrors);

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      validationErrors.push('Passwords do not match');
    }

    // Role validation for super_admin creation
    if (formData.role === 'super_admin' && currentUserRole !== 'super_admin') {
      validationErrors.push('Only super admins can create other super admin accounts');
    }

    return validationErrors;
  };

  const logAuditEvent = (action: string, details: string) => {
    const auditLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      user: currentUserEmail,
      action,
      details,
      ipAddress: '192.168.1.100'
    };

    const existingLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
    existingLogs.unshift(auditLog);
    localStorage.setItem('auditLogs', JSON.stringify(existingLogs.slice(0, 1000)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccess(false);
    setIsSubmitting(true);

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const newUser = userCredential.user;

      // Create user document in Firestore
      await setDoc(doc(db, "users", newUser.uid), {
        id: newUser.uid,
        email: formData.email.trim(),
        full_name: formData.name.trim(),
        role: formData.role,
        onboarding_completed: true, // Admins don't need onboarding
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        createdBy: currentUserEmail
      });

      // TODO: Implement proper audit logging with Firestore
      // logAuditEvent('admin_user_created', `Created ${formData.role} account: ${formData.email} by ${currentUserEmail}`);

      setSuccess(true);

      // Reset form
      setFormData({
        name: '',
        email: '',
        role: 'content_manager',
        password: '',
        confirmPassword: ''
      });

      // Redirect after success
      setTimeout(() => {
        navigate('/admin/manage-users');
      }, 3000);

    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setErrors(['An admin user with this email already exists']);
      } else {
        setErrors(['Failed to create admin user. Please try again.']);
      }
    } finally {
      setIsSubmitting(false);
    }
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

  const passwordStrength = getPasswordStrength(formData.password);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <Crown className="h-5 w-5" />;
      case 'admin': return <Shield className="h-5 w-5" />;
      case 'content_manager': return <UserPlus className="h-5 w-5" />;
      default: return <User className="h-5 w-5" />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Full system access, can manage all users and settings';
      case 'admin': return 'Platform management, user management, and analytics access';
      case 'content_manager': return 'Content creation and management permissions';
      default: return 'Basic access permissions';
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin')}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Create Admin User</h1>
            <p className="text-gray-400 mt-2">Create a new admin account with login credentials</p>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-8">
            <ErrorMessage
              title="Success!"
              message="Admin user created successfully! Redirecting to user management..."
              type="info"
            />
          </div>
        )}

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mb-8">
            <ErrorMessage
              title="Error Creating User"
              message={errors.join('. ')}
              onClose={() => setErrors([])}
            />
          </div>
        )}

        {/* Form */}
        <div className="bg-gray-800 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter full name"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="admin@forwardafrica.com"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin Role *
              </label>
              <div className="space-y-3">
                {[
                  { value: 'content_manager', label: 'Content Manager', disabled: false },
                  { value: 'admin', label: 'Administrator', disabled: false },
                  { value: 'super_admin', label: 'Super Administrator', disabled: currentUserRole !== 'super_admin' }
                ].map((role) => (
                  <div
                    key={role.value}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.role === role.value
                        ? 'border-red-500 bg-red-500/10'
                        : role.disabled
                        ? 'border-gray-600 bg-gray-700/50 cursor-not-allowed opacity-50'
                        : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                    }`}
                    onClick={() => !role.disabled && !isSubmitting && setFormData(prev => ({ ...prev, role: role.value as any }))}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={formData.role === role.value}
                        onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 bg-gray-700"
                        disabled={role.disabled || isSubmitting}
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center">
                          {getRoleIcon(role.value)}
                          <span className="ml-2 text-white font-medium">{role.label}</span>
                          {role.disabled && (
                            <span className="ml-2 text-xs text-gray-400">(Requires Super Admin)</span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm mt-1">
                          {getRoleDescription(role.value)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.password ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter password"
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, password: !prev.password }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    disabled={isSubmitting}
                  >
                    {showPasswords.password ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
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

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Confirm password"
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    disabled={isSubmitting}
                  >
                    {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-white mb-2">Password Requirements:</h4>
              <ul className="text-xs text-gray-400 space-y-1">
                <li className={formData.password.length >= 8 ? 'text-green-400' : ''}>
                  • At least 8 characters long
                </li>
                <li className={/[A-Z]/.test(formData.password) ? 'text-green-400' : ''}>
                  • One uppercase letter
                </li>
                <li className={/[a-z]/.test(formData.password) ? 'text-green-400' : ''}>
                  • One lowercase letter
                </li>
                <li className={/\d/.test(formData.password) ? 'text-green-400' : ''}>
                  • One number
                </li>
                <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-green-400' : ''}>
                  • One special character
                </li>
              </ul>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || success}
                className="flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Created!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Admin User
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAdminUserPage;