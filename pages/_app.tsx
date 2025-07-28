import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { AuthProvider } from '../src/contexts/AuthContext'
import { PermissionProvider } from '../src/contexts/PermissionContext'
import { setupAutomaticRefresh } from '../src/lib/authInterceptor'
import DatabaseTest from '../src/components/ui/DatabaseTest'
import { TokenStatusIndicator } from '../src/components/ui/TokenStatusIndicator'
import GlobalErrorBoundary from '../src/components/ui/GlobalErrorBoundary'
import NavigationDebugger from '../src/components/ui/NavigationDebugger';
import '../src/index.css'
// Import console storage utilities for global access
import '../src/utils/consoleStorage'

// Token Refresh Initializer Component
const TokenRefreshInitializer = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Setup automatic token refresh only on client side
    const cleanup = setupAutomaticRefresh();

    return () => {
      if (cleanup) cleanup();
    };
  }, [isClient]);

  return null;
};

// Client-side only components to prevent hydration issues
const ClientOnlyComponents = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <>
      <DatabaseTest />

      {/* Token Status Indicator - Only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50">
          <TokenStatusIndicator
            showDetails={true}
            showRefreshButton={true}
            className="bg-white border border-gray-300 rounded-lg shadow-lg p-3"
          />
        </div>
      )}
    </>
  );
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <GlobalErrorBoundary>
      <AuthProvider>
        <PermissionProvider>
          <TokenRefreshInitializer />
          <Component {...pageProps} />
          <ClientOnlyComponents />
          <NavigationDebugger />
        </PermissionProvider>
      </AuthProvider>
    </GlobalErrorBoundary>
  )
}