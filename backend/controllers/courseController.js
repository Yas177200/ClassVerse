
const Course = require('../models/course');
const Grade = require('../models/grade');

exports.createCourse = async (req, res) => {
  const { course_name, subject_id, teacher_id, student_ids } = req.body;

  try {
    const course = await Course.create({ course_name, subject_id, teacher_id });

    if (Array.isArray(student_ids) && student_ids.length > 0) {
      await course.setStudents(student_ids);
    }

    res.status(201).json({ message: 'Course created successfully', course });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
};


exports.updateCourse = async (req, res) => {
  const { teacher_id, student_ids, course_id} = req.body;
  try {
    await Course.update(
      { teacher_id },
      {where: {id: course_id}}
    );


    const course = await Course.findByPk(course_id);
  
    if (Array.isArray(student_ids) && student_ids.length > 0) {
      await course.setStudents(student_ids);
    }

    res.status(201).json({ message: 'Course updated successfully!!', course });
  } catch (error) {
    console.log('Error updating course:', error);
    res.status(500).json({ message: `Failed to update course ${error}` });
  }
}

exports.deleteCourse = async (req, res) => {
  const {id} = req.body;
  try{
    await Grade.destroy({where: {course_id: id}});
    await Course.destroy({where: {id: id}});
    res.status(201).json({ message: 'Course deleted successfully!!'});
  }catch (error) {
    console.log('Error to delete course:', error);
    res.status(500).json({ message: `Failed to delete course ${error}` });
  }
}
