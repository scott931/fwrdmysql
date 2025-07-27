# Authentication Usage Summary

## Quick Start

### 1. Import Required Dependencies

```typescript
import { useAuth } from '../contexts/AuthContext';
import { useTokenRefresh } from '../hooks/useTokenRefresh';
import { apiClient } from '../lib/authInterceptor';
```

### 2. Basic Login Component

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
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

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
      <button type="submit" disabled={loading}>
        {loading ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
};
```

### 3. Protected Component with Token Refresh

```typescript
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTokenRefresh } from '../hooks/useTokenRefresh';
import { apiClient } from '../lib/authInterceptor';

export const ProtectedComponent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { tokenStatus, refreshState, refreshToken, timeUntilExpiry } = useTokenRefresh();
  const [data, setData] = useState<any>(null);

  const fetchData = async () => {
    try {
      // This automatically handles token refresh
      const response = await apiClient.get('/auth/me');
      setData(response.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <div>Please login to access this content.</div>;
  }

  return (
    <div>
      <h2>Welcome, {user?.full_name}!</h2>

      {/* Token Status */}
      <div>
        <p>Token Status: {tokenStatus.isExpired ? 'Expired' : 'Valid'}</p>
        <p>Time Until Expiry: {timeUntilExpiry || 'Unknown'}</p>
        {tokenStatus.shouldRefresh && (
          <button onClick={refreshToken} disabled={refreshState.isRefreshing}>
            Refresh Token
          </button>
        )}
      </div>

      {/* User Data */}
      <div>
        <p>Email: {user?.email}</p>
        <p>Role: {user?.role}</p>
      </div>

      {/* Protected Data */}
      {data && (
        <div>
          <h3>Protected Data:</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
```

### 4. Token Expiration Handler

```typescript
import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTokenRefresh } from '../hooks/useTokenRefresh';

export const TokenExpirationHandler: React.FC = () => {
  const { signOut } = useAuth();
  const { tokenStatus, refreshToken } = useTokenRefresh();

  useEffect(() => {
    if (tokenStatus.isExpired && tokenStatus.isAuthenticated) {
      refreshToken().then((success) => {
        if (!success) {
          signOut(); // Redirect to login
        }
      });
    }
  }, [tokenStatus.isExpired, tokenStatus.isAuthenticated, refreshToken, signOut]);

  return (
    <div>
      <p>Token Status: {tokenStatus.isExpired ? 'Expired' : 'Valid'}</p>
      {tokenStatus.isExpired && (
        <div className="warning">
          Session expired. Refreshing token...
        </div>
      )}
    </div>
  );
};
```

## Available Hooks and Methods

### useAuth Hook
```typescript
const {
  user,              // Current user
  isAuthenticated,   // Auth status
  loading,           // Loading state
  error,             // Error message
  signIn,            // Login
  signOut,           // Logout
  signUp,            // Register
  updateProfile      // Update profile
} = useAuth();
```

### useTokenRefresh Hook
```typescript
const {
  tokenStatus,       // Token status
  refreshState,      // Refresh state
  refreshToken,      // Manual refresh
  timeUntilExpiry,   // Time until expiry
  isExpired,         // Is token expired
  shouldRefresh      // Should refresh
} = useTokenRefresh();
```

### apiClient Methods
```typescript
// All methods automatically handle token refresh
await apiClient.get('/endpoint');
await apiClient.post('/endpoint', data);
await apiClient.put('/endpoint', data);
await apiClient.delete('/endpoint');
await apiClient.patch('/endpoint', data);
```

## Key Features

✅ **Automatic Token Refresh** - No manual intervention needed
✅ **Seamless User Experience** - Users stay logged in
✅ **Type Safety** - Full TypeScript support
✅ **Error Handling** - Graceful failure recovery
✅ **Security** - Proper token validation

## Best Practices

1. **Always use `apiClient`** instead of `fetch` for automatic token refresh
2. **Handle loading states** to improve user experience
3. **Use error boundaries** for graceful error handling
4. **Check authentication status** before rendering protected content
5. **Implement proper logout** to clear all tokens

## Setup Requirements

1. Wrap your app with `AuthProvider`
2. Ensure backend has token refresh endpoints
3. Configure proper JWT secrets and expiry times
4. Set up proper CORS and security headers

The authentication system is now ready to use with automatic token refresh functionality!