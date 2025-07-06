const Grade = require('../models/grade');
const User = require('../models/user');

exports.giveGrade = async (req, res) => {
        try{
        const {grade, course_id, student_id} = req.body;
        const student = await User.findByPk(student_id);
        if (student.role_id !== 3) {
            res.status(401).json({
            success:false,
            message: `${student.firstname} is not a student ☑️`
        })
        return;
        }
        await Grade.create({grade, course_id, student_id })
        res.json({
            success:true,
            message: `grade added successfully ☑️`
        })      
    }catch (error){
        res.json({
            success:false,
            message: `User already has a grade in this subject. Please edit the existing one or delete it first.`
        })   
    }
}

exports.deleteGrade = async (req, res) => {
    try{
        const {gradeId} = req.body;
        await Grade.destroy({
            where: {
                id: gradeId
            }
        })
        res.json({
            success:true,
            message: `grade deleted successfully ☑️`
        })      
    }catch{
        res.json({
            success:false,
            message: `grade deletion unsuccessfull`
        }) 
    }
}

exports.updateGrade = async (req, res) => {
    try{
        const {grade, gradeId} = req.body;
        await Grade.update(
            {
                grade: grade
            },
            {
            where: {
                id: gradeId
                }
            })
        res.json({
            success:true,
            message: `grade updated successfully ☑️`
        })      
    }catch{
        res.json({
            success:false,
            message: `grade update unsuccessfull`
        }) 
    }
}