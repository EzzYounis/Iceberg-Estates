// Import what we need
const express = require('express');
const router = express.Router(); // Create a new router

// Import our middleware
const { validateRegister, validateLogin, checkValidation } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// Import our controller functions
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
} = require('../controllers/authController');

console.log('Setting up authentication routes...');

// POST /api/auth/register - Register a new user
router.post('/register', 
  validateRegister,    // First: Validate the input data
  checkValidation,     // Second: Check if validation passed
  register            // Third: If all good, run the register function
);

// POST /api/auth/login - User login
router.post('/login',
  validateLogin,       // First: Validate login data
  checkValidation,     // Second: Check validation
  login               // Third: Run login function
);

// GET /api/auth/profile - Get current user profile (requires authentication)
router.get('/profile',
  authenticateToken,   // First: Check if user is logged in
  getProfile          
);

// PUT /api/auth/profile - Update user profile (requires authentication)
router.put('/profile',
  authenticateToken,   
  // TODO: Add validation for profile update
  updateProfile       
);

// PUT /api/auth/change-password - Change password (requires authentication)
router.put('/change-password',
  authenticateToken,   
  // TODO: Add validation for password change
  changePassword      
);

console.log('Authentication routes configured:');
console.log('   POST /api/auth/register    - Register new user');
console.log('   POST /api/auth/login       - User login');
console.log('   GET  /api/auth/profile     - Get user profile');
console.log('   PUT  /api/auth/profile     - Update profile');
console.log('   PUT  /api/auth/change-password - Change password');

// Export the router
module.exports = router;