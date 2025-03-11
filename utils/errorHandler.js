/**
 * Global error handler for API responses
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 */
exports.errorHandler = (res, error) => {
    console.error('Error:', error.message);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
  
    // Handle mongoose duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate field value entered'
      });
    }
  
    // Handle mongoose cast errors (invalid IDs)
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: `Invalid ${error.path}: ${error.value}`
      });
    }
  
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
  
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }
  
    // Default error response
    return res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  };