const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Course = require('./course');
const User = require('./user');

const Grade = sequelize.define('Grade', {
  grade: {
    type: DataTypes.STRING,
    allowNull: false
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Courses',
      key: 'id'
    }
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
   createdAt: {
    type: DataTypes.DATEONLY, // only the date part
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATEONLY, // only the date part
    allowNull: false,
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['course_id', 'student_id']
    }
  ]
});


// Associations

Grade.belongsTo(Course, { foreignKey: 'course_id' });
Grade.belongsTo(User, { foreignKey: 'student_id', as: 'student' });

Course.hasMany(Grade, { foreignKey: 'course_id' });
User.hasMany(Grade, { foreignKey: 'student_id', as: 'receivedGrades' });



module.exports = Grade;
 