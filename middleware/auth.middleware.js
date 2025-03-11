const jwt = require('jsonwebtoken');
const BlacklistedToken = require('../models/blacklistedToken.model');
const Admin = require('../models/admin.model');

exports.verifyToken = async (req, res, next) => {
    try {
        // Get auth header
        const authHeader = req.headers.authorization;
        
        // Check if auth header exists
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }
        
        // Extract token from header
        const token = authHeader.split(' ')[1];
        
        // Check if token exists after splitting
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }
        
        // Check if token is blacklisted
        const isBlacklisted = await BlacklistedToken.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({
                success: false,
                message: 'Token is no longer valid'
            });
        }
        
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Optional: Fetch admin from database to ensure admin still exists
        if (decoded.id) {
            const admin = await Admin.findById(decoded.id);
            if (!admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Admin not found'
                });
            }
        }
        
        // Set decoded token on request object
        req.user = decoded;
        
        // Continue with the request
        next();
    } catch (error) {
        console.error('Token verification error:', error.message);
        
        // Handle different types of errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token format'
            });
        } else if (error.name === 'NotBeforeError') {
            return res.status(401).json({
                success: false,
                message: 'Token not active'
            });
        }
        
        // Default error response
        return res.status(401).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

// Middleware to check if user is an admin
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
};