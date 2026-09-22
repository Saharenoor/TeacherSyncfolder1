const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// GET /api/admin/teachers - Get all teachers
router.get('/teachers', adminController.getAllTeachers);

// GET /api/admin/cabins - Get all cabins
router.get('/cabins', adminController.getAllCabins);

// GET /api/admin/appointments - Get all appointments
router.get('/appointments', adminController.getAllAppointments);

// GET /api/admin/teachers/:id/availability - Get availability data for a teacher
router.get('/teachers/:id/availability', adminController.getTeacherAvailabilityData);

module.exports = router;
