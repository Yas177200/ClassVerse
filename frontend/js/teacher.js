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
        const response = await fetch('/api/teacher', {
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


    populateTeacherData(data.teacherdata)
    populateCourseSelect(data.grades);
    window.teacherStudents = data.students;
    window.teacherGrades = data.grades;
    window.teacherCourses = data.courses;
        

        
    } catch (err) {
        console.error(err);
        // window.location.href = '/';
    }
});


function populateTeacherData(teacher) {
    document.getElementById('teacherDisplayName').textContent = `Welcome, ${teacher.firstname}`;
    document.getElementById('firstname').value = teacher.firstname;
    document.getElementById('lastname').value = teacher.lastname;
    document.getElementById('username').value = teacher.username;
    document.getElementById('birthday').value = teacher.birthday;
    document.getElementById('email').value = teacher.email;
    const profileImg = document.getElementById('profileImg');
    profileImg.src = teacher.img_src || '/img/default-avatar.png';
}

function populateTeacherStudents(students) {
    const tbody = document.getElementById('teacherStudentsTableBody');
    tbody.innerHTML = '';
    if (!students.length) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">No students found</td></tr>';
        return;
    }
    students.forEach(s => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${s.firstname} ${s.lastname}</td>
            <td>${s.email}</td>
            <td>${s.course_name || 'N/A'}</td>
        `;
        tbody.appendChild(row);
    });
}

function populateTeacherGrades(grades) {
    const tbody = document.getElementById('teacherGradesTableBody');
    tbody.innerHTML = '';

    if (!grades.length) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">No grades available</td></tr>';
        return;
    }

    grades.forEach(g => {
        const row = document.createElement('tr');
        const gradeId = g.id || g.gradeId;

        row.setAttribute('data-grade-id', gradeId);
        row.innerHTML = `
            <td>${g.firstname} ${g.lastname}</td>
            <td>${g.subject}</td>
            <td class="grade-cell">${g.grade}</td>
            <td>${g.date.split('T')[0]}</td>
            <td class="grade-actions" style="text-align: center;">
                <button class="btn btn-warning" onclick="startEdit(this)">Edit</button>
                <button class="btn btn-danger" onclick="deleteGrade(${gradeId})">Delete</button>
                <button class="btn btn-success" style="display:none;" onclick="saveEdit(this, ${gradeId})">Save</button>
                <button class="btn btn-secondary" style="display:none;" onclick="cancelEdit(this)">Cancel</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}




function startEdit(button) {
    const row = button.closest('tr');
    const gradeCell = row.querySelector('.grade-cell');
    const currentGrade = gradeCell.textContent.trim();

    row.dataset.originalGrade = currentGrade;

    gradeCell.innerHTML = `<input id="newGrade" value="${currentGrade}" class="grade-input" />`;

    const actions = row.querySelector('.grade-actions');
    actions.querySelector('.btn-warning').style.display = 'none';
    actions.querySelector('.btn-danger').style.display = 'none';
    actions.querySelector('.btn-success').style.display = 'inline-block';
    actions.querySelector('.btn-secondary').style.display = 'inline-block';
}

function cancelEdit(button) {
    const row = button.closest('tr');
    const gradeCell = row.querySelector('.grade-cell');
    const originalGrade = row.dataset.originalGrade;

    gradeCell.textContent = originalGrade;

    const actions = row.querySelector('.grade-actions');
    actions.querySelector('.btn-warning').style.display = 'inline-block';
    actions.querySelector('.btn-danger').style.display = 'inline-block';
    actions.querySelector('.btn-success').style.display = 'none';
    actions.querySelector('.btn-secondary').style.display = 'none';
}


async function saveEdit(button, gradeId) {
        try {
            const grade = document.getElementById('newGrade').value;
            const res = await fetch('/updateGrade', { 
                method: 'PUT',
                headers:{
                'Content-Type':'application/json'
                },
                body: JSON.stringify({grade ,gradeId })
            });

            loadTeacherGradesOnly();

        } catch (err) {
            console.error('Error updating grade:', err);
        }

    cancelEdit(button);
}

function deleteGrade(gradeId) {
    showConfirmation("Are you sure you want to delete this grade?", async () => {
        try {
            const res = await fetch('/deletegrade', { 
                method: 'DELETE',
                headers:{
                'Content-Type':'application/json'
                },
                body: JSON.stringify({ gradeId })
            });

            loadTeacherGradesOnly();

        } catch (err) {
            console.error('Error deleting grade:', err);
        }
    });
}



function showTeacherSection(sectionName) {
    const sections = ['teacherProfileSection', 'teacherStudentsSection', 'teacherGradesSection'];
    sections.forEach(id => {
        document.getElementById(id).style.display = (id === `teacher${capitalize(sectionName)}Section`) ? 'block' : 'none';
    });

    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    document.querySelector(`.menu-item[onclick*="${sectionName}"]`).classList.add('active');

    if (sectionName === 'students') loadTeacherStudents();
    else if (sectionName === 'grades') loadTeacherGrades();
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}


function loadTeacherStudents() {
    populateTeacherStudents(window.teacherStudents);
    return;

}

function loadTeacherGrades() {

    populateTeacherGrades(window.teacherGrades);
    return;
}


function logout() {
    localStorage.removeItem('token');
    window.location.href = '/';
}


// refreshes here: 
async function loadTeacherGradesOnly() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/teacher', {
            headers: { 'authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.grades) {
            window.teacherGrades = data.grades;
            populateTeacherGrades(data.grades);
            showTeacherSection('grades');
        }
    } catch (err) {
        console.error('Failed to reload grades:', err);
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


function openTeacherAddGradeModal() {
  document.getElementById('addGradeModal').style.display = 'block';
  document.getElementById('addGradeMessage').innerText = '';

  const courses = window.teacherCourses || [];
  const students = window.teacherStudents || [];

  const courseSelect = document.getElementById('addGradeCourseSelect');
  const studentSelect = document.getElementById('addGradeStudentSelect');

  courseSelect.innerHTML = courses.map(c => `<option value="${c.id}">${c.course_name}</option>`).join('');

  function updateStudentOptions(courseId) {
    const filteredStudents = students.filter(s => Number(s.course_id) === Number(courseId));

    const uniqueStudentsMap = new Map();
    filteredStudents.forEach(s => {
      if (!uniqueStudentsMap.has(s.id)) {
        uniqueStudentsMap.set(s.id, s);
      }
    });
    const uniqueStudents = Array.from(uniqueStudentsMap.values());

    studentSelect.innerHTML = uniqueStudents
      .map(s => `<option value="${s.id}">${s.firstname} ${s.lastname}</option>`)
      .join('');
  }

  courseSelect.addEventListener('change', (e) => {
    updateStudentOptions(e.target.value);
  });

  if (courses.length > 0) {
    updateStudentOptions(courses[0].id);
  }
}



async function submitAddGrade() {
  const grade = document.getElementById('addGradeInput').value;
  const course_id = document.getElementById('addGradeCourseSelect').value;
  const student_id = document.getElementById('addGradeStudentSelect').value;
  const messageBox = document.getElementById('addGradeMessage');
  if (grade.trim() === '') {messageBox.innerText = 'Please enter a grade first!'; messageBox.style.color = 'red'; return;}

  try {
    const response = await fetch('/givegrade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ grade, course_id, student_id })
    });

    const result = await response.json();
    messageBox.innerText = `${result.message}`;
    messageBox.style.color = result.success ? 'green' : 'red';

    if (result.success) {
      setTimeout(() => {
        closeModal('addGradeModal');
        loadTeacherGradesOnly();
      }, 1000);
    }
  } catch (err) {
    messageBox.innerText = `An error occurred while adding grade. ${err}`;
    messageBox.style.color = 'red';
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = 'none';
    const inputs = modal.querySelectorAll('input, select');
    inputs.forEach(input => input.value = '');
    const messageBox = modal.querySelector('.form-message');
    if (messageBox) messageBox.innerText = '';
  }
}


function populateCourseSelect(grades) {
  const select = document.getElementById("courseSelectforExport");
  select.innerHTML = ""; 

  const uniqueCourses = [...new Map(
    grades.map(g => [g.course_id, { id: g.course_id, name: g.course }])
  ).values()];

  uniqueCourses.forEach(course => {
    const option = document.createElement("option");
    option.value = course.id;
    option.textContent = course.name;
    select.appendChild(option);
  });
}



function exporttoPDF() {
    const courseId = document.getElementById('courseSelectforExport').value;
    const grades = window.teacherGrades;
    const selectedGrades = grades.filter(g => g.course_id == courseId);
    console.log(grades, courseId)
    if (!selectedGrades.length) {
        alert("No grades found for this course.");
        return;
    }

    const courseName = selectedGrades[0].course;
    const doc = new jspdf.jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text(`Grades Report for Course: ${courseName}`, 14, 20);

    // Date
    const dateStr = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Exported on: ${dateStr}`, 14, 28);

    // Build table rows
    const tableData = selectedGrades.map((g, index) => [
        index + 1,
        g.firstname,
        g.lastname,
        g.subject,
        g.grade,
        new Date(g.date).toLocaleDateString()
    ]);

    // Draw table
    doc.autoTable({
        startY: 35,
        head: [['#', 'First Name', 'Last Name', 'Subject', 'Grade', 'Date']],
        body: tableData,
        styles: { halign: 'center' },
        headStyles: { fillColor: [22, 160, 133] },
    });

    // Save the file
    doc.save(`grades_course_${courseId}.pdf`);
}









function renderStudentTable(searchTerm = "") {
    const tbody = document.getElementById("teacherStudentsTableBody");
    tbody.innerHTML = "";

    const filtered = window.teacherStudents.filter(student => {
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

document.getElementById("studentSearchInput").addEventListener("input", (e) => {
    renderStudentTable(e.target.value); // filters as you type
});