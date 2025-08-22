const { body, param, query, validationResult } = require('express-validator');

console.log('Setting up appointment validation...');

// Validation for creating appointments
const validateCreateAppointment = [
  // Customer information
  body('customerName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-\.]+$/)
    .withMessage('Customer name can only contain letters, spaces, hyphens, apostrophes, and periods'),
    
  body('customerEmail')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
    
  body('customerPhone')
    .trim()
    .isMobilePhone('en-GB')
    .withMessage('Please provide a valid UK phone number'),
    
  // Property information
  body('propertyAddress')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Property address must be between 10 and 500 characters')
    .notEmpty()
    .withMessage('Property address is required'),
    
  body('propertyPostcode')
    .trim()
    .matches(/^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i)
    .withMessage('Please provide a valid UK postcode')
    .customSanitizer(value => value.toUpperCase().replace(/\s/g, '')), // Clean postcode
    
  // Appointment timing
  body('appointmentDate')
    .isDate({ format: 'YYYY-MM-DD' })
    .withMessage('Please provide a valid date in YYYY-MM-DD format')
    .custom(value => {
      const appointmentDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      
      if (appointmentDate < today) {
        throw new Error('Appointment date must be in the future');
      }
      
      // Don't allow appointments more than 1 year in advance
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      
      if (appointmentDate > oneYearFromNow) {
        throw new Error('Appointment date cannot be more than 1 year in advance');
      }
      
      return true;
    }),
    
  body('appointmentTime')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid time in HH:MM format')
    .custom(value => {
      const [hours, minutes] = value.split(':').map(Number);
      
      // Business hours: 8:00 AM to 6:00 PM
      if (hours < 8 || hours > 18) {
        throw new Error('Appointments must be between 8:00 AM and 6:00 PM');
      }
      
      // Only allow appointments on the hour or half hour
      if (minutes !== 0 && minutes !== 30) {
        throw new Error('Appointments can only be scheduled at :00 or :30 minutes');
      }
      
      return true;
    }),
    
  // Optional notes
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

// Validation for updating appointments
const validateUpdateAppointment = [
  // Same validations as create, but all fields are optional
  body('customerName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters'),
    
  body('customerEmail')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
    
  body('customerPhone')
    .optional()
    .trim()
    .isMobilePhone('en-GB')
    .withMessage('Please provide a valid UK phone number'),
    
  body('propertyAddress')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Property address must be between 10 and 500 characters'),
    
  body('propertyPostcode')
    .optional()
    .trim()
    .matches(/^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i)
    .withMessage('Please provide a valid UK postcode'),
    
  body('appointmentDate')
    .optional()
    .isDate({ format: 'YYYY-MM-DD' })
    .withMessage('Please provide a valid date in YYYY-MM-DD format')
    .custom(value => {
      if (value) {
        const appointmentDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (appointmentDate < today) {
          throw new Error('Appointment date must be in the future');
        }
      }
      return true;
    }),
    
  body('appointmentTime')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid time in HH:MM format'),
    
  body('status')
    .optional()
    .isIn(['scheduled', 'completed', 'cancelled', 'no_show'])
    .withMessage('Status must be one of: scheduled, completed, cancelled, no_show'),
    
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

// Validation for appointment ID parameter
const validateAppointmentId = [
  param('id')
    .isUUID()
    .withMessage('Invalid appointment ID format')
];

// Validation for date parameter
const validateDateParam = [
  param('date')
    .isDate({ format: 'YYYY-MM-DD' })
    .withMessage('Please provide a valid date in YYYY-MM-DD format')
];

// Validation for query parameters
const validateAppointmentQuery = [
  query('status')
    .optional()
    .isIn(['scheduled', 'completed', 'cancelled', 'no_show'])
    .withMessage('Status must be one of: scheduled, completed, cancelled, no_show'),
    
  query('date')
    .optional()
    .isDate({ format: 'YYYY-MM-DD' })
    .withMessage('Date must be in YYYY-MM-DD format'),
    
  query('startDate')
    .optional()
    .isDate({ format: 'YYYY-MM-DD' })
    .withMessage('Start date must be in YYYY-MM-DD format'),
    
  query('endDate')
    .optional()
    .isDate({ format: 'YYYY-MM-DD' })
    .withMessage('End date must be in YYYY-MM-DD format'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be 0 or greater')
];

// Check validation results
const checkAppointmentValidation = (req, res, next) => {
  console.log('Checking appointment validation...');
  
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    console.log('Appointment validation failed:', errors.array());
    
    const formattedErrors = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      error: true,
      message: 'Validation failed',
      details: formattedErrors
    });
  }
  
  console.log('Appointment validation passed');
  next();
};

// Custom validation for business rules
const validateBusinessRules = (req, res, next) => {
  try {
    console.log('Checking business rules...');
    
    const { appointmentDate, appointmentTime } = req.body;
    
    if (appointmentDate && appointmentTime) {
      const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
      const dayOfWeek = appointmentDateTime.getDay(); // 0 = Sunday, 6 = Saturday
      
      // Check if it's a weekend
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return res.status(400).json({
          error: true,
          message: 'Business rule violation',
          details: 'Appointments cannot be scheduled on weekends'
        });
      }
      
      // Check if it's a reasonable time in the future (at least 1 hour from now)
      const now = new Date();
      const minimumTime = new Date(now.getTime() + (60 * 60 * 1000)); // 1 hour from now
      
      if (appointmentDateTime < minimumTime) {
        return res.status(400).json({
          error: true,
          message: 'Business rule violation',
          details: 'Appointments must be scheduled at least 1 hour in advance'
        });
      }
    }
    
    console.log('Business rules validated');
    next();
    
  } catch (error) {
    console.error('Business rule validation error:', error.message);
    res.status(500).json({
      error: true,
      message: 'Validation error',
      details: 'An error occurred during business rule validation'
    });
  }
};

console.log('Appointment validation ready!');

module.exports = {
  validateCreateAppointment,
  validateUpdateAppointment,
  validateAppointmentId,
  validateDateParam,
  validateAppointmentQuery,
  checkAppointmentValidation,
  validateBusinessRules
};