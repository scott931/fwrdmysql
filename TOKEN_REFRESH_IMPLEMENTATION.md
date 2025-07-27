# Token Refresh Implementation

## Overview

Comprehensive token refresh system for Forward Africa platform with automatic refresh, secure token management, and seamless user experience.

## Features

### 🔄 Automatic Token Refresh
- Background refresh 5 minutes before expiry
- Request interception with automatic retry
- Queue management for concurrent requests

### 🔒 Security Features
- Secure refresh token storage
- Token invalidation on logout
- Real-time expiry tracking
- Rate limiting protection

### 🎯 User Experience
- Seamless operation without interruptions
- Visual status indicators (dev mode)
- Graceful error handling
- Automatic login redirect

## Architecture

### Backend Components

#### Token Generation (`backend/middleware/auth.js`)
```javascript
// Access token (24 hours)
const generateToken = (userId, role) => {
  return jwt.sign({
    userId, role,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
  }, JWT_SECRET, { expiresIn: '24h' });
};

// Refresh token (7 days)
const generateRefreshToken = (userId) => {
  return jwt.sign({
    userId, type: 'refresh',
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
  }, JWT_SECRET, { expiresIn: '7d' });
};
```

#### Refresh Endpoint (`backend/routes/secureRoutes.js`)
```javascript
router.post('/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  const decoded = verifyRefreshToken(refreshToken);

  // Verify token exists in database
  const [users] = await pool.execute(
    'SELECT * FROM users WHERE id = ? AND refresh_token = ?',
    [decoded.userId, refreshToken]
  );

  // Generate new tokens
  const newAccessToken = generateToken(user.id, user.role);
  const newRefreshToken = generateRefreshToken(user.id);

  // Update database
  await pool.execute(
    'UPDATE users SET refresh_token = ? WHERE id = ?',
    [newRefreshToken, user.id]
  );

  res.json({
    token: newAccessToken,
    refreshToken: newRefreshToken,
    message: 'Token refreshed successfully'
  });
});
```

### Frontend Components

#### Auth Service (`src/lib/auth.ts`)
```typescript
export const authService = {
  // Store tokens with expiry tracking
  setAuthData: (token: string, refreshToken: string, user: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

    // Calculate expiry time
    const payload = JSON.parse(atob(token.split('.')[1]));
    localStorage.setItem(TOKEN_EXPIRY_KEY, (payload.exp * 1000).toString());
  },

  // Get valid token (refresh if needed)
  getValidToken: async (): Promise<string> => {
    if (authService.shouldRefreshToken()) {
      const refreshResponse = await authService.refreshToken();
      return refreshResponse.token;
    }
    return authService.getToken();
  },

  // Refresh with queue management
  refreshToken: async (): Promise<TokenRefreshResponse> => {
    if (refreshPromise) return refreshPromise;

    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      body: JSON.stringify({ refreshToken: authService.getRefreshToken() })
    }).then(res => res.json())
    .finally(() => { refreshPromise = null; });

    return refreshPromise;
  }
};
```

#### Auth Interceptor (`src/lib/authInterceptor.ts`)
```typescript
class AuthInterceptor {
  private isRefreshing = false;
  private failedQueue: Array<{ resolve: Function; reject: Function }> = [];

  async fetch<T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const token = await authService.getValidToken();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...config,
      headers: { 'Authorization': `Bearer ${token}`, ...config.headers }
    });

    // Handle 401 - attempt refresh
    if (response.status === 401 && !config.skipAuth) {
      if (this.isRefreshing) {
        // Queue request if refresh in progress
        return new Promise((resolve, reject) => {
          this.failedQueue.push({ resolve, reject });
        }).then(() => this.fetch(endpoint, config));
      }

      this.isRefreshing = true;
      try {
        await authService.refreshToken();
        this.processQueue(null, await authService.getValidToken());
        return this.fetch(endpoint, config);
      } catch (error) {
        this.processQueue(error, null);
        authService.clearAuthData();
        window.location.href = '/login';
        throw new Error('Session expired');
      } finally {
        this.isRefreshing = false;
      }
    }

    return { data: await response.json() };
  }
}
```

#### React Hooks (`src/hooks/useTokenRefresh.ts`)
```typescript
export const useTokenRefresh = () => {
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>(() => {
    // Only check token status on client side
    if (typeof window === 'undefined') {
      return {
        isAuthenticated: false,
        isExpired: true,
        shouldRefresh: false,
        expiryTime: null,
        timeUntilExpiry: null,
      };
    }
    // Explicitly type the return value to match TokenStatus interface
    const status = checkTokenStatus();
    return {
      isAuthenticated: status.isAuthenticated,
      isExpired: status.isExpired,
      shouldRefresh: status.shouldRefresh,
      expiryTime: status.expiryTime,
      timeUntilExpiry: status.timeUntilExpiry,
    };
  });
  const [refreshState, setRefreshState] = useState({
    isRefreshing: false,
    lastRefreshTime: null,
    refreshCount: 0,
    error: null
  });

  // Auto-refresh when needed
  useEffect(() => {
    if (tokenStatus.shouldRefresh && !refreshState.isRefreshing) {
      refreshToken();
    }
  }, [tokenStatus.shouldRefresh, refreshState.isRefreshing]);

  return {
    tokenStatus,
    refreshState,
    refreshToken,
    forceLogout,
    timeUntilExpiry: getTimeUntilExpiry(),
    shouldRedirectToLogin: !tokenStatus.isAuthenticated && !refreshState.isRefreshing
  };
};
```

## Usage Examples

### Basic API Request
```typescript
import { apiClient } from '../lib/authInterceptor';

// Automatic token refresh handled
const userProfile = await apiClient.get('/auth/me');
const updatedUser = await apiClient.put('/users/profile', { name: 'New Name' });
```

### Manual Token Refresh
```typescript
import { useTokenRefresh } from '../hooks/useTokenRefresh';

const MyComponent = () => {
  const { refreshToken, timeUntilExpiry } = useTokenRefresh();

  return (
    <div>
      <p>Expires in: {timeUntilExpiry}</p>
      <button onClick={refreshToken}>Refresh Token</button>
    </div>
  );
};
```

### Status Monitoring
```typescript
import { TokenStatusIndicator } from '../components/ui/TokenStatusIndicator';

const AdminDashboard = () => (
  <div>
    <h1>Admin Dashboard</h1>
    <TokenStatusIndicator showDetails={true} showRefreshButton={true} />
  </div>
);
```

## Configuration

### Environment Variables
```bash
# Backend
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# Frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002/api
```

### Token Settings
```typescript
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes
const ACCESS_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
```

## Testing

### Run Tests
```bash
# Start backend
cd backend && npm start

# Run token refresh tests
node test-token-refresh.js
```

### Test Scenarios
1. **Normal Refresh**: Login → Use token → Refresh → Use new token
2. **Expired Token**: Use expired token → Auto refresh → Retry request
3. **Invalid Token**: Invalid refresh token → Proper error handling
4. **Logout**: Logout → Refresh token invalidated
5. **Concurrent**: Multiple requests during refresh → Proper queuing

## Security Features

### Token Storage
- Access tokens in memory
- Refresh tokens in localStorage with expiry tracking
- Automatic cleanup of expired tokens

### Validation
- Server-side token validation
- Real-time expiry checking
- User status verification

### Rate Limiting
- Refresh endpoint: 10 attempts per 15 minutes
- Login endpoint: 5 attempts per 15 minutes
- Account lockout after failed attempts

### Invalidation
- Logout clears refresh tokens
- Password change invalidates all tokens
- Account suspension immediately invalidates tokens

## Monitoring

### Development Mode
- Real-time token status display
- Manual refresh button
- Detailed status information
- Error display for debugging

### Production
- Audit logs for all operations
- Security event tracking
- Performance metrics

## Troubleshooting

### Common Issues

#### Token Refresh Fails
```typescript
const refreshToken = authService.getRefreshToken();
if (!refreshToken) {
  authService.clearAuthData();
  window.location.href = '/login';
}
```

#### Infinite Loop
```typescript
if (refreshPromise) {
  return refreshPromise; // Return existing promise
}
```

#### Race Conditions
```typescript
if (this.isRefreshing) {
  return new Promise((resolve, reject) => {
    this.failedQueue.push({ resolve, reject });
  });
}
```

## Performance

### Optimizations
- Memory caching for access tokens
- Single refresh for multiple requests
- Efficient queue management
- Background proactive refresh

### Monitoring
- Token refresh timing
- Success rates
- Error tracking
- Performance metrics

## Future Enhancements

### Security
- Token fingerprinting
- Geolocation restrictions
- Behavioral analysis

### Performance
- Redis caching
- WebSocket updates
- Service worker support

### User Experience
- Session extensions
- Multi-device support
- Offline capabilities

## Conclusion

The token refresh system provides:
- **Security**: Comprehensive validation and invalidation
- **Reliability**: Automatic refresh with fallbacks
- **User Experience**: Seamless operation
- **Maintainability**: Clear architecture and documentation
- **Scalability**: Future-ready design