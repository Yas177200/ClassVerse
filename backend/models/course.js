// models/course.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Subject = require('./subject');
const Grade = require('./grade');

const Course = sequelize.define('Course', {
  course_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  teacher_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  subject_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Subject,
      key: 'id'
    }
  }
});


// One teacher teaches many courses
User.hasMany(Course, { foreignKey: 'teacher_id', as: 'teachingCourses' });
Course.belongsTo(User, { foreignKey: 'teacher_id', as: 'teacher' });

// One subject is used in many courses
Subject.hasMany(Course, { foreignKey: 'subject_id' });
Course.belongsTo(Subject, { foreignKey: 'subject_id' });

// Many students belong to many courses
Course.belongsToMany(User, {
  through: 'Course_Students',
  foreignKey: 'course_id',
  otherKey: 'user_id',
  as: 'students'
});

User.belongsToMany(Course, {
  through: 'Course_Students',
  foreignKey: 'user_id',
  otherKey: 'course_id',
  as: 'enrolledCourses'
});


module.exports = Course;