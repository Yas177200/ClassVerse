Classverse
Classverse is a school management web application designed
to handle data for students, teachers, and admins. It manages
grades, courses, and user roles, allowing users to view, edit,
and export information based on their permissions.


Features
• Students (Role ID: 3)
◦ View personal grades and courses
◦ Export grades as PDF tables
◦ Edit their profile (except username) and upload a profile picture 
    (max   50KB)
• Teachers (Role ID: 2)
◦ Same profile functionalities as students
◦ Manage grades for students in their courses (add/edit/delete)
◦ Export grades for selected courses as PDFs
◦ View information about their students and their enrolled classes

• Admins (Role ID: 1)
◦ View and delete students and teachers (must clear teacher’s courses before deleting)
◦ View grades (read-only) without export capabilities
◦ Approve or delete pending users (new teachers/admins waiting for approval)
◦ Create subjects (names only)
◦ Manage courses (create/edit/delete). Deleting a course deletes all associated grades;
    deleting a student deletes their grades as well.
◦ No profile page available for admins


• User Registration
◦ Users freely choose their role during registration
◦ If the role selected is teacher or admin, the account requires admin approval before access
◦ Students can access immediately after registration

    Technologies Used
• Frontend: Pure HTML, CSS, and JavaScript (multi-page)
• Backend: Express.js with Sequelize ORM
• Database: PostgreSQL
• Authentication: JWT (JSON Web Tokens) for managing user sessions and token validation
• Additional Libraries: JsPDF for PDF exports
• Profile Pictures: Stored as Base64 encoded text on the server


    Database Structure
• Users: first name, last name, username, email, birthday, role_id, img_src
• Roles: role name
• Subjects: subject_name
• Courses: course_name, subject_id, teacher_id
• Grades: grade, user_id, course_id (unique combination)
• Course_Students: course_id, student_id (linking students to courses)

    Relationships:
• Each user has one role
• Students have one grade per course
• Teachers are associated with courses they manage
• Subjects have many courses, but each course has only one subject

    Authentication and Authorization
• Registration is open to all roles, with admin approval required for teacher and admin accounts
• Passwords are currently not hashed (planned improvement)
• JWT is used to validate and manage user sessions
• Role-based access control redirects users to their appropriate dashboards after login

File Uploads
• Profile pictures must be under 50KB
• Stored as Base64 encoded strings on the server

Setup Instructions
1. Install and run a PostgreSQL database.
2. Clone the Classverse project files.
3. Run the seed.js script once to create initial roles and the first admin user.
4. Manually change the first admin’s password directly in the database for security.
5. Start the Express.js server.
6. Share the app address with students; new students register upon school entry.
7. Admins approve newly registered teachers and admins.
8. Admins create subjects and courses, assigning teachers and students accordingly.

    Note: It is recommended to restrict registration access by IP (e.g., school network only) to prevent
unauthorized sign-ups.



Known Limitations & Future Improvements
• Password hashing and enhanced security measures
• Ability for admins to also function as teachers with dashboard toggling
• Increase profile picture size limit
• Implement messaging system (course-wide and private messages)
• Optimize data loading on login for better performance
• Improved and structured CSS with UI redesign
• Better structured data handling between backend and frontend