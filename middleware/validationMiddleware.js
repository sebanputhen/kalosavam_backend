const { validationResult } = require('express-validator');

// Validation middleware to check for validation errors
const validationMiddleware = (req, res, next) => {
  // Check for validation errors from express-validator
  const errors = validationResult(req);

  // If there are validation errors, return them
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      })),
      success: false
    });
  }

  // If no errors, proceed to the next middleware
  next();
};

module.exports = validationMiddleware;