const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

console.log('Creating Appointment model...');

// Define the Appointment model
const Appointment = sequelize.define('Appointment', {
  // Primary key
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // Foreign key - which agent owns this appointment
  userId: {
    type: DataTypes.UUID,
    allowNull: true, // Allow null for unassigned appointments
    references: {
      model: 'users',  // References the users table
      key: 'id'
    }
  },
  
  // CUSTOMER INFORMATION
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 100],
      notEmpty: true
    }
  },
  
  customerEmail: {
    type: DataTypes.STRING,
    allowNull: true, // Email is optional
    validate: {
      isEmail: true
    }
  },
  
  customerPhone: {
    type: DataTypes.STRING,
    allowNull: false, // Phone is required for contact
    validate: {
      len: [10, 15],
      notEmpty: true
    }
  },
  
  // PROPERTY INFORMATION
  propertyAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [10, 500],
      notEmpty: true
    }
  },
  
  propertyPostcode: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      is: /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i
    }
  },
  
  // APPOINTMENT TIMING
  appointmentDate: {
    type: DataTypes.DATEONLY, // Just the date (YYYY-MM-DD)
    allowNull: false,
    validate: {
      isDate: true,
      isAfter: new Date().toISOString().split('T')[0] // Must be future date
    }
  },
  
  appointmentTime: {
    type: DataTypes.TIME, // Just the time (HH:MM:SS)
    allowNull: false
  },
  
  // Will be auto calculated
  distanceKm: {
    type: DataTypes.DECIMAL(8, 2), // Up to 999999.99 km
    allowNull: true,
    comment: 'Distance from office to property in kilometers'
  },
  
  travelTimeMinutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Travel time from office to property in minutes'
  },
  
  departureTime: {
    type: DataTypes.TIME,
    allowNull: true,
    comment: 'Time agent must leave office to be on time'
  },
  
  returnTime: {
    type: DataTypes.TIME,
    allowNull: true,
    comment: 'Time agent returns to office after appointment'
  },
  
  availableAgainTime: {
    type: DataTypes.TIME,
    allowNull: true,
    comment: 'Time agent is available for next appointment'
  },
  
  // GEOCODING INFORMATION (for mapping)
  propertyLatitude: {
    type: DataTypes.DECIMAL(10, 8), // Precise coordinates
    allowNull: true
  },
  
  propertyLongitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  
  // STATUS AND NOTES
  status: {
    type: DataTypes.ENUM('unassigned', 'scheduled', 'completed', 'cancelled', 'no_show'),
    defaultValue: 'unassigned'
  },
  
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Additional notes about the appointment'
  }
}, {
  // Table configuration
  tableName: 'appointments',
  
  // Database indexes for faster queries
  indexes: [
    {
      fields: ['user_id'] // Fast lookup by agent
    },
    {
      fields: ['appointment_date'] // Fast lookup by date
    },
    {
      fields: ['user_id', 'appointment_date'] // Fast lookup by agent and date
    },
    {
      fields: ['property_postcode'] // Fast lookup by postcode
    },
    {
      fields: ['status'] // Fast lookup by status
    }
  ]
});

// INSTANCE METHODS - Functions we can call on individual appointments

// Get combined appointment datetime
Appointment.prototype.getAppointmentDateTime = function() {
  return new Date(`${this.appointmentDate}T${this.appointmentTime}`);
};

// Get combined departure datetime
Appointment.prototype.getDepartureDateTime = function() {
  if (!this.departureTime) return null;
  return new Date(`${this.appointmentDate}T${this.departureTime}`);
};

// Get combined return datetime
Appointment.prototype.getReturnDateTime = function() {
  if (!this.returnTime) return null;
  return new Date(`${this.appointmentDate}T${this.returnTime}`);
};

// Get combined available again datetime
Appointment.prototype.getAvailableAgainDateTime = function() {
  if (!this.availableAgainTime) return null;
  return new Date(`${this.appointmentDate}T${this.availableAgainTime}`);
};

// Calculate appointment duration (always 1 hour as per requirements)
Appointment.prototype.getDurationMinutes = function() {
  return 60; // All appointments are 1 hour
};

// Check if appointment is in the future
Appointment.prototype.isFuture = function() {
  const appointmentDateTime = this.getAppointmentDateTime();
  return appointmentDateTime > new Date();
};

// Check if appointment is today
Appointment.prototype.isToday = function() {
  const today = new Date().toISOString().split('T')[0];
  return this.appointmentDate === today;
};



Appointment.checkConflicts = async function(userId, appointmentDate, departureTime, availableAgainTime, excludeId = null) {
  
  const whereClause = {
    userId,
    appointmentDate,
    status: ['scheduled'] // Only check against scheduled appointments
  };
  
  // If we're updating an existing appointment, no conflict with itself
  if (excludeId) {
    whereClause.id = { [sequelize.Sequelize.Op.ne]: excludeId };
  }
  
  // Get all appointments for this agent on this date
  const existingAppointments = await this.findAll({
    where: whereClause,
    attributes: ['id', 'departureTime', 'availableAgainTime', 'appointmentTime', 'customerName']
  });
  
  
  // Check for time conflicts
  const newStart = new Date(`${appointmentDate}T${departureTime}`);
  const newEnd = new Date(`${appointmentDate}T${availableAgainTime}`);
  
  for (const appointment of existingAppointments) {
    const existingStart = new Date(`${appointmentDate}T${appointment.departureTime}`);
    const existingEnd = new Date(`${appointmentDate}T${appointment.availableAgainTime}`);
    
    // Check if time ranges overlap
    // Two ranges overlap if: startA < endB AND endA > startB
    if (newStart < existingEnd && newEnd > existingStart) {
      return {
        hasConflict: true,
        conflictingAppointment: appointment,
        message: `Conflicts with appointment for ${appointment.customerName} at ${appointment.appointmentTime}`
      };
    }
  }
  
  console.log(' No conflicts found');
  return { hasConflict: false };
};

// Get appointments for a specific date range
Appointment.getByDateRange = async function(userId, startDate, endDate) {
  return await this.findAll({
    where: {
      userId,
      appointmentDate: {
        [sequelize.Sequelize.Op.between]: [startDate, endDate]
      }
    },
    order: [['appointmentDate', 'ASC'], ['appointmentTime', 'ASC']]
  });
};

console.log('Appointment model defined successfully!');

module.exports = Appointment;