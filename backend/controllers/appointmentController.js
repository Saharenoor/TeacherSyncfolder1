const { Appointment, Teacher } = require('../models');
const notificationService = require('../services/notificationService');

// Get appointments for a user (student or teacher)
const getAppointments = async (req, res) => {
  try {
    const { userType, userId } = req.query; // userType: 'student' or 'teacher', userId: email or teacherId

    let whereClause = {};
    if (userType === 'student') {
      whereClause.studentEmail = userId;
    } else if (userType === 'teacher') {
      whereClause.teacherId = userId;
    }

    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [{ model: Teacher, attributes: ['name', 'department'] }],
      order: [['createdAt', 'DESC']],
    });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new appointment request
const createAppointment = async (req, res) => {
  try {
    const { teacherId, studentName, studentEmail, query, timeSlot, duration, venue } = req.body;

    const appointment = await Appointment.create({
      teacherId,
      studentName,
      studentEmail,
      query,
      timeSlot,
      duration,
      venue,
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update appointment status (accept/reject)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, venue } = req.body;
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [{ model: Teacher }],
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    appointment.status = status;
    if (venue) appointment.venue = venue;
    await appointment.save();

    // Send notification
    if (status === 'accepted') {
      await notificationService.sendAppointmentConfirmation(appointment, appointment.Teacher);
    } else if (status === 'rejected') {
      // Suggest next 3 available slots
      const availabilityService = require('../services/availabilityService');
      const availability = availabilityService.computeAvailability(appointment.Teacher);
      const suggestedSlots = availability.freeSlots.slice(0, 3).map(slot => `${slot.start}-${slot.end}`);
      await notificationService.sendAppointmentRejection(appointment, appointment.Teacher, suggestedSlots);
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    await appointment.destroy();
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
  cancelAppointment,
};
