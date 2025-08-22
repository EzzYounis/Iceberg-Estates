const User = require('./User');
const Appointment = require('./Appointment');

console.log('Setting up model associations...');


// One user can have many appointments
User.hasMany(Appointment, {
  foreignKey: 'userId',
  as: 'appointments',
  onDelete: 'CASCADE' // If user is deleted, delete their appointments
});

// Each appointment belongs to one user
Appointment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'agent' // We can access the agent via appointment.agent
});


// Export all models
module.exports = {
  User,
  Appointment
};