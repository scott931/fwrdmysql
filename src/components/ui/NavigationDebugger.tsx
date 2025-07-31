import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface NavigationDebuggerProps {
  enabled?: boolean;
}

const NavigationDebugger: React.FC<NavigationDebuggerProps> = ({ enabled = process.env.NODE_ENV === 'development' }) => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<Array<{
    timestamp: number;
    from: string;
    to: string;
    method: string;
  }>>([]);

  // Set client flag on mount to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleRouteChange = (url: string) => {
      const newEntry = {
        timestamp: Date.now(),
        from: router.asPath,
        to: url,
        method: 'routeChange'
      };

      setNavigationHistory(prev => [...prev.slice(-9), newEntry]);

      console.log('🔄 Navigation Debug:', {
        from: router.asPath,
        to: url,
        timestamp: new Date().toISOString()
      });
    };

    const handleRouteChangeStart = (url: string) => {
      console.log('🚀 Navigation Start:', {
        from: router.asPath,
        to: url,
        timestamp: new Date().toISOString()
      });
    };

    const handleRouteChangeComplete = (url: string) => {
      console.log('✅ Navigation Complete:', {
        to: url,
        timestamp: new Date().toISOString()
      });
    };

    const handleRouteChangeError = (err: Error, url: string) => {
      console.error('❌ Navigation Error:', {
        error: err.message,
        url,
        timestamp: new Date().toISOString()
      });
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeError);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, [router, enabled]);

  // Don't render anything until client-side hydration is complete
  if (!enabled || !isClient) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🐛 Navigation Debug</h3>
      <div className="space-y-1">
        <div>Current: {router.asPath}</div>
        <div>Ready: {router.isReady ? 'Yes' : 'No'}</div>
        <div>History: {navigationHistory.length}</div>
        {navigationHistory.length > 0 && (
          <div className="mt-2">
            <div className="font-semibold">Recent:</div>
            {navigationHistory.slice(-3).map((entry, index) => (
              <div key={index} className="text-gray-300">
                {entry.from} → {entry.to}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NavigationDebugger;