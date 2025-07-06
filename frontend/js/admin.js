document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }

    const authError = sessionStorage.getItem('authError');
    if (authError) {
        console.error(`[Redirect Reason] ${authError}`);
        sessionStorage.removeItem('authError');
    }

    try {
        const response = await fetch('/api/admin', {
            headers: {
                'authorization': `Bearer ${token}`
            }
        });

    const data = await response.json();
    if (data.role){     
        // this is to prevent any user to use his own token 
        // to access other dashboards like a student using his 
        // own token to go to the admin panel, if this happens the 
        // response will have a role, this indicates that he 
        // tried it, so he will be sent back to his dashboard immeditely
        if (data.role === 3) {
            const err = sessionStorage.setItem('authError', data.message || 'Unauthorized access to another dashboard.');
            window.location.href = '/student';
            return;
        }
        if (data.role === 4 || data.role === 5) {
            const err = sessionStorage.setItem('authError', data.message || 'Unauthorized access to another dashboard.');
            window.location.href = '/notapproved';
            return;
        }
        if (data.role === 2) {
            sessionStorage.setItem('authError', data.message || 'Unauthorized access to another dashboard.');
            window.location.href = '/teacher';
            return;
        }
        if (data.role === 1) {
            sessionStorage.setItem('authError', data.message || 'Unauthorized access to another dashboard.');
            window.location.href = '/admin';
            return;
        }

    }
    

        populateAdminDashboard(data);
    } catch (err) {
        console.error('Admin auth failed:', err);
        // window.location.href = '/';
    }

    setupEventListeners();
});

function populateAdminDashboard(data) {

    populateStudentsTable(data.students || []);
    populateTeachersTable(data.teachers, data.coursesdata);
    populateGradesTable(data.grades || []);
    populateCoursesTable(data.coursesdata);
    populateSubjects(data.subjects);
    populateToBeApprovedUsers(data.tobeapproved);

    window.adminStudents = data.students;
    window.adminGrades = data.grades;
    window.adminCourses = data.coursesdata;
    window.admintobeapproved = data.tobeapproved;
    window.adminsubjects = data.subjects;
    window.adminTeachers = data.teachers;
}

function populateStudentsTable(students) {
    const tbody = document.getElementById('studentsTableBody');
    tbody.innerHTML = '';
    if (!students.length) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">No students found</td></tr>';
        return;
    }
        const rows = students.map(s => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${s.firstname} ${s.lastname}</td>
                <td>${s.email}</td>
                <td>${s.birthday || 'N/A'}</td>
                <td><button class="btn btn-sm btn-danger delete-btn" onclick="deleteUser(${s.id})" style="margin-left: 0.5rem;">Delete</button></td>
            `;
            return row;
        });

        rows.forEach(row => tbody.appendChild(row));

}

function populateTeachersTable(teachers, courses) {
    const tbody = document.getElementById('teachersTableBody');
    tbody.innerHTML = '';

    if (!teachers.length) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center">No teachers found</td></tr>';
        return;
    }

    teachers.forEach(t => {
        // Find courses taught by this teacher
        const teacherCourses = courses
            .filter(c => c.teacher_id === t.id)
            .map(c => c.course_name)
            .join(', ') || 'N/A';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${t.firstname} ${t.lastname}</td>
            <td>${t.email}</td>
            <td>${teacherCourses}</td>
            <td><button class="btn btn-sm btn-danger delete-btn" onclick="deleteUser(${t.id})" style="margin-left: 0.5rem;">Delete</button></td>
        `;
        tbody.appendChild(row);
    });
}






function populateGradesTable(grades) {
    const tbody = document.getElementById('adminGradesTableBody');
    tbody.innerHTML = '';
    if (!grades.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">No grades available</td></tr>';
        return;
    }
    grades.forEach(g => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${g.firstname}, ${g.lastname}</td>
            <td>${g.grade}</td>
            <td>${g.course}</td>
            <td>${g.date.split('T')[0]}</td>
        `;
        tbody.appendChild(row);
    });
}

function populateCoursesTable(courses) {
    const tbody = document.getElementById('adminCoursesTable');
    tbody.innerHTML = '';
    if (!courses.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">No courses available</td></tr>';
        return;
    }
    courses.forEach(c => {
        const courseData = {
                    id: c.id,
                    name: c.course_name,
                    subject_id: c.subject_id,
                    teacher_id: c.teacher_id,
                    student_ids: c.student_ids
                };
        const row = document.createElement('tr');
        const safeJson = JSON.stringify(courseData).replace(/"/g, '&quot;');

        row.innerHTML = `
        <td>${c.course_name}</td>
        <td>${c.subject}</td>
        <td>${c.teacher_firstname} ${c.teacher_lastname}</td>
        <td>${c.studentcount}</td>
        <td style="text-align: right;">
            <button 
            class="btn btn-sm btn-primary edit-btn edit-course"
            data-course="${safeJson}"
            >Edit</button>
            <button 
            class="btn btn-sm btn-danger delete-btn"
            onclick="deleteCourse(${c.id})" 
            style="margin-left: 0.5rem;"
            >Delete</button>
        </td>
        `;

        tbody.appendChild(row);
    });
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('edit-course')) {
    const json = e.target.getAttribute('data-course');
    const data = JSON.parse(json);
    openCourseModal(data);
  }
});


function populateSubjects(subjects) {
    const container = document.getElementById('subjectscontainer');
    container.innerHTML = ""; 

    subjects.forEach(subject => {
        const div = document.createElement('div');
        div.className = 'stat-card';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';

        const span = document.createElement('span');
        span.innerText = subject.subject_name;

        const delBtn = document.createElement('button');
        delBtn.className = 'btn btn-danger';
        delBtn.innerText = 'Delete';
        delBtn.style.padding = '6px 12px';
        delBtn.onclick = () => deleteSubject(subject.id,div ,subject.subject_name);

        div.appendChild(span);
        div.appendChild(delBtn);
        container.appendChild(div);
    });
}


function deleteSubject(subjectId, subjectElement, subjectName) {
    showConfirmation(`Delete subject "${subjectName}"? IMPORTANT: this will delete all associated data to it.  {Courses => Students Grades in these Courses}`, async () => {
        try {
            const res = await fetch(`/deletesubject`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({subject_id: subjectId})
            });

            const result = await res.json();

            if (result.success) {
                subjectElement.remove();
                refreshadmindash() // refresh for subjects, courses, grades, wich are associated to this deletion             
            } else {
                alert(result.message);
            }
        } catch (err) {
            console.error(err);
            alert("Error while deleting subject.");
        }
    });
}



function setupEventListeners() {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const action = item.getAttribute('onclick');
            if (action && action.includes('showAdminSection')) {
                const section = action.match(/'(.+?)'/)[1];
                showAdminSection(section);
            }
        });
    });
}


function showAdminSection(sectionName) {
    const sectionIds = [
        'adminStudentsSection',
        'adminTeachersSection',
        'adminGradesSection',
        'adminGroupsSection',
        'adminSubjectSection',
        "adminApproveUserSection",
    ];

    sectionIds.forEach(id => {
        document.getElementById(id).style.display = id === `admin${capitalize(sectionName)}Section` ? 'block' : 'none';
    });

    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    document.querySelector(`.menu-item[onclick*="${sectionName}"]`).classList.add('active');
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/';
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}


function openAddSubjectModal() {
  document.getElementById('subjectModal').style.display = 'flex';
  document.getElementById('subjectNameInput').value = '';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

async function submitSubject() {
  const subject_name = document.getElementById('subjectNameInput').value.trim();
  const messageBox = document.getElementById('subjectMessage');
  messageBox.textContent = ''; // Clear previous message

  if (!subject_name) {
    messageBox.style.color = 'red';
    messageBox.textContent = 'Please enter a subject name.';
    return;
  }

  try {
    const response = await fetch('/createsubject', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ subject_name })
    });

    const result = await response.json();

    if (result.success) {
      messageBox.style.color = 'green';
      messageBox.textContent = 'Subject created successfully!';
      localStorage.setItem('adminSection', 'subject');
      setTimeout(() => {
        closeModal('subjectModal');
        location.reload();
      }, 800);
    } else {
      messageBox.style.color = 'red';
      messageBox.textContent = result.message || 'Failed to create subject.';
    }
  } catch (err) {
    console.error('Error creating subject:', err);
    messageBox.style.color = 'red';
    messageBox.textContent = 'Server error.';
  }
}


window.addEventListener('DOMContentLoaded', () => {
  const lastSection = localStorage.getItem('adminSection');
  if (lastSection) {
    showAdminSection(lastSection);
    localStorage.removeItem('adminSection'); // clear after use
  }
});

function populateToBeApprovedUsers(users) {
    const tbody = document.getElementById('toBeApprovedtable');
    tbody.innerHTML = '';
    
    if (!users.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">No users to be approved</td></tr>';
        return;
    }

    users.forEach(u => {
        const row = document.createElement('tr');
        const role = u.role_id === 4 ? 'Admin' : 'Teacher';

        row.innerHTML = `
            <td>${u.firstname} ${u.lastname}</td>
            <td>${u.user_id}</td>
            <td>${u.email}</td>
            <td>${role}</td>
            <td style="text-align: right;">
                <button class="btn btn-sm btn-primary edit-btn" onclick="approveUser('${u.username}', ${u.role_id})">Approve</button>
                <button class="btn btn-sm btn-danger delete-btn" onclick="deleteUser(${u.user_id})" style="margin-left: 0.5rem;">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}



function deleteUser(id) {
    showConfirmation("Are you sure you want to delete this User?", async () => {
        try {
            const res = await fetch('/deleteuser', { 
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });

            // Optional: check for response status
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Unknown error');
            }
            
            loadUsers();

        } catch (err) {
            console.error('Error deleting User:', err);
        }
    });
}


async function loadUsers() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin', {
            headers: { 'authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.grades) {
            populateToBeApprovedUsers(data.tobeapproved);
            populateStudentsTable(data.students);
            populateTeachersTable(data.teachers, data.coursesdata);
            populateCoursesTable(data.coursesdata);
        }
    } catch (err) {
        console.error('Failed to reload tobeapproved users:', err);
    }
}

function showConfirmation(message, onConfirm) {
    const popup = document.getElementById('confirmationPopup');
    const messageElem = document.getElementById('confirmationMessage');
    const yesBtn = document.getElementById('confirmYes');
    const noBtn = document.getElementById('confirmNo');

    messageElem.textContent = message;
    popup.style.display = 'flex';

    const cleanup = () => {
        popup.style.display = 'none';
        yesBtn.onclick = null;
        noBtn.onclick = null;
    };

    yesBtn.onclick = () => {
        cleanup();
        onConfirm();
    };
    noBtn.onclick = cleanup;
}

async function approveUser(username, role) {
    if (role === 4) {
        role_id = 1;
        roleName = 'Admin';
    }else{
        role_id = 2;
        roleName = 'Teacher';
        }
    showConfirmation(`Are you sure you want to approve this User as ${roleName}?`, async () => {
    try {
        const res = await fetch("/updateuser", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, role_id })
    })

        // Optional: check for response status
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Unknown error');
        }
        
        loadUsers();

    } catch (err) {
        console.error('Error approving User:', err);
    }
});
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
    document.body.classList.remove("modal-open");
    selectedStudents = new Set();
}


function cancleAddCourse() {
    closeModal('addCourseModal');
    selectedStudents = new Set();
}



async function createCourse(){
    const course_name = document.getElementById('courseName').value;
    const subject_id = parseInt(document.getElementById('coursesubject').value);
    const teacher_id = parseInt(document.getElementById('courseteacher').value);
    const student_ids = Array.from(selectedStudents);
    const messageBox = document.getElementById('courseMessage');

    await fetch('/createcourse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:JSON.stringify({ course_name, subject_id, teacher_id, student_ids })
    })
    .then(res => res.json())
    .then(data => {
      messageBox.classList.remove('error');
      messageBox.classList.add('success');
      messageBox.textContent = data.message || 'Course created.';
      messageBox.style.display = 'block';
      loadUsers()
      setTimeout(() =>{
        closeModal('addCourseModal');
        messageBox.style.display = 'none'
        selectedStudents = new Set();
        }, 2000);
        
    })
    .catch(err => {
      console.error('Error:', err);
      messageBox.classList.remove('success');
      messageBox.classList.add('error');
      messageBox.textContent = 'Failed to create course.';
      messageBox.style.display = 'block';
      setTimeout(() => messageBox.style.display = 'none', 4000);
    });
}

async function updateCourse(){
    const course_id = document.getElementById("editCourseId").value;
    const teacher_id = parseInt(document.getElementById('courseteacher').value);
    const student_ids = Array.from(selectedStudents);
    const messageBox = document.getElementById('courseMessage');

    await fetch('/upatecourse', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:JSON.stringify({course_id, teacher_id, student_ids })
    })
    .then(res => res.json())
    .then(data => {
      messageBox.classList.remove('error');
      messageBox.classList.add('success');
      messageBox.textContent = data.message || 'Course Updated.';
      messageBox.style.display = 'block';
      loadUsers()
      setTimeout(() =>{
        closeModal('addCourseModal');
        messageBox.style.display = 'none'
        selectedStudents = new Set();
        }, 2000);
        
    })
    .catch(err => {
      console.error('Error:', err);
      messageBox.classList.remove('success');
      messageBox.classList.add('error');
      messageBox.textContent = 'Failed to create course.';
      messageBox.style.display = 'block';
      setTimeout(() => messageBox.style.display = 'none', 4000);
    });
}


async function deleteCourse(id) {
    showConfirmation("Are you sure you want to delete this Course?", async () => {
        try {
            const res = await fetch('/deletecourse', { 
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });

            // Optional: check for response status
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Unknown error');
            }
            
            loadUsers();

        } catch (err) {
            console.error('Error deleting Course:', err);
        }
    });
}

let selectedStudents = new Set();

function openCourseModal(course = null) {
    const modal = document.getElementById("addCourseModal");
    modal.style.display = "flex";
    document.body.classList.add("modal-open");

    const nameInput = document.getElementById("courseName");
    const subjectSelect = document.getElementById("coursesubject");
    const teacherSelect = document.getElementById("courseteacher");
    const studentSearchInput = document.getElementById("studentSearchInput");

    const summaryName = document.getElementById("summaryName");
    const summarySubject = document.getElementById("summarySubject");
    const summaryTeacher = document.getElementById("summaryTeacher");
    const studentTableBody = document.getElementById("courseStudentSelectPreview");

    const createBtn = document.getElementById("createCourseBtn");
    const updateBtn = document.getElementById("updateCourseBtn");

    selectedStudents.clear();

    nameInput.disabled = !!course;
    subjectSelect.disabled = !!course;

    if (course) {
        document.getElementById("editCourseId").value = course.id;
        createBtn.style.display = "none";
        updateBtn.style.display = "inline-block";

        nameInput.value = course.name || '';
        subjectSelect.value = course.subject_id || '';
        teacherSelect.value = course.teacher_id || '';
        studentSearchInput.value = '';
        summaryName.textContent = course.name || '-';


        const subjectObj = window.adminsubjects?.find(s => s.id === course.subject_id);
        summarySubject.textContent = subjectObj?.subject_name || '-';

        const teacherObj = window.adminTeachers?.find(t => t.id === course.teacher_id);
        summaryTeacher.textContent = teacherObj ? `${teacherObj.firstname} ${teacherObj.lastname}` : '-';

        if (Array.isArray(course.student_ids)) {
            course.student_ids.forEach(id => selectedStudents.add(id));
        }
    } else {
        createBtn.style.display = "inline-block";
        updateBtn.style.display = "none";
        nameInput.value = '';
        subjectSelect.value = '';
        teacherSelect.value = '';
        studentSearchInput.value = '';
        summaryName.textContent = '-';
        summarySubject.textContent = '-';
        summaryTeacher.textContent = '-';
    }

    studentTableBody.innerHTML = '';

    subjectSelect.innerHTML = '<option value="">Select a subject</option>';
    if (window.adminsubjects?.length) {
        window.adminsubjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.id;
            option.textContent = subject.subject_name;
            subjectSelect.appendChild(option);
        });
    }

    subjectSelect.addEventListener('change', function () {
        const selectedId = this.value;
        const selectedSubject = window.adminsubjects.find(sub => sub.id == selectedId);
        summarySubject.textContent = selectedSubject?.subject_name || '-';
    });


    teacherSelect.innerHTML = '<option value="">Select a teacher</option>';
    window.adminTeachers?.forEach(teacher => {
        const option = document.createElement('option');
        option.value = teacher.id;
        option.textContent = `${teacher.firstname}, ${teacher.lastname}`;
        teacherSelect.appendChild(option);
    });

    if (course) {
        document.getElementById("courseteacher").value = course.teacher_id;
        document.getElementById("coursesubject").value = course.subject_id;
    }

    teacherSelect.addEventListener('change', function () {
        const selectedId = this.value;
        const selectedTeacher = window.adminTeachers.find(t => t.id == selectedId);
        summaryTeacher.textContent = selectedTeacher ? `${selectedTeacher.lastname} ${selectedTeacher.firstname}` : '-';
    });


   

    document.getElementById("studentSearchInput").addEventListener("input", (e) => {
        renderStudentTable(e.target.value);
    });

    renderStudentTable();
    updateStudentSummary();
}

function updateStudentSummary() {
    const tbody = document.getElementById("courseStudentSelectPreview");
    tbody.innerHTML = "";

    window.adminStudents?.forEach(student => {
        if (selectedStudents.has(student.id)) {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${student.firstname}</td><td>${student.lastname}</td>`;
            tbody.appendChild(row);
        }
    });
}

function renderStudentTable(searchTerm = "") {
    const tbody = document.getElementById("filteredStudentTableBody");
    tbody.innerHTML = "";

    const filtered = window.adminStudents.filter(student => {
        const fullName = `${student.firstname} ${student.lastname}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
    });

    filtered.forEach(student => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${student.firstname}</td>
            <td>${student.lastname}</td>
            <td>
                <input type="checkbox" data-id="${student.id}" ${selectedStudents.has(student.id) ? "checked" : ""}>
            </td>
        `;
        tr.querySelector("input").addEventListener("change", (e) => {
            const id = student.id;
            e.target.checked ? selectedStudents.add(id) : selectedStudents.delete(id);
            updateStudentSummary();
        });

        tbody.appendChild(tr);
    });
}


function renderStudentTable2(searchTerm = '') {
    const tbody = document.getElementById("studentsTableBody");
    tbody.innerHTML = "";

    const filtered = window.adminStudents.filter(student => {
        const fullName = `${student.firstname} ${student.lastname}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
    });

    filtered.forEach(s => {
        const tr = document.createElement("tr");

       tr.innerHTML = `
            <td>${s.firstname} ${s.lastname}</td>
            <td>${s.email}</td>
            <td>${s.course_name || 'N/A'}</td>
        `;

        tbody.appendChild(tr);
    });
}

document.getElementById("searchTerm").addEventListener("input", (e) => {
    renderStudentTable2(e.target.value);
});



// silent refresh 
async function refreshadmindash(){
    const token = localStorage.getItem('token');
    const response = await fetch('/api/admin', {
        headers: {
            'authorization': `Bearer ${token}`
        }
    });
    const data = await response.json();
    populateGradesTable(data.grades || []);
    populateCoursesTable(data.coursesdata);
    populateSubjects(data.subjects);
}