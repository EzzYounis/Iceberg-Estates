const jwt = require('jsonwebtoken');  // For handling JWT tokens
const config = require('../config/config'); // Our configuration
const User  = require('../models/User'); // User model

console.log('Setting up authentication middleware...');

// Middleware function to check if user is authenticated
const authenticateToken = async (req, res, next) => {
  try {
    console.log('Checking authentication...');
    
    // Get the Authorization header from the request
    const authHeader = req.headers['authorization'];
    
    // Extract the token 
    const token = authHeader && authHeader.split(' ')[1];  // used && so it won't give run time error if token not provided 
    
    // If no token provided
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({
        error: true,
        message: 'Access token required',
        details: 'Please provide a valid authentication token'
      });
    }
    
    // Verify the token using our secret key
    const decoded = jwt.verify(token, config.jwt.secret);
    console.log('Token verified for user:', decoded.email);
    
    // Find the user in the database
    const user = await User.findByPk(decoded.userId);
    
    // Check if user still exists and is active
    if (!user || !user.isActive) {
      console.log('User not found or inactive');
      return res.status(401).json({
        error: true,
        message: 'Invalid token',
        details: 'User account not found or deactivated'
      });
    }
    
    // Add user information to the request object
    // This makes user data available in our route handlers
    req.user = user;
    req.userId = user.id;
    
    console.log('Authentication successful');
    
    // Continue to the next middleware/route handler
    next();
    
  } catch (error) {
    console.log('Token verification failed:', error.message);
    
    // Handle different types of JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: true,
        message: 'Token expired',
        details: 'Please log in again'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: true,
        message: 'Invalid token',
        details: 'Please provide a valid authentication token'
      });
    }
    
    // Generic error
    return res.status(500).json({
      error: true,
      message: 'Authentication error',
      details: 'Something went wrong during authentication'
    });
  }
};

console.log('Authentication middleware ready!');

// Export our middleware functions
module.exports = {
  authenticateToken  // Required authentication
};