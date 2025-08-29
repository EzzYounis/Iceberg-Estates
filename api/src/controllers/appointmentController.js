// Import what we need
const { User, Appointment } = require('../models');
const travelTimeService = require('../services/travelTimeService');
const postcodeService = require('../services/postcodeService');
const { Op } = require('sequelize'); // For database queries

// Create a new appointment
const createAppointment = async (req, res) => {
  try {
    console.log('Creating new appointment for user:', req.user.email);
    
    // Extract data from request body
    const {
      customerName,
      customerEmail,
      customerPhone,
      propertyAddress,
      propertyPostcode,
      appointmentDate,
      appointmentTime,
      notes,
      agentId // allow agentId to be null for unassigned
    } = req.body;
    
    console.log('Appointment details:');
    console.log('   Customer:', customerName);
    console.log('   Property:', propertyAddress);
    console.log('   Postcode:', propertyPostcode);
    console.log('   Date/Time:', appointmentDate, appointmentTime);
    
    // Step 1: Validate postcode and get coordinates
    console.log('Step 1: Validating postcode...');
    const propertyCoords = await postcodeService.getCoordinates(propertyPostcode);
    console.log('Postcode valid:', propertyCoords.postcode);
    
    // Step 2: Calculate travel information
    console.log('Step 2: Calculating travel information...');
    const travelInfo = await travelTimeService.calculateTravelInfo(propertyPostcode);
    console.log(`Distance: ${travelInfo.distanceKm} km`);
    console.log(`Travel time: ${travelInfo.travelTimeMinutes} minutes`);
    
    // Step 3: Calculate schedule times
    console.log('Step 3: Calculating schedule...');
    const schedule = travelTimeService.calculateScheduleTimes(
      appointmentTime,
      travelInfo.travelTimeMinutes
    );
    
    let assignedUserId = agentId || null;
    let status = assignedUserId ? 'scheduled' : 'unassigned';

    // Only check for conflicts if assigned to an agent
    if (assignedUserId) {
      console.log('Step 4: Checking for conflicts...');
      const conflictCheck = await Appointment.checkConflicts(
        assignedUserId,
        appointmentDate,
        schedule.departureTime,
        schedule.availableAgainTime
      );
      if (conflictCheck.hasConflict) {
        console.log('Appointment conflict detected');
        return res.status(409).json({
          error: true,
          message: 'Appointment conflict detected',
          details: conflictCheck.message,
          conflictingAppointment: {
            id: conflictCheck.conflictingAppointment.id,
            customer: conflictCheck.conflictingAppointment.customerName,
            time: conflictCheck.conflictingAppointment.appointmentTime
          }
        });
      }
      console.log('No conflicts found');
    }

    // Step 5: Create the appointment with all calculated data
    console.log('Step 5: Creating appointment in database...');
    const newAppointment = await Appointment.create({
      userId: assignedUserId,
      // Customer information
      customerName,
      customerEmail: customerEmail || null,
      customerPhone,
      // Property information
      propertyAddress,
      propertyPostcode: propertyCoords.postcode, // Use cleaned postcode
      propertyLatitude: propertyCoords.latitude,
      propertyLongitude: propertyCoords.longitude,
      // Appointment timing
      appointmentDate,
      appointmentTime,
      // Calculated travel information
      distanceKm: travelInfo.distanceKm,
      travelTimeMinutes: travelInfo.travelTimeMinutes,
      departureTime: schedule.departureTime,
      returnTime: schedule.returnTime,
      availableAgainTime: schedule.availableAgainTime,
      // Additional information
      notes: notes || null,
      status
    });
    
    console.log('Appointment created successfully:', newAppointment.id);
    
    // Step 6: Return the appointment with agent information
    const appointmentWithAgent = await Appointment.findByPk(newAppointment.id, {
      include: [{
        model: User,
        as: 'agent',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });
    
    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: {
        appointment: appointmentWithAgent,
        travelInfo: {
          method: travelInfo.routingMethod,
          distance: travelInfo.distanceKm,
          travelTime: travelInfo.travelTimeMinutes
        }
      }
    });
    
  } catch (error) {
    console.error('Appointment creation failed:', error.message);
    
    // Handle specific errors
    if (error.message.includes('Postcode not found')) {
      return res.status(400).json({
        error: true,
        message: 'Invalid postcode',
        details: 'The provided postcode was not found'
      });
    }
    
    if (error.message.includes('Unable to calculate travel time')) {
      return res.status(400).json({
        error: true,
        message: 'Travel calculation failed',
        details: 'Unable to calculate travel time to the property'
      });
    }
    
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
      message: 'Failed to create appointment',
      details: 'An unexpected error occurred'
    });
  }
};

// Get all appointments for the authenticated user
const getAppointments = async (req, res) => {
  try {
    console.log('Getting appointments for user:', req.user.email);
    
    // Parse query parameters for filtering
    const {
      status,
      date,
      startDate,
      endDate,
      limit = 50,
      offset = 0
    } = req.query;
    
    // Build where clause (no userId filter, show all appointments)
    const whereClause = {};
    // Filter by status if provided
    if (status) {
      whereClause.status = status;
    }
    // Filter by date range
    if (date) {
      whereClause.appointmentDate = date;
    } else if (startDate && endDate) {
      whereClause.appointmentDate = {
        [Op.between]: [startDate, endDate]
      };
    } else if (startDate) {
      whereClause.appointmentDate = {
        [Op.gte]: startDate
      };
    } else if (endDate) {
      whereClause.appointmentDate = {
        [Op.lte]: endDate
      };
    }
    console.log('Query filters:', whereClause);
    // Get appointments with agent information
    const appointments = await Appointment.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'agent',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
      order: [
        ['appointmentDate', 'ASC'],
        ['appointmentTime', 'ASC']
      ],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    console.log(`Found ${appointments.count} appointments`);
    
    res.status(200).json({
      success: true,
      message: 'Appointments retrieved successfully',
      data: {
        appointments: appointments.rows,
        pagination: {
          total: appointments.count,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < appointments.count
        }
      }
    });
    
  } catch (error) {
    console.error('Failed to get appointments:', error.message);
    
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve appointments',
      details: 'An unexpected error occurred'
    });
  }
};

// Get a specific appointment by ID
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Getting appointment:', id);
    
    const appointment = await Appointment.findOne({
      where: { id },
      include: [{
        model: User,
        as: 'agent',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });
    
    if (!appointment) {
      console.log('Appointment not found:', id);
      return res.status(404).json({
        error: true,
        message: 'Appointment not found',
        details: 'The requested appointment was not found or you do not have access to it'
      });
    }
    
    console.log('Appointment found:', appointment.customerName);
    
    res.status(200).json({
      success: true,
      message: 'Appointment retrieved successfully',
      data: {
        appointment
      }
    });
    
  } catch (error) {
    console.error('Failed to get appointment:', error.message);
    
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve appointment',
      details: 'An unexpected error occurred'
    });
  }
};

// Update an existing appointment
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Updating appointment:', id);
    
    // Find the appointment
    const appointment = await Appointment.findOne({
      where: { id }
    });
    
    if (!appointment) {
      return res.status(404).json({
        error: true,
        message: 'Appointment not found',
        details: 'The requested appointment was not found'
      });
    }
    
    console.log('Appointment found, checking for updates...');
    
    // Extract updatable fields
    const {
      customerName,
      customerEmail,
      customerPhone,
      propertyAddress,
      propertyPostcode,
      appointmentDate,
      appointmentTime,
      notes,
      status,
      agentId // allow agentId to be updated
    } = req.body;
    
    // Check if time/date/location changed (requires recalculation)
    const timeChanged = appointmentTime && appointmentTime !== appointment.appointmentTime;
    const dateChanged = appointmentDate && appointmentDate !== appointment.appointmentDate;
    const locationChanged = propertyPostcode && propertyPostcode !== appointment.propertyPostcode;
    
    let updatedData = {};
    let recalculateTravel = false;
    
    // Update basic information
    if (customerName) updatedData.customerName = customerName;
    if (customerEmail !== undefined) updatedData.customerEmail = customerEmail;
    if (customerPhone) updatedData.customerPhone = customerPhone;
    if (propertyAddress) updatedData.propertyAddress = propertyAddress;
    if (notes !== undefined) updatedData.notes = notes;

    // Handle agent assignment/unassignment
    if (agentId !== undefined) {
      updatedData.userId = agentId || null;
      if (agentId) {
        updatedData.status = 'scheduled';
      } else {
        updatedData.status = 'unassigned';
      }
    } else if (status) {
      updatedData.status = status;
    }
    
    // If time/date/location/agent changed, recalculate travel info and check conflicts
    if (timeChanged || dateChanged || locationChanged || agentId !== undefined) {
      console.log('Time/date/location/agent changed, recalculating...');
      recalculateTravel = true;

      const newPostcode = propertyPostcode || appointment.propertyPostcode;
      const newDate = appointmentDate || appointment.appointmentDate;
      const newTime = appointmentTime || appointment.appointmentTime;
      const newAgentId = agentId !== undefined ? agentId : appointment.userId;

      // Validate new postcode if changed
      if (locationChanged) {
        const propertyCoords = await postcodeService.getCoordinates(newPostcode);
        updatedData.propertyPostcode = propertyCoords.postcode;
        updatedData.propertyLatitude = propertyCoords.latitude;
        updatedData.propertyLongitude = propertyCoords.longitude;
      }

      // Recalculate travel information
      const travelInfo = await travelTimeService.calculateTravelInfo(newPostcode);
      const schedule = travelTimeService.calculateScheduleTimes(newTime, travelInfo.travelTimeMinutes);

      // Only check for conflicts if assigning to an agent
      if (newAgentId) {
        const conflictCheck = await Appointment.checkConflicts(
          newAgentId,
          newDate,
          schedule.departureTime,
          schedule.availableAgainTime,
          id // Exclude this appointment from conflict check
        );

        if (conflictCheck.hasConflict) {
          return res.status(409).json({
            error: true,
            message: 'Appointment conflict detected',
            details: conflictCheck.message
          });
        }
      }

      // Update calculated fields
      updatedData.appointmentDate = newDate;
      updatedData.appointmentTime = newTime;
      updatedData.distanceKm = travelInfo.distanceKm;
      updatedData.travelTimeMinutes = travelInfo.travelTimeMinutes;
      updatedData.departureTime = schedule.departureTime;
      updatedData.returnTime = schedule.returnTime;
      updatedData.availableAgainTime = schedule.availableAgainTime;
    }
    
    // Update the appointment
    await appointment.update(updatedData);
    
    console.log('Appointment updated successfully');
    
    // Get updated appointment with agent info
    const updatedAppointment = await Appointment.findByPk(id, {
      include: [{
        model: User,
        as: 'agent',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });
    
    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: {
        appointment: updatedAppointment,
        recalculated: recalculateTravel
      }
    });
    
  } catch (error) {
    console.error('Failed to update appointment:', error.message);
    
    if (error.message.includes('Postcode not found')) {
      return res.status(400).json({
        error: true,
        message: 'Invalid postcode',
        details: 'The provided postcode was not found'
      });
    }
    
    res.status(500).json({
      error: true,
      message: 'Failed to update appointment',
      details: 'An unexpected error occurred'
    });
  }
};

// Delete an appointment
const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting appointment:', id);
    
    const appointment = await Appointment.findOne({
      where: { id }
    });
    
    if (!appointment) {
      return res.status(404).json({
        error: true,
        message: 'Appointment not found',
        details: 'The requested appointment was not found'
      });
    }
    
    // Store appointment details for response
    const appointmentDetails = {
      customer: appointment.customerName,
      date: appointment.appointmentDate,
      time: appointment.appointmentTime
    };
    
    // Delete the appointment
    await appointment.destroy();
    
    console.log('✅ Appointment deleted successfully');
    
    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully',
      data: {
        deletedAppointment: appointmentDetails
      }
    });
    
  } catch (error) {
    console.error('Failed to delete appointment:', error.message);
    
    res.status(500).json({
      error: true,
      message: 'Failed to delete appointment',
      details: 'An unexpected error occurred'
    });
  }
};

// Get agent's schedule for a specific date
const getDaySchedule = async (req, res) => {
  try {
    const { date } = req.params;
    console.log('Getting schedule for date:', date, 'user:', req.user.email);
    
    const appointments = await Appointment.findAll({
      where: {
        appointmentDate: date,
        status: ['scheduled'], // Only scheduled appointments
        userId: req.user.id // Only appointments for the logged-in user
      },
      order: [['appointmentTime', 'ASC']],
      attributes: [
        'id', 'customerName', 'propertyAddress', 'appointmentTime',
        'departureTime', 'returnTime', 'availableAgainTime',
        'travelTimeMinutes', 'distanceKm', 'userId'
      ]
    });
    
    // Calculate schedule summary
    const scheduleInfo = {
      totalAppointments: appointments.length,
      totalTravelTime: appointments.reduce((sum, apt) => sum + (apt.travelTimeMinutes * 2), 0), // Round trip
      totalDistance: appointments.reduce((sum, apt) => sum + (apt.distanceKm * 2), 0), // Round trip
      busyPeriods: appointments.map(apt => ({
        start: apt.departureTime,
        end: apt.availableAgainTime,
        customer: apt.customerName,
        userId: apt.userId
      }))
    };
    
    res.status(200).json({
      success: true,
      message: 'Day schedule retrieved successfully',
      data: {
        date,
        appointments,
        summary: scheduleInfo
      }
    });
    
  } catch (error) {
    console.error('Failed to get day schedule:', error.message);
    
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve schedule',
      details: 'An unexpected error occurred'
    });
  }
};

console.log('Appointment controller ready!');

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getDaySchedule
};