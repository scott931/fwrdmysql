// Token Status Indicator Component
// Displays current token status and provides manual refresh functionality

import React, { useState } from 'react';
import { useTokenRefresh } from '../../hooks/useTokenRefresh';

interface TokenStatusIndicatorProps {
  showDetails?: boolean;
  showRefreshButton?: boolean;
  className?: string;
}

export const TokenStatusIndicator: React.FC<TokenStatusIndicatorProps> = ({
  showDetails = false,
  showRefreshButton = true,
  className = '',
}) => {
  const {
    tokenStatus,
    refreshState,
    refreshToken,
    timeUntilExpiry,
    shouldRedirectToLogin,
  } = useTokenRefresh();

  const [showFullDetails, setShowFullDetails] = useState(false);

  // Don't render if not authenticated
  if (!tokenStatus.isAuthenticated) {
    return null;
  }

  const getStatusColor = () => {
    if (tokenStatus.isExpired) return 'text-red-500';
    if (tokenStatus.shouldRefresh) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (tokenStatus.isExpired) return '🔴';
    if (tokenStatus.shouldRefresh) return '🟡';
    return '🟢';
  };

  const getStatusText = () => {
    if (tokenStatus.isExpired) return 'Expired';
    if (tokenStatus.shouldRefresh) return 'Expiring Soon';
    return 'Valid';
  };

  const handleRefresh = async () => {
    const success = await refreshToken();
    if (success) {
      // Show success feedback
      console.log('Token refreshed successfully');
    }
  };

  return (
    <div className={`token-status-indicator ${className}`}>
      {/* Compact Status Display */}
      <div className="flex items-center space-x-2 text-sm">
        <span className={getStatusColor()}>
          {getStatusIcon()} {getStatusText()}
        </span>

        {timeUntilExpiry && (
          <span className="text-gray-600">
            ({timeUntilExpiry})
          </span>
        )}

        {showRefreshButton && (
          <button
            onClick={handleRefresh}
            disabled={refreshState.isRefreshing}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {refreshState.isRefreshing ? '🔄' : '🔄'}
          </button>
        )}

        {showDetails && (
          <button
            onClick={() => setShowFullDetails(!showFullDetails)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            {showFullDetails ? '▼' : '▶'}
          </button>
        )}
      </div>

      {/* Error Display */}
      {refreshState.error && (
        <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-xs">
          <strong>Refresh Error:</strong> {refreshState.error}
        </div>
      )}

      {/* Full Details */}
      {showDetails && showFullDetails && (
        <div className="mt-3 p-3 bg-gray-50 border rounded text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <strong>Status:</strong> {getStatusText()}
            </div>
            <div>
              <strong>Time Until Expiry:</strong> {timeUntilExpiry || 'Unknown'}
            </div>
            <div>
              <strong>Is Authenticated:</strong> {tokenStatus.isAuthenticated ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Should Refresh:</strong> {tokenStatus.shouldRefresh ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Is Refreshing:</strong> {refreshState.isRefreshing ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Refresh Count:</strong> {refreshState.refreshCount}
            </div>
            {refreshState.lastRefreshTime && (
              <div>
                <strong>Last Refresh:</strong> {new Date(refreshState.lastRefreshTime).toLocaleTimeString()}
              </div>
            )}
            {tokenStatus.expiryTime && (
              <div>
                <strong>Expires At:</strong> {new Date(tokenStatus.expiryTime).toLocaleString()}
              </div>
            )}
          </div>

          {/* Debug Actions */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex space-x-2">
              <button
                onClick={handleRefresh}
                disabled={refreshState.isRefreshing}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {refreshState.isRefreshing ? 'Refreshing...' : 'Manual Refresh'}
              </button>

              <button
                onClick={() => {
                  console.log('Token Status:', tokenStatus);
                  console.log('Refresh State:', refreshState);
                }}
                className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Log Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Redirect Warning */}
      {shouldRedirectToLogin && (
        <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-700 text-xs">
          <strong>Warning:</strong> Session expired. Redirecting to login...
        </div>
      )}
    </div>
  );
};

// Admin-only token status component
export const AdminTokenStatusIndicator: React.FC<TokenStatusIndicatorProps> = (props) => {
  const { tokenStatus } = useTokenRefresh();

  // Only show for admin users
  if (!tokenStatus.isAuthenticated) {
    return null;
  }

  return (
    <div className="admin-token-status">
      <div className="text-xs text-gray-500 mb-1">Admin Token Status</div>
      <TokenStatusIndicator {...props} showDetails={true} />
    </div>
  );
};

// Minimal status indicator for production
export const MinimalTokenStatus: React.FC = () => {
  const { tokenStatus, refreshState } = useTokenRefresh();

  if (!tokenStatus.isAuthenticated) {
    return null;
  }

  return (
    <div className="minimal-token-status">
      <div className={`inline-block w-2 h-2 rounded-full ${
        tokenStatus.isExpired ? 'bg-red-500' :
        tokenStatus.shouldRefresh ? 'bg-yellow-500' :
        'bg-green-500'
      }`} />

      {refreshState.isRefreshing && (
        <span className="ml-1 text-xs text-gray-500">🔄</span>
      )}
    </div>
  );
};