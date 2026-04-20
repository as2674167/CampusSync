const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided, access denied' });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId).select('-password');
        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'Invalid token, user not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        res.status(500).json({ message: 'Server error during authentication' });
    }
};

// Check if user has required role
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Access denied, no user found' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}` 
            });
        }

        next();
    };
};

// Optional auth: attach req.user if token exists, otherwise continue as guest
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // no token → treat as public
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive) {
      return next(); // invalid user → behave as unauthenticated
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error('Optional auth error:', error);
    // On token error, also fall back to guest instead of 401
    return next();
  }
};

// Check if user is admin or organizer or the resource owner
const authorizeOwnerOrAdmin = async (req, res, next) => {
    try {
        const user = req.user;

        // Admin has access to everything
        if (user.role === 'admin') {
            return next();
        }

        // For organizers, check if they own the resource
        if (user.role === 'organizer') {
            // This middleware should be used with routes that have resourceId
            // The route handler should implement the ownership check
            return next();
        }

        // Students can only access their own resources
        if (user.role === 'student') {
            // Allow access only to own profile or registrations
            if (req.params.userId && req.params.userId !== user._id.toString()) {
                return res.status(403).json({ message: 'Access denied' });
            }
            return next();
        }

        res.status(403).json({ message: 'Access denied' });
    } catch (error) {
        console.error('Authorization error:', error);
        res.status(500).json({ message: 'Server error during authorization' });
    }
};

module.exports = {
  authenticate,
  authorize,
  authorizeOwnerOrAdmin,
  optionalAuth,          
};