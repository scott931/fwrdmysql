# Authentication Usage Guide

## Overview

This guide shows how to use the enhanced authentication context with automatic token refresh functionality in your React components.

## Setup

### 1. Import Required Dependencies

```typescript
import { useAuth } from '../contexts/AuthContext';
import { useTokenRefresh } from '../hooks/useTokenRefresh';
import { apiClient } from '../lib/authInterceptor';
```

### 2. Wrap Your App with AuthProvider

```typescript
// In your main App component
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* Your app components */}
    </AuthProvider>
  );
}
```

## Basic Authentication Usage

### Login Component

```typescript
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const LoginComponent: React.FC = () => {
  const { signIn, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await signIn({ email, password });
      console.log('✅ Login successful');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit">Login</button>
    </form>
  );
};
```

### User Profile Component

```typescript
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export const UserProfile: React.FC = () => {
  const { user, isAuthenticated, signOut } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login to view your profile.</div>;
  }

  return (
    <div>
      <h2>Welcome, {user?.full_name}!</h2>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
      <button onClick={signOut}>Logout</button>
    </div>
  );
};
```

## Protected Components with Token Refresh

### Using the Token Refresh Hook

```typescript
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTokenRefresh } from '../hooks/useTokenRefresh';
import { apiClient } from '../lib/authInterceptor';

export const ProtectedComponent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { tokenStatus, refreshState, refreshToken, timeUntilExpiry } = useTokenRefresh();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchProtectedData = async () => {
    setLoading(true);

    try {
      // This will automatically handle token refresh if needed
      const response = await apiClient.get('/auth/me');
      setData(response.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProtectedData();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <div>Authentication required</div>;
  }

  return (
    <div>
      {/* Token Status Display */}
      <div className="token-status">
        <h3>Token Status:</h3>
        <p>Status: {tokenStatus.isExpired ? 'Expired' : tokenStatus.shouldRefresh ? 'Expiring Soon' : 'Valid'}</p>
        <p>Time Until Expiry: {timeUntilExpiry || 'Unknown'}</p>
        <p>Is Refreshing: {refreshState.isRefreshing ? 'Yes' : 'No'}</p>
        <p>Refresh Count: {refreshState.refreshCount}</p>

        {tokenStatus.shouldRefresh && !refreshState.isRefreshing && (
          <button onClick={refreshToken}>
            Refresh Token
          </button>
        )}
      </div>

      {/* User Data */}
      <div className="user-info">
        <h3>User Information:</h3>
        <p>Name: {user?.full_name}</p>
        <p>Email: {user?.email}</p>
        <p>Role: {user?.role}</p>
      </div>

      {/* Protected Data */}
      <div className="protected-data">
        <h3>Protected Data:</h3>
        {loading && <div>Loading...</div>}
        {data && (
          <pre>{JSON.stringify(data, null, 2)}</pre>
        )}
        <button onClick={fetchProtectedData} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Data'}
        </button>
      </div>
    </div>
  );
};
```

## Token Expiration Handler

### Automatic Token Refresh on Expiration

```typescript
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTokenRefresh } from '../hooks/useTokenRefresh';

export const TokenExpirationHandler: React.FC = () => {
  const { signOut } = useAuth();
  const { tokenStatus, refreshToken } = useTokenRefresh();
  const [lastAction, setLastAction] = useState('');

  useEffect(() => {
    if (tokenStatus.isExpired && tokenStatus.isAuthenticated) {
      console.log('⚠️ Token expired, attempting refresh...');
      setLastAction('Token expired, attempting refresh...');

      refreshToken().then((success) => {
        if (success) {
          setLastAction('Token refreshed successfully');
        } else {
          setLastAction('Token refresh failed, logging out...');
          signOut();
        }
      });
    }
  }, [tokenStatus.isExpired, tokenStatus.isAuthenticated, refreshToken, signOut]);

  return (
    <div>
      <h2>Token Expiration Handler</h2>

      <div>
        <p><strong>Token Status:</strong> {tokenStatus.isExpired ? 'Expired' : 'Valid'}</p>
        <p><strong>Should Refresh:</strong> {tokenStatus.shouldRefresh ? 'Yes' : 'No'}</p>
        <p><strong>Last Action:</strong> {lastAction || 'None'}</p>
      </div>

      {tokenStatus.isExpired && (
        <div className="warning">
          <h3>Token Expired</h3>
          <p>Your session has expired. The system will attempt to refresh your token automatically.</p>
        </div>
      )}
    </div>
  );
};
```

## Automatic Token Refresh with API Calls

### Making API Calls with Automatic Token Refresh

```typescript
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/authInterceptor';

export const ApiCallExample: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [apiCalls, setApiCalls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const makeApiCall = async (endpoint: string) => {
    setLoading(true);
    const timestamp = new Date().toLocaleTimeString();

    try {
      const response = await apiClient.get(endpoint);
      setApiCalls(prev => [...prev, `${timestamp}: ${endpoint} - Success`]);
      return response.data;
    } catch (error) {
      setApiCalls(prev => [...prev, `${timestamp}: ${endpoint} - Failed: ${error instanceof Error ? error.message : 'Unknown error'}`]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleMultipleCalls = async () => {
    setApiCalls([]);

    const calls = ['/auth/me', '/users', '/system/status'];

    for (const endpoint of calls) {
      try {
        await makeApiCall(endpoint);
        // Small delay between calls
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to call ${endpoint}:`, error);
      }
    }
  };

  if (!isAuthenticated) {
    return <div>Please login to test API calls.</div>;
  }

  return (
    <div>
      <h2>Automatic Token Refresh</h2>

      <div>
        <button
          onClick={handleMultipleCalls}
          disabled={loading}
        >
          {loading ? 'Making API Calls...' : 'Make Multiple API Calls'}
        </button>
      </div>

      <div>
        <h3>Individual API Calls:</h3>
        <button onClick={() => makeApiCall('/auth/me')} disabled={loading}>
          Get Profile
        </button>
        <button onClick={() => makeApiCall('/users')} disabled={loading}>
          Get Users
        </button>
        <button onClick={() => makeApiCall('/system/status')} disabled={loading}>
          Get System Status
        </button>
      </div>

      <div>
        <h3>API Call Log:</h3>
        <div className="api-log">
          {apiCalls.length === 0 ? (
            <div>No API calls made yet.</div>
          ) : (
            <div>
              {apiCalls.map((call, index) => (
                <div key={index}>{call}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

## Custom Hook Usage

### Creating Custom Hooks for Token Management

```typescript
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTokenRefresh } from '../hooks/useTokenRefresh';

// Custom hook for handling token expiration
export const useTokenExpirationHandler = (onExpiration?: () => void) => {
  const { signOut } = useAuth();
  const { tokenStatus, refreshToken } = useTokenRefresh();

  useEffect(() => {
    if (tokenStatus.isExpired && tokenStatus.isAuthenticated) {
      console.log('⚠️ Token expired, attempting refresh...');

      refreshToken().then((success) => {
        if (!success && onExpiration) {
          console.log('❌ Token refresh failed, calling expiration handler');
          onExpiration();
        }
      });
    }
  }, [tokenStatus.isExpired, tokenStatus.isAuthenticated, refreshToken, onExpiration, signOut]);

  return {
    isExpired: tokenStatus.isExpired,
    refreshToken,
    shouldRefresh: tokenStatus.shouldRefresh
  };
};

// Usage in component
export const CustomHookExample: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { isExpired, shouldRefresh } = useTokenExpirationHandler(() => {
    console.log('Token refresh failed, user should be redirected to login');
  });

  if (!isAuthenticated) {
    return <div>Please login to see custom hook usage.</div>;
  }

  return (
    <div>
      <h2>Custom Hook Usage</h2>
      <p>Is Expired: {isExpired ? 'Yes' : 'No'}</p>
      <p>Should Refresh: {shouldRefresh ? 'Yes' : 'No'}</p>
      <p>User: {user?.full_name}</p>
    </div>
  );
};
```

## Error Handling and Retry Logic

### Implementing Retry Logic with Token Refresh

```typescript
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/authInterceptor';

export const ErrorHandlingExample: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [data, setData] = useState<any>(null);

  const fetchDataWithRetry = async (maxRetries = 3) => {
    setError('');
    setRetryCount(0);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        setRetryCount(attempt);

        // This will automatically handle token refresh and retry on 401
        const response = await apiClient.get('/auth/me');
        setData(response.data);
        return response.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';

        if (attempt === maxRetries) {
          setError(`Failed after ${maxRetries} attempts: ${errorMessage}`);
          throw err;
        } else {
          console.log(`Attempt ${attempt} failed, retrying...`);
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
  };

  const handleManualRetry = async () => {
    try {
      await fetchDataWithRetry();
    } catch (err) {
      console.error('All retry attempts failed:', err);
    }
  };

  if (!isAuthenticated) {
    return <div>Please login to test error handling.</div>;
  }

  return (
    <div>
      <h2>Error Handling & Retry Logic</h2>

      <div>
        <button onClick={handleManualRetry}>
          Fetch Data with Retry
        </button>
      </div>

      <div>
        <h3>Status:</h3>
        <p>Retry Count: {retryCount}</p>
        <p>Error: {error || 'None'}</p>
      </div>

      {data && (
        <div>
          <h3>Fetched Data:</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}

      <div className="info">
        <h3>How it works:</h3>
        <ul>
          <li>API calls automatically handle token refresh</li>
          <li>401 errors trigger automatic token refresh and retry</li>
          <li>Manual retry logic for other types of errors</li>
          <li>Exponential backoff between retry attempts</li>
        </ul>
      </div>
    </div>
  );
};
```

## Available Hooks and Methods

### useAuth Hook

```typescript
const {
  user,              // Current user object
  profile,           // User profile data
  loading,           // Loading state
  isAuthenticated,   // Authentication status
  isAdmin,           // Admin role check
  isSuperAdmin,      // Super admin role check
  error,             // Error message
  signIn,            // Login function
  signUp,            // Registration function
  signOut,           // Logout function
  updateProfile,     // Update profile function
  refreshToken,      // Manual token refresh
  clearError,        // Clear error message
  checkAuthStatus    // Check authentication status
} = useAuth();
```

### useTokenRefresh Hook

```typescript
const {
  tokenStatus,       // Token status object
  refreshState,      // Refresh state object
  refreshToken,      // Manual refresh function
  forceLogout,       // Force logout function
  updateTokenStatus, // Update token status
  timeUntilExpiry,   // Time until token expires
  shouldRedirectToLogin, // Should redirect to login
  isAuthenticated,   // Authentication status
  isExpired,         // Token expired status
  shouldRefresh      // Should refresh token
} = useTokenRefresh();
```

### apiClient Methods

```typescript
// GET request
const response = await apiClient.get('/endpoint');

// POST request
const response = await apiClient.post('/endpoint', data);

// PUT request
const response = await apiClient.put('/endpoint', data);

// DELETE request
const response = await apiClient.delete('/endpoint');

// PATCH request
const response = await apiClient.patch('/endpoint', data);

// File upload
const response = await apiClient.upload('/upload', file);

// File download
const response = await apiClient.download('/download');
```

## Best Practices

### 1. Always Use the API Client

```typescript
// ✅ Good - Uses automatic token refresh
const response = await apiClient.get('/auth/me');

// ❌ Bad - Manual fetch without token refresh
const response = await fetch('/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### 2. Handle Token Expiration Gracefully

```typescript
// ✅ Good - Automatic handling
useEffect(() => {
  if (tokenStatus.isExpired && tokenStatus.isAuthenticated) {
    refreshToken().then((success) => {
      if (!success) {
        // Handle failed refresh
        signOut();
      }
    });
  }
}, [tokenStatus.isExpired]);
```

### 3. Use Loading States

```typescript
// ✅ Good - Shows loading state
if (loading) return <div>Loading...</div>;

// ✅ Good - Disables buttons during loading
<button disabled={loading}>
  {loading ? 'Loading...' : 'Submit'}
</button>
```

### 4. Error Handling

```typescript
// ✅ Good - Comprehensive error handling
try {
  const response = await apiClient.get('/endpoint');
  setData(response.data);
} catch (error) {
  if (error instanceof Error) {
    setError(error.message);
  } else {
    setError('An unknown error occurred');
  }
}
```

## Troubleshooting

### Common Issues

1. **Token not refreshing automatically**
   - Ensure you're using `apiClient` instead of `fetch`
   - Check that the AuthProvider is wrapping your app
   - Verify the backend refresh endpoint is working

2. **Infinite refresh loops**
   - Check that the refresh token is valid
   - Ensure the backend is returning new tokens
   - Verify the token expiry times are correct

3. **401 errors persisting**
   - Check that the refresh token hasn't expired
   - Verify the user account is still active
   - Ensure the backend is properly invalidating tokens on logout

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
REACT_APP_DEBUG_AUTH=true
```

This will log detailed information about token refresh operations to the console.

## Conclusion

The enhanced authentication system provides:

- ✅ **Automatic token refresh** - No manual intervention needed
- ✅ **Seamless user experience** - Users stay logged in
- ✅ **Robust error handling** - Graceful failure recovery
- ✅ **Type safety** - Full TypeScript support
- ✅ **Easy integration** - Simple hooks and components
- ✅ **Security** - Proper token validation and invalidation

Follow these patterns to build secure, user-friendly authentication in your React applications.