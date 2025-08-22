const bcrypt = require('bcryptjs');           
const jwt = require('jsonwebtoken');          
const  User  = require('../models/User');   
const config = require('../config/config');   

console.log('Setting up authentication controller...');

// Controller for user registration
const register = async (req, res) => {
  try {
    console.log('Processing user registration...');
    
    // Extract data from request body
    const { email, password, firstName, lastName, phoneNumber } = req.body;
    
    console.log('Attempting to register user:', email);
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(409).json({
        error: true,
        message: 'User already exists',
        details: 'An account with this email address already exists'
      });
    }
    
    // Create new user
    const newUser = await User.create({
      email,
      password,
      firstName,
      lastName,
      phoneNumber: phoneNumber || null // Set to null if not provided
    });
    
    console.log('User created successfully:', newUser.id);
    
    // Create JWT token for the new user
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        fullName: newUser.getFullName()
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    console.log('JWT token created for user');
    
    // Send response (password is automatically removed by User.toJSON())
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: newUser,
        token,
        expiresIn: config.jwt.expiresIn
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error.message);
    
    // Handle unique constraint error (duplicate email)
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        error: true,
        message: 'Email already in use',
        details: 'An account with this email address already exists'
      });
    }
    
    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: true,
        message: 'Validation error',
        details: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    
    // Generic error
    res.status(500).json({
      error: true,
      message: 'Registration failed',
      details: 'An unexpected error occurred during registration'
    });
  }
};

// Controller for user login
const login = async (req, res) => {
  try {
    console.log('Processing user login...');
    
    // Extract data from request body
    const { email, password } = req.body;
    
    console.log('Login attempt for user:', email);
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    // If user doesn't exist
    if (!user) {
      console.log(' User not found:', email);
      return res.status(401).json({
        error: true,
        message: 'Invalid credentials',
        details: 'Email or password is incorrect'
      });
    }
    
    // Check if user account is active
    if (!user.isActive) {
      console.log('ser account is deactivated:', email);
      return res.status(401).json({
        error: true,
        message: 'Account deactivated',
        details: 'Your account has been deactivated. Please contact support.'
      });
    }
    
    // Validate password
    const isValidPassword = await user.validatePassword(password);
    
    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({
        error: true,
        message: 'Invalid credentials',
        details: 'Email or password is incorrect'
      });
    }
    
    console.log('Password validated for user:', email);
    
    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        fullName: user.getFullName()
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    console.log('JWT token created for user login');
    
    // Send response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user, // Password automatically removed by toJSON()
        token,
        expiresIn: config.jwt.expiresIn
      }
    });
    
  } catch (error) {
    console.error('Login error:', error.message);
    
    res.status(500).json({
      error: true,
      message: 'Login failed',
      details: 'An unexpected error occurred during login'
    });
  }
};

// Controller to get current user profile
const getProfile = async (req, res) => {
  try {
    console.log('Getting user profile for:', req.user.email);
    
    // req.user is set by our authentication middleware
    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: req.user
      }
    });
    
  } catch (error) {
    console.error('Profile retrieval error:', error.message);
    
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve profile',
      details: 'An unexpected error occurred'
    });
  }
};

// Controller to update user profile
const updateProfile = async (req, res) => {
  try {
    console.log('Updating profile for user:', req.user.email);
    
    // Extract updatable fields from request body
    const { firstName, lastName, phoneNumber } = req.body;
    
    // Update user
    await req.user.update({
      firstName: firstName || req.user.firstName,
      lastName: lastName || req.user.lastName,
      phoneNumber: phoneNumber || req.user.phoneNumber
    });
    
    console.log('Profile updated successfully');
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: req.user
      }
    });
    
  } catch (error) {
    console.error('💥 Profile update error:', error.message);
    
    res.status(500).json({
      error: true,
      message: 'Failed to update profile',
      details: 'An unexpected error occurred'
    });
  }
};

// Controller to change password
const changePassword = async (req, res) => {
  try {
    console.log('Processing password change for user:', req.user.email);
    
    const { currentPassword, newPassword } = req.body;
    
    // Validate current password
    const isValidCurrentPassword = await req.user.validatePassword(currentPassword);
    
    if (!isValidCurrentPassword) {
      return res.status(400).json({
        error: true,
        message: 'Invalid current password',
        details: 'Please provide your correct current password'
      });
    }
    
    // Update password (will be automatically encrypted by User model)
    await req.user.update({ password: newPassword });
    
    console.log('Password changed successfully');
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      details: 'Your password has been updated'
    });
    
  } catch (error) {
    console.error('Password change error:', error.message);
    
    res.status(500).json({
      error: true,
      message: 'Failed to change password',
      details: 'An unexpected error occurred'
    });
  }
};

console.log('Authentication controller ready!');

// Export all controller functions
module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};