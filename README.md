# 🎓 Classverse

**Classverse** is a school management web application that supports students, teachers, and admins. It handles course enrollments, grading, user roles, and provides permission-based data access and exporting.

---

## ✨ Features

### 👨‍🎓 Students (Role ID: 3)
- View personal grades and enrolled courses
- Export grades as PDF tables
- Edit their profile (except username)
- Upload a profile picture (max 50KB)

### 👩‍🏫 Teachers (Role ID: 2)
- All student profile functionalities
- Manage grades for students in their courses (add/edit/delete)
- Export course grades as PDFs
- View student info and enrolled classes

### 🛠️ Admins (Role ID: 1)
- View/delete students and teachers  
  *(must clear teacher’s courses before deletion)*
- View all grades (read-only, no export)
- Approve or delete pending users (teachers/admins)
- Create subjects (names only)
- Manage courses (create/edit/delete)  
  *Deleting a course removes all its grades. Deleting a student removes their grades.*
- No profile page for admins

### 🔐 User Registration
- Role is chosen during registration
- **Students** get instant access  
- **Teachers/Admins** must be approved by an admin

---

## 🛠️ Technologies Used

- **Frontend**: HTML, CSS, JavaScript (multi-page)
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL (via Sequelize ORM)
- **Authentication**: JWT (JSON Web Tokens)
- **PDF Export**: [jsPDF](https://github.com/parallax/jsPDF)
- **Profile Pictures**: Base64 strings stored on server

---

## 🗄️ Database Schema

### 🧾 Tables

- `Users`: `first_name`, `last_name`, `username`, `email`, `birthday`, `role_id`, `img_src`
- `Roles`: `role_name`
- `Subjects`: `subject_name`
- `Courses`: `course_name`, `subject_id`, `teacher_id`
- `Grades`: `grade`, `user_id`, `course_id` *(unique combination)*
- `Course_Students`: `course_id`, `student_id`

### 🔗 Relationships

- Each user has one role
- Students can have one grade per course
- Teachers manage their own courses
- Subjects contain multiple courses

---

## 🔐 Authentication & Authorization

- Open registration with admin approval for teachers/admins
- JWT used for session management and validation
- Role-based routing ensures users land on the right dashboard
- **⚠️ Passwords are not hashed yet (planned update)**

---

## 📂 File Uploads

- Users can upload profile pictures
- Images must be under 50KB
- Stored as Base64 strings on the server

---

## 🚀 Setup Instructions

1. Install PostgreSQL and create a new database
2. Clone this repository
3. Run `seed.js` to initialize roles and create the first admin
4. **Change the admin's password manually in the database**
5. Start the Express.js server
6. Share the app link with students for registration
7. Admins approve teacher/admin accounts
8. Admins create subjects and courses and assign users

> 🔒 **Tip**: Restrict registration by IP (e.g., school network only) for security

---

## 🚧 Known Limitations & Future Plans

- Password hashing and improved security
- Admins acting as teachers (dashboard toggle)
- Increase profile picture size limit
- Messaging system (course-wide and private)
- Optimized login loading
- Improved UI and structured CSS
- Cleaner backend-frontend data handling

---

📬 Contributions and suggestions are welcome!
