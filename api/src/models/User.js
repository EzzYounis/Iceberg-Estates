// Import what we need
const { DataTypes } = require('sequelize'); 
const bcrypt = require('bcryptjs');         // For encrypting
const { sequelize } = require('../config/database'); // Our database connection

console.log('Creating User model (Estate agents)...');

// Define the User model - this creates a 'users' table
const User = sequelize.define('User', {  
  // Primary key - unique identifier for each user
  id: {
    type: DataTypes.UUID,           
    defaultValue: DataTypes.UUIDV4, // Automatically generate a UUID
    primaryKey: true                // This is the main identifier
  },
  
  
  email: {
    type: DataTypes.STRING,   // Text field
    allowNull: false,         //cannot be empty
    unique: true,            
    validate: {
      isEmail: true,         // Must be a valid email format
      notEmpty: true         // Cannot be an empty string
    }
  },
  
  // Password - will be encrypted before storing
  password: {
    type: DataTypes.STRING,
    allowNull: false,         // Required
    validate: {
      len: [6, 100],         // Must be between 6 and 100 characters
      notEmpty: true
    }
  },
  
  // Agent's first name
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50],          // Between 2 and 50 characters
      notEmpty: true
    }
  },
  
  // Agent's last name  
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50],
      notEmpty: true
    }
  },
  
  // Phone number (optional)
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,          // Optional field
    validate: {
      len: [10, 15]          // If provided, must be 10-15 characters
    }
  },
  
  // Whether the user account is active
  isActive: {
    type: DataTypes.BOOLEAN,  // True or false
    defaultValue: true        // New users are active by default
  }
}, {
  // Table configuration
  tableName: 'users',       // Exact name for the table in PostgreSQL
  
  // Create indexes for faster searching
  indexes: [
    {
      unique: true,
      fields: ['email']      // Fast lookup by email address
    }
  ]
});

// HOOKS 

// Before creating a new user, encrypt their password
User.beforeCreate(async (user) => {
  if (user.password) {
    console.log('Encrypting password for new user...');
    const saltRounds = 12;  // How strong the encryption is (higher = more secure but slower)
    user.password = await bcrypt.hash(user.password, saltRounds);
  }
});

// Before updating a user, encrypt password if it was changed
User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    console.log('🔒 Encrypting updated password...');
    const saltRounds = 12;
    user.password = await bcrypt.hash(user.password, saltRounds);
  }
});

// INSTANCE METHODS - Functions we can call on individual user objects

// Check if a provided password matches the encrypted password
User.prototype.validatePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

// Get user's full name
User.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// When converting user to JSON (for sending to frontend), remove password
User.prototype.toJSON = function() {
  // Get all user data
  const values = Object.assign({}, this.get());
  // Remove password field for security
  delete values.password;
  return values;
};

console.log(' User model defined successfully!');

// Make this model available to other files
module.exports = User;