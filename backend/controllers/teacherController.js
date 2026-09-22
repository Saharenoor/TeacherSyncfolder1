const { Teacher, Cabin } = require('../models');

// Get all teachers with optional search and filter
const getTeachers = async (req, res) => {
  try {
    const { search, department, subject } = req.query;
    let whereClause = {};

    if (search) {
      whereClause.name = { [require('sequelize').Op.iLike]: `%${search}%` };
    }
    if (department) {
      whereClause.department = department;
    }
    if (subject) {
      whereClause.subjects = { [require('sequelize').Op.contains]: [subject] };
    }

    const teachers = await Teacher.findAll({
      where: whereClause,
      order: [['isSubjectTeacher', 'DESC'], ['name', 'ASC']],
    });

    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get teacher by ID
const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get teacher's availability for today
const getTeacherAvailability = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Use availability service to compute free slots
    const availabilityService = require('../services/availabilityService');
    const availability = availabilityService.computeAvailability(teacher);

    res.json(availability);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update teacher attendance
const updateAttendance = async (req, res) => {
  try {
    const { marked, present } = req.body;
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    teacher.attendance = { marked, present, lastCheck: new Date() };
    await teacher.save();

    res.json(teacher);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getTeachers,
  getTeacherById,
  getTeacherAvailability,
  updateAttendance,
};
