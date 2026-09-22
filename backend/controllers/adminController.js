const { Teacher, Cabin, Appointment } = require('../models');

// Get all teachers with schedules
const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.findAll();
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all cabins
const getAllCabins = async (req, res) => {
  try {
    const cabins = await Cabin.findAll();
    res.json(cabins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all appointments
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [{ model: Teacher, attributes: ['name', 'department'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get availability computation for a teacher
const getTeacherAvailabilityData = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const availabilityService = require('../services/availabilityService');
    const availability = availabilityService.computeAvailability(teacher);

    res.json({
      teacher: teacher.name,
      schedule: teacher.schedule,
      availability,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllTeachers,
  getAllCabins,
  getAllAppointments,
  getTeacherAvailabilityData,
};
