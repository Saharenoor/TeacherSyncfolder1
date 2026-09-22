const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Teacher = sequelize.define('Teacher', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subjects: {
    type: DataTypes.JSON, // Array of subjects
    allowNull: false,
  },
  cabin: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isVisiting: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isSubjectTeacher: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  schedule: {
    type: DataTypes.JSON, // Object with days as keys, array of slots as values
    allowNull: false,
  },
  attendance: {
    type: DataTypes.JSON, // { marked: boolean, present: boolean, lastCheck: date }
    allowNull: false,
  },
});

module.exports = Teacher;
