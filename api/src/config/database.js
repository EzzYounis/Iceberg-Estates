// Import Sequelize 
const { Sequelize } = require('sequelize');
// Import configuration
const config = require('./config')

console.log('Setting up database connection...');


const sequelize = new Sequelize(
  config.database.database,   //database credetials form config file
  config.database.username,     
  config.database.password,    
  {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    logging: config.database.logging,

    // Connection pool settings (how many connections to keep open)
    pool: {
      max: 5,          // Maximum 5 connections
      min: 0,          // Minimum 0 connections
      acquire: 30000,  // Wait up to 30 seconds to get a connection
      idle: 10000      // Close connection after 10 seconds of no use
    },
    
    // Settings for how tables are created
    define: {
      timestamps: true,      
      underscored: true,     
      freezeTableName: true  
    }
  }
);




//test database connection
const testConnection = async () => {
  try {
    console.log('Testing database connection...');
    
    // Try to connect to PostgreSQL
    await sequelize.authenticate();
    console.log(`Connected to database: ${config.database.database}`);
    return true;
  } catch (error) {
    console.error('   Error message:', error.message);
    return false;
  }
};



// Function to create tables in the database
const syncDatabase = async (options = {}) => {
  try {
    console.log(' Creating/updating database tables...');
    
    // This creates tables based on our models
    await sequelize.sync(options);
    
    if (options.force) {
      console.log(' Database tables reset and recreated!');
    } else {
      console.log(' Database tables created/updated successfully!');
    }
    
    return true;
  } catch (error) {
    console.error('Failed to create database tables:', error.message);
    throw error;
  }
};



module.exports = {
  sequelize,      // The database connection
  testConnection, // Function to test connection
  syncDatabase    // Function to create tables
};

console.log('✅ Database configuration loaded!');