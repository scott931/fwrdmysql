import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PermissionProvider } from './contexts/PermissionContext';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import DatabaseTest from './components/ui/DatabaseTest';

// Lazy load page components
const HomePage = React.lazy(() => import('./pages/HomePage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const CoursePage = React.lazy(() => import('./pages/CoursePage'));
const CategoryPage = React.lazy(() => import('./pages/CategoryPage'));
const InstructorPage = React.lazy(() => import('./pages/InstructorPage'));
const SearchPage = React.lazy(() => import('./pages/SearchPage'));
const CommunityPage = React.lazy(() => import('./pages/CommunityPage'));
const ChatPage = React.lazy(() => import('./pages/ChatPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const CoursesPage = React.lazy(() => import('./pages/CoursesPage'));
const AfriSagePage = React.lazy(() => import('./pages/AfrisagePage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const AdminPage = React.lazy(() => import('./pages/AdminPage'));
const AdminProfilePage = React.lazy(() => import('./pages/AdminProfilePage'));
const CreateAdminUserPage = React.lazy(() => import('./pages/CreateAdminUserPage'));
const UploadCoursePage = React.lazy(() => import('./pages/UploadCoursePage'));
const AddInstructorPage = React.lazy(() => import('./pages/AddFacilitatorPage'));
const AdminLoginPage = React.lazy(() => import('./pages/AdminLoginPage'));
const ManageUsersPage = React.lazy(() => import('./pages/ManageUsersPage'));
const SecuritySettingsPage = React.lazy(() => import('./pages/SecuritySettingsPage'));
const UnauthorizedPage = React.lazy(() => import('./pages/UnauthorizedPage'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
  </div>
);

const routes = [
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/onboarding',
    element: (
      <ProtectedRoute requireOnboarding={false}>
        <Suspense fallback={<PageLoader />}>
          <OnboardingPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}><Outlet /></Suspense>
      </Layout>
    ),
    children: [
      { path: '/home', element: <HomePage /> },
      { path: '/courses', element: <CoursesPage /> },
      { path: '/about', element: <AboutPage /> },
      // Add other public-facing routes here
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <Layout>
          <Suspense fallback={<PageLoader />}><Outlet /></Suspense>
        </Layout>
      </ProtectedRoute>
    ),
    children: [
      { path: '/course/:courseId', element: <CoursePage /> },
      { path: '/category/:categoryId', element: <CategoryPage /> },
      { path: '/instructor/:instructorId', element: <InstructorPage /> },
      { path: '/search', element: <SearchPage /> },
      { path: '/community', element: <CommunityPage /> },
      { path: '/community/chat/:groupId', element: <ChatPage /> },
      { path: '/afri-sage', element: <AfriSagePage /> },
      { path: '/profile', element: <ProfilePage /> },
    ],
  },
  {
    path: '/admin/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AdminLoginPage />
      </Suspense>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <AdminPage />
          </Suspense>
        ),
      },
      {
        path: 'profile',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AdminProfilePage />
          </Suspense>
        ),
      },
      {
        path: 'create-user',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <CreateAdminUserPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'upload-course',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <UploadCoursePage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'add-instructor',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <AddInstructorPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'manage-users',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <ManageUsersPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'security-settings',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <SecuritySettingsPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/unauthorized',
    element: (
      <Suspense fallback={<PageLoader />}>
        <UnauthorizedPage />
      </Suspense>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];

const router = createBrowserRouter(routes, {
  future: {
    v7_relativeSplatPath: true
  }
});

function App() {
  return (
    <AuthProvider>
      <PermissionProvider>
        <RouterProvider router={router} />
        <DatabaseTest />
      </PermissionProvider>
    </AuthProvider>
  );
}

export default App;