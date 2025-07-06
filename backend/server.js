const express = require('express');
const path = require('path');
const sequelize= require('./config/database');
const jwt = require('jsonwebtoken');
const userRoutes = require('./routes/userRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const courseRoutes = require('./routes/courseRoutes');
const {checkToken} = require('./middleware/checktoken')
const app = express();
const SECRET_KEY = 'mysecretkey';

app.use(express.json());
app.use(userRoutes);
app.use(subjectRoutes);
app.use(gradeRoutes);
app.use(courseRoutes);

app.use(express.static(path.join(__dirname,'../frontend')));

const User = require('./models/user');
const Grade = require('./models/grade');
const Subject = require('./models/subject');
const Course = require('./models/course');
const Role = require('./models/role');





app.post('/api/login', async (req,res)=>{
    try{
        const {username,password}=req.body;
        const user = await User.findOne({where: { username: username} });
        if (user){
            if(user.password === password){
            const token =jwt.sign({username},SECRET_KEY,{expiresIn:'1h'});
            res.json({
                success:true,
                message:'login successfully ☑️',
                token,
                expiresIn:'1 minute',
                user_role: user.role_id
            })
            }else{
                res.status(401).json({
                    success:false,
                    message:'Invalid user name or password ❌❌'
                });
        }
        }
    }catch (error){
        res.status(401).json({
                success:false,
                message:`error: ${error}`
            });
    }
    

});



app.get('/api/student', checkToken, async (req, res) => {
    const student = await User.findOne({
    where: { username: req.user.username },
    include: {
        model: Course,
        as: 'enrolledCourses',
        through: { attributes: [] }
    }
    });
    if (student.role_id !== 3) {
        res.json({
            success: false,
            message: 'unautorized',
            role: student.role_id
        });
        return;
    }
    const studentgrades = await Grade.findAll(
        {where: 
            {
                student_id: student.id
            }
        }
    );
    const grades = [];

    for (const grade of studentgrades) {
        const course = await Course.findByPk(grade.dataValues.course_id);
        const subject = await Subject.findByPk(course.subject_id);
        const teacher = await User.findByPk(course.teacher_id);
        grades.push({
            grade: grade.dataValues.grade,
            subject: subject.subject_name,
            course: course.course_name || 'Unknown',
            teacher: teacher.lastname,
            date: grade.dataValues.updatedAt
        });
    }
    res.json({ 
        success: true,
        userdata: student,
        usergrades: grades,
        courses: student.enrolledCourses
    });
});


app.get('/api/admin', checkToken, async (req, res) => {
    try {
        const admin = await User.findOne({ where: { username: req.user.username } });
        if (admin.role_id !== 1) {
        res.json({
            success: false,
            message: 'unautorized',
            role: admin.role_id
        });
        return;
        }
        const teachers = await User.findAll({ where: { role_id: 2 } });
        const students = await User.findAll({ where: { role_id: 3 } });
        const tobeapprovedadmin = await User.findAll({where: {role_id: 4}});
        const tobeapprovedteacher = await User.findAll({where: {role_id: 5}});
        const subjectsdata = await Subject.findAll();


        const subjects = subjectsdata.map(subject => ({
            subject_name: subject.subject_name,
            id: subject.id
        }));
        console.log(subjects);

        const courses = await Course.findAll({
        include: {
            model: User,
            as: 'students',
            through: { attributes: [] }
        }
        });

        const coursesdata = []
        for (const course of courses ) {
            const teacher = await User.findByPk(course.teacher_id);
            const subject = await Subject.findByPk(course.subject_id);
            const studentcount = course.students.length;
            const student_ids = course.students.map(student => student.id);

            coursesdata.push({
                teacher_lastname: teacher.lastname,
                teacher_firstname: teacher.firstname,
                course_name: course.course_name,
                studentcount: studentcount,
                teacher_id: teacher.id,
                subject: subject.subject_name,
                id: course.id,
                subject_id: subject.id,
                student_ids: student_ids
            });
        }

        const grades = [];
        for (const course of courses) {
            const subject = await Subject.findByPk(course.subject_id);

            for (const student of course.students) {
                const studentGrades = await Grade.findAll({
                where: {
                    student_id: student.id,
                    course_id: course.id
                }
                });

                studentGrades.forEach(g => {
                grades.push({
                    firstname: student.firstname,
                    lastname: student.lastname,
                    id: student.id,
                    subject: subject.subject_name,
                    grade: g.grade,
                    course: course.course_name,
                    date: g.updatedAt
                });
                });
            }
        }

        const tobeapproved = [];

        tobeapprovedadmin.forEach(a => {
            tobeapproved.push({
                firstname: a.firstname,
                lastname: a.lastname,
                user_id: a.id,
                role_id: a.role_id,
                email: a.email,
                username: a.username

            })
        })

        tobeapprovedteacher.forEach(a => {
            tobeapproved.push({
                firstname: a.firstname,
                lastname: a.lastname,
                user_id: a.id,
                role_id: a.role_id,
                email: a.email,
                username: a.username
            })
        })

        res.json({
            success: true,
            students,
            teachers,
            grades,
            coursesdata,
            subjects,
            tobeapproved
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/api/teacher', checkToken, async (req, res) =>{
    try{
        const teacher = await User.findOne({ where: { username: req.user.username } });
        if (teacher.role_id !== 2) {
            res.json({
                success: false,
                message: 'unauthorized',
                role: teacher.role_id
            });
            return;
        }
        
        const courses = await Course.findAll({
        where: { teacher_id: teacher.id },
        include: {
            model: User,
            as: 'students',
            through: { attributes: [] }
        }
        });
        
        const coursesdata = [];


        courses.forEach(course => {
        course.students.forEach(student => {
            coursesdata.push({
            course_name: course.course_name,
            course_id: course.id,
            firstname: student.firstname,
            lastname: student.lastname,
            email: student.email,
            id: student.id
            });
        });
        });

        const grades = [];

        for (const course of courses) {
            const subject = await Subject.findByPk(course.subject_id);
            
            for (const student of course.students) {
                const studentGrades = await Grade.findAll({
                where: {
                    student_id: student.id,
                    course_id: course.id
                }
                });

                studentGrades.forEach(g => {
                grades.push({
                    firstname: student.firstname,
                    lastname: student.lastname,
                    subject: subject.subject_name,
                    grade: g.grade,
                    gradeId: g.id,
                    course_id: course.id,
                    course: course.course_name,
                    date: g.updatedAt
                });
                });
            }
        }
        res.json({
            success: true,
            message: 'hi',
            teacherdata: teacher,
            students: coursesdata,
            grades: grades,
            courses
            });
    }catch (error){
        console.log(error);
    }
});


app.get('/api/notapproved', checkToken, async (req, res) =>{
    try{
        const user = await User.findOne({ where: { username: req.user.username }});
        if (user.role_id === 1 || user.role_id === 2 || user.role_id === 3) {
        res.json({
            success: false,
            message: 'unauthorized',
            role: user.role_id
        });
        return;
        }
        res.json({
            success: true,
            firstname: user.firstname,
            lastname: user.lastname,
            user_id: user.id,
            role_id: user.role_id
        });
    }catch (error){
        res.json({
            success: false, 
            message: `an error accoured please try again later: ${error}`
        });
    }
});



app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, '../frontend/pages', 'login_register.html'));
});


app.get('/student',(req,res)=>{
    res.sendFile(path.join(__dirname,'../frontend/pages','student_dashboard.html'));
});

app.get('/teacher',(req,res)=>{
    res.sendFile(path.join(__dirname,'../frontend/pages','teacher_dashboard.html'));
});

app.get('/admin', (req, res) =>{
    res.sendFile(path.join(__dirname, '../frontend/pages', 'admin_dashboard.html'))
});

app.get('/notapproved', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages', 'not_approved_dashboard.html'))
})


const {seedDatabase} = require('./seed');
sequelize.sync().then(()=>{
    // seedDatabase();
    console.log('database is synced');
})
app.listen(3000,()=>{
    console.log('server is running on http://localhost:3000')
});