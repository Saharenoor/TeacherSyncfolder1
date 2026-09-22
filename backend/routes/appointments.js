const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// GET /api/appointments - Get appointments for a user (student or teacher)
router.get('/', appointmentController.getAppointments);

// POST /api/appointments - Create a new appointment request
router.post('/', appointmentController.createAppointment);

// PUT /api/appointments/:id - Update appointment status (accept/reject)
router.put('/:id', appointmentController.updateAppointmentStatus);

// DELETE /api/appointments/:id - Cancel appointment
router.delete('/:id', appointmentController.cancelAppointment);

module.exports = router;
