import React from 'react';
import Header from './Header';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, FileUp, UserPlus, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout: React.FC = () => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    // The user will be redirected automatically by the auth state listener
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-900 text-white pt-16">
        <main className="p-10 overflow-auto">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default AdminLayout;