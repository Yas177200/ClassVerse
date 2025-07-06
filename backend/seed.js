const Role = require('./models/role');
const User = require('./models/user');
const Subject = require('./models/subject');
const Course = require('./models/course');
const Grade = require('./models/grade');

exports.seedDatabase = async () => {
  try {
    // Step 1: Insert Roles
    const roles = await Role.bulkCreate([
      { role_name: 'Admin' },
      { role_name: 'Teacher' },
      { role_name: 'Student' },
       { role_name: 'notApprovedAdmin'},
       { role_name: 'notApprovedTeacher'}
    ], { ignoreDuplicates: true });

    console.log('✅ Roles inserted');

    // Step 2: Insert Users
    const teachers = await User.bulkCreate([
      {
        firstname: 'Emma',
        lastname: 'Johnson',
        birthday: '1980-03-14',
        username: 'emma',
        email: 'emma@school.com',
        password: '123',
        role_id: 2
      },
      {
        firstname: 'Liam',
        lastname: 'Smith',
        birthday: '1982-07-22',
        username: 'liam',
        email: 'liam@school.com',
        password: '123',
        role_id: 2
      },
      {
        firstname: 'Olivia',
        lastname: 'Williams',
        birthday: '1979-11-02',
        username: 'olivia',
        email: 'olivia@school.com',
        password: '123',
        role_id: 2
      },
      {
        firstname: 'Noah',
        lastname: 'Brown',
        birthday: '1983-05-30',
        username: 'noah',
        email: 'noah@school.com',
        password: '123',
        role_id: 2
      },
      {
        firstname: 'Admin',
        lastname: 'User',
        birthday: '1970-01-01',
        username: 'admin',
        email: 'admin@school.com',
        password: 'admin123',
        role_id: 1
      }
    ]);

    const studentData = Array.from({ length: 20 }, (_, i) => ({
      firstname: `Student${i + 1}`,
      lastname: `Lastname${i + 1}`,
      birthday: '2006-01-01',
      username: `student${i + 1}`,
      email: `student${i + 1}@school.com`,
      password: '123',
      role_id: 3
    }));

    const students = await User.bulkCreate(studentData);

    console.log('✅ Teachers, admin, and students inserted');

    // Step 3: Insert Subjects
    const subjects = await Subject.bulkCreate([
      { subject_name: 'Mathematics' },
      { subject_name: 'Physics' },
      { subject_name: 'Chemistry' },
      { subject_name: 'Biology' },
      { subject_name: 'History' } // extra subject for the double assignment
    ]);

    console.log('✅ Subjects inserted');

    // Step 4: Insert Courses
    const courses = await Course.bulkCreate([
      {
        course_name: 'Math A',
        subject_id: subjects[0].id,
        teacher_id: teachers[0].id
      },
      {
        course_name: 'Phy B',
        subject_id: subjects[1].id,
        teacher_id: teachers[1].id
      },
      {
        course_name: 'Chem C',
        subject_id: subjects[2].id,
        teacher_id: teachers[2].id
      },
      {
        course_name: 'Bio D',
        subject_id: subjects[3].id,
        teacher_id: teachers[3].id
      },
      {
        course_name: 'His E',
        subject_id: subjects[4].id,
        teacher_id: teachers[0].id // Emma teaches History again
      }
    ]);

    for (const course of courses) {
      await course.addStudents(students);
    }

    console.log('✅ Courses and student enrollments inserted');

    // Step 5: Insert Grades
    const gradeData = [];
    students.forEach(student => {
      courses.forEach(course => {
        gradeData.push({
          grade: ['A', 'B+', 'F', 'D-', 'C','E+'][Math.floor(Math.random() * 5)],
          student_id: student.id,
          course_id: course.id
        });
      });
    });

    await Grade.bulkCreate(gradeData);
    console.log('✅ Grades inserted');






    const toBeApprovedUsersData = Array.from({ length: 20 }, (_, i) => ({
  firstname: `Pending${i + 1}`,
  lastname: i % 2 === 0 ? 'Admin' : 'Teacher',
  birthday: `199${i % 10}-0${(i % 9) + 1}-15`,
  username: `pendinguser${i + 1}`,
  email: `pendinguser${i + 1}@school.com`,
  password: '123',
  role_id: i % 2 === 0 ? 4 : 5  // even index: notApprovedAdmin (4), odd index: notApprovedTeacher (5)
}));

const toBeApprovedUsers = await User.bulkCreate(toBeApprovedUsersData);







  } catch (error) {
    console.error('❌ Error during seeding:', error);
  }
};
