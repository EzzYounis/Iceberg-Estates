//Import required libraries
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config(); // Load environment variables
const authRoutes = require('./routes/authRoutes');
const { testConnection, syncDatabase } = require('./config/database');
const appointmentRoutes = require('./routes/appointmentRoutes');

// Create Express app
const app = express();

const PORT = process.env.PORT || 3000;

//Test Connection on startup
async function initializeDatabase() {
  console.log('Initializing database...');
  const connectionSuccess = await testConnection();
  if (connectionSuccess) {
    await syncDatabase({ force: false });
    console.log('Database initialization complete!');
  } else {
    console.log('Database not connected.');
  }
}
initializeDatabase();



app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      fontSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));


app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3001', 'http://localhost:8080'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
  res.json({ 
    message: 'Iceberg Estates API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: '/api/auth'
    }
  });
});


const agentRoutes = require('./routes/agentRoutes');
const validatePostcodeRoute = require('./routes/validatePostcode');
//Authentication Routes : /api/auth/register  /api/auth/login  /api/auth/profile
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes); // Appointment routes 
app.use('/api/agents', agentRoutes); // Agent routes

// Postcode validation route
app.use('/api/validate-postcode', validatePostcodeRoute);




app.listen(PORT, () => {
  console.log(`Server running on: http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Started at: ${new Date().toLocaleString()}`);
});