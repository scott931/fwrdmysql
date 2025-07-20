import React from 'react';
import { useNavigate } from '../lib/router';
import { AlertTriangle, ArrowLeft, Shield } from 'lucide-react';
import Button from '../components/ui/Button';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const adminRole = localStorage.getItem('adminRole') || '';
  const roleDisplay = adminRole.replace('_', ' ').toUpperCase();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-500/20 p-4 rounded-full">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>

        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
          <p className="text-red-300">
            You don't have permission to access this page. Your current role ({roleDisplay}) doesn't have the required permissions.
          </p>
        </div>

        <div className="flex flex-col space-y-3">
          <Button
            variant="primary"
            onClick={() => navigate('/admin')}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              localStorage.removeItem('isAdminLoggedIn');
              localStorage.removeItem('adminRole');
              localStorage.removeItem('adminEmail');
              navigate('/admin/login');
            }}
            className="w-full"
          >
            <Shield className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;