const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Cabin = sequelize.define('Cabin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cabin: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  floor: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = Cabin;
