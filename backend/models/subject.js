const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');


const Subject = sequelize.define('Subject', {
  subject_name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});



module.exports = Subject;