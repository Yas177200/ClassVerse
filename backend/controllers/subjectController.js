const Course = require('../models/course');
const Grade = require('../models/grade');
const Subject = require('../models/subject');

exports.createSubject = async (req, res) => {
    try{
        const {subject_name} = req.body;
        await Subject.create({subject_name});
        res.json({
            success:true,
            message: `subject ${subject_name} created successfully ☑️`
        })      
    }catch (error){
        res.json({
            success:false,
            message: `subject creation unsuccessfull: ${error}`
        })   
    }

};

exports.deleteSubject = async (req, res) => {
    try {
        const { subject_id } = req.body;

        const courses = await Course.findAll({ where: { subject_id } });

        const courseIds = courses.map(course => course.id);

        await Grade.destroy({ where: { course_id: courseIds } });

        await Course.destroy({ where: { subject_id } });

        await Subject.destroy({ where: { id: subject_id } });

        res.json({
            success: true,
            message: `Subject and all associated data deleted successfully ☑️`
        });
    } catch (error) {
        console.error(error);
        res.json({
            success: false,
            message: `Subject deletion unsuccessful: ${error.message}`
        });
    }
};
