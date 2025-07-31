const fetch = require('node-fetch');

class TestAuthHelper {
  constructor(baseUrl = 'http://localhost:3002') {
    this.baseUrl = baseUrl;
    this.token = null;
    this.refreshToken = null;
    this.user = null;
  }

  // Login with real credentials and get valid token
  async login(email, password) {
    try {
      console.log(`🔐 Logging in with email: ${email}`);
      
      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Login failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      this.token = data.token;
      this.refreshToken = data.refreshToken;
      this.user = data.user;
      
      console.log(`✅ Login successful for user: ${data.user.email} (${data.user.role})`);
      return data;
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      throw error;
    }
  }

  // Get authorization header with real token
  getAuthHeaders() {
    if (!this.token) {
      throw new Error('No token available. Please login first.');
    }
    
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  // Refresh token if needed
  async refreshTokenIfNeeded() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available. Please login first.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        this.token = data.token;
        this.refreshToken = data.refreshToken;
        console.log('🔄 Token refreshed successfully');
        return data;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('❌ Token refresh failed:', error.message);
      throw error;
    }
  }

  // Logout
  async logout() {
    if (!this.token) {
      console.log('ℹ️ No token to logout');
      return;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      if (response.ok) {
        console.log('✅ Logout successful');
      } else {
        console.log('⚠️ Logout request failed, but clearing local tokens');
      }
    } catch (error) {
      console.log('⚠️ Logout request failed, but clearing local tokens');
    } finally {
      // Clear tokens regardless of server response
      this.token = null;
      this.refreshToken = null;
      this.user = null;
    }
  }

  // Check if user has specific role
  hasRole(role) {
    return this.user && this.user.role === role;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles) {
    return this.user && roles.includes(this.user.role);
  }

  // Get user info
  getUser() {
    return this.user;
  }

  // Get token info for debugging
  getTokenInfo() {
    if (!this.token) {
      return { hasToken: false };
    }
    
    return {
      hasToken: true,
      tokenLength: this.token.length,
      userRole: this.user?.role,
      userEmail: this.user?.email
    };
  }
}

module.exports = TestAuthHelper; 