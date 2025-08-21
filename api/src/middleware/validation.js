// Import validation library
const { body, validationResult } = require('express-validator');

console.log('✅ Setting up validation middleware...');

// Validation rules for user registration
const validateRegister = [
  // Email validation
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail() // Converts to lowercase and trims whitespace
    .isLength({ min: 5, max: 255 })
    .withMessage('Email must be between 5 and 255 characters'),
    
  // Password validation
  body('password')
    .isLength({ min: 6, max: 100 })
    .withMessage('Password must be between 6 and 100 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
  // First name validation
  body('firstName')
    .trim() // Remove spaces from beginning and end
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),
    
  // Last name validation
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),
    
  // Phone number validation (optional)
  body('phoneNumber')
    .optional() // This field is not required
    .isMobilePhone('en-GB') // UK phone number format
    .withMessage('Please provide a valid UK phone number')
];

// Validation rules for user login
const validateLogin = [
  // Email validation
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
    
  // Password validation (less strict for login)
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Password cannot be empty')
];

// Middleware function to check validation results
const checkValidation = (req, res, next) => {
  console.log('🔍 Checking input validation...');
  
  // Get validation errors
  const errors = validationResult(req);
  
  // If there are validation errors
  if (!errors.isEmpty()) {
    console.log(' Validation failed:', errors.array());
    
    // Format errors for better readability
    const formattedErrors = errors.array().map(error => ({
      field: error.path,        // Which field has the error
      message: error.msg,       // Error message
      value: error.value        // The invalid value (but hide passwords)
    }));
    
    // Hide password values in error responses
    formattedErrors.forEach(error => {
      if (error.field === 'password') {
        error.value = '[HIDDEN]';
      }
    });
    
    return res.status(400).json({
      error: true,
      message: 'Validation failed',
      details: formattedErrors
    });
  }
  
  console.log('Validation passed');
  // If no errors, continue to the next middleware/route
  next();
};

console.log('Validation middleware ready!');

// Export validation functions
module.exports = {
  validateRegister,
  validateLogin,
  checkValidation
};