// Load environment variables
require('dotenv').config();

// Export all our configuration settings
module.exports = {
  // Server settings
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'iceberg_estates',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    dialect: 'postgres', 
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  },

  // JWT (login token) settings
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  apis: {
  postcodes: {
    baseUrl: 'https://api.postcodes.io' //api to get postalcodes and geolocation data
  },
  openroute: {
    baseUrl: 'https://api.openrouteservice.org',// an API that provides routing and geolocation services
    apiKey: process.env.OPENROUTE_API_KEY
  }
},

  // Business logic settings
  business: {
    officePostcode: process.env.OFFICE_POSTCODE || 'CM2 7PJ',
    appointmentDurationMinutes: 60, // All appointments are 1 hour
    
  }
};