const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');

// GET /api/teachers - Get all teachers with optional search/filter
router.get('/', teacherController.getTeachers);

// GET /api/teachers/:id - Get teacher by ID
router.get('/:id', teacherController.getTeacherById);

// GET /api/teachers/:id/availability - Get teacher's availability
router.get('/:id/availability', teacherController.getTeacherAvailability);

// PUT /api/teachers/:id/attendance - Update teacher attendance
router.put('/:id/attendance', teacherController.updateAttendance);

module.exports = router;
