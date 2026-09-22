const { sequelize } = require('../config/database');
const Teacher = require('./Teacher');
const Cabin = require('./Cabin');
const Appointment = require('./Appointment');

// Associations
Appointment.belongsTo(Teacher, { foreignKey: 'teacherId' });
Teacher.hasMany(Appointment, { foreignKey: 'teacherId' });

// Sync database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: false }); // Set to true for development to drop and recreate tables
    console.log('Database synced successfully.');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
};

module.exports = {
  sequelize,
  Teacher,
  Cabin,
  Appointment,
  syncDatabase,
};
