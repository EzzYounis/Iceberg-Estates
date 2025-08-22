const express = require('express');
const router = express.Router();

// Import middleware
const { authenticateToken } = require('../middleware/auth');
const {
  validateCreateAppointment,
  validateUpdateAppointment,
  validateAppointmentId,
  validateDateParam,
  validateAppointmentQuery,
  checkAppointmentValidation,
  validateBusinessRules
} = require('../middleware/appointmentValidation');

// Import controllers
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getDaySchedule
} = require('../controllers/appointmentController');

console.log('Setting up appointment routes...');

// All appointment routes require authentication
router.use(authenticateToken);

// POST /api/appointments - Create new appointment
router.post('/',
  validateCreateAppointment,    // Validate input data
  checkAppointmentValidation,   // Check validation results
  validateBusinessRules,        // Check business rules
  createAppointment            // Create the appointment
);

// GET /api/appointments - Get all appointments (with filtering)
router.get('/',
  validateAppointmentQuery,     // Validate query parameters
  checkAppointmentValidation,   // Check validation results
  getAppointments              // Get appointments
);

// GET /api/appointments/schedule/:date - Get day schedule
router.get('/schedule/:date',
  validateDateParam,            // Validate date parameter
  checkAppointmentValidation,   // Check validation results
  getDaySchedule               // Get day schedule
);

// GET /api/appointments/:id - Get specific appointment
router.get('/:id',
  validateAppointmentId,        // Validate appointment ID
  checkAppointmentValidation,   // Check validation results
  getAppointmentById           // Get appointment
);

// PUT /api/appointments/:id - Update existing appointment
router.put('/:id',
  validateAppointmentId,        // Validate appointment ID
  validateUpdateAppointment,    // Validate update data
  checkAppointmentValidation,   // Check validation results
  validateBusinessRules,        // Check business rules
  updateAppointment            // Update the appointment
);

// DELETE /api/appointments/:id - Delete appointment
router.delete('/:id',
  validateAppointmentId,        // Validate appointment ID
  checkAppointmentValidation,   // Check validation results
  deleteAppointment            // Delete the appointment
);

console.log(' Appointment routes configured:');
console.log('   POST   /api/appointments           - Create appointment');
console.log('   GET    /api/appointments           - Get all appointments');
console.log('   GET    /api/appointments/schedule/:date - Get day schedule');
console.log('   GET    /api/appointments/:id       - Get specific appointment');
console.log('   PUT    /api/appointments/:id       - Update appointment');
console.log('   DELETE /api/appointments/:id       - Delete appointment');

// Export the router
module.exports = router;