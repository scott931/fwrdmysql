const jwt = require('jsonwebtoken');
const { executeQuery } = require('../lib/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Authentication middleware
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Get user from database to ensure they still exist and get current role
        const [users] = await executeQuery(
            'SELECT id, email, name, role, is_active FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }

        const user = users[0];

        if (!user.is_active) {
            return res.status(401).json({ error: 'User account is deactivated' });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        } else {
            console.error('Token verification error:', error);
            return res.status(500).json({ error: 'Token verification failed' });
        }
    }
};

// Role-based authorization middleware
const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Insufficient permissions',
                required: allowedRoles,
                current: req.user.role
            });
        }

        next();
    };
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        const [users] = await executeQuery(
            'SELECT id, email, name, role, is_active FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (users.length > 0 && users[0].is_active) {
            req.user = users[0];
        } else {
            req.user = null;
        }
    } catch (error) {
        req.user = null;
    }

    next();
};

// Check if user owns the resource or is admin
const authorizeOwnership = (resourceType) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Admins can access everything
        if (req.user.role === 'admin') {
            return next();
        }

        try {
            let resourceId;
            let ownerField;

            // Determine resource ID and owner field based on resource type
            switch (resourceType) {
                case 'course':
                    resourceId = req.params.courseId || req.params.id;
                    ownerField = 'instructor_id';
                    break;
                case 'lesson':
                    resourceId = req.params.lessonId || req.params.id;
                    ownerField = 'instructor_id';
                    break;
                case 'user':
                    resourceId = req.params.userId || req.params.id;
                    ownerField = 'id';
                    break;
                default:
                    return res.status(400).json({ error: 'Invalid resource type' });
            }

            if (!resourceId) {
                return res.status(400).json({ error: 'Resource ID required' });
            }

            // Check if user owns the resource
            const [resources] = await executeQuery(
                `SELECT * FROM ${resourceType}s WHERE id = ? AND ${ownerField} = ?`,
                [resourceId, req.user.id]
            );

            if (resources.length === 0) {
                return res.status(403).json({ error: 'Access denied' });
            }

            req.resource = resources[0];
            next();
        } catch (error) {
            console.error('Ownership check error:', error);
            return res.status(500).json({ error: 'Authorization check failed' });
        }
    };
};

// Check if user has permission for specific action
const authorizeAction = (action) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        try {
            // Get user permissions
            const [permissions] = await executeQuery(
                `SELECT p.permission_name
                 FROM user_permissions up
                 JOIN permissions p ON up.permission_id = p.id
                 WHERE up.user_id = ?`,
                [req.user.id]
            );

            const userPermissions = permissions.map(p => p.permission_name);

            // Check if user has the required permission
            if (!userPermissions.includes(action) && req.user.role !== 'admin') {
                return res.status(403).json({
                    error: 'Insufficient permissions for this action',
                    required: action,
                    current: userPermissions
                });
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            return res.status(500).json({ error: 'Permission check failed' });
        }
    };
};

// Rate limiting middleware
const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    const requests = new Map();

    return (req, res, next) => {
        const key = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        const windowStart = now - windowMs;

        // Clean old requests
        if (requests.has(key)) {
            requests.set(key, requests.get(key).filter(timestamp => timestamp > windowStart));
        } else {
            requests.set(key, []);
        }

        const userRequests = requests.get(key);

        if (userRequests.length >= maxRequests) {
            return res.status(429).json({
                error: 'Too many requests',
                retryAfter: Math.ceil(windowMs / 1000)
            });
        }

        userRequests.push(now);
        next();
    };
};

// Generate JWT token
const generateToken = (userId, role) => {
    return jwt.sign(
        {
            userId,
            role,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        },
        JWT_SECRET
    );
};

// Verify JWT token without database check (for performance)
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = {
    authenticateToken,
    authorizeRole,
    optionalAuth,
    authorizeOwnership,
    authorizeAction,
    rateLimit,
    generateToken,
    verifyToken
};