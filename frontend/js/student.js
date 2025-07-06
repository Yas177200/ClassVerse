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

    const response = await fetch('/api/student', {
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







    populateUser(data.userdata);
    populateGrades(data.usergrades);
    populateStudenCourses(data.courses);

    window.grades = data.usergrades;
    window.user = data.userdata;
});

function populateUser(user) {
    document.getElementById('firstname').value = user.firstname;
    document.getElementById('lastname').value = user.lastname;
    document.getElementById('email').value = user.email;
    document.getElementById('birthday').value = user.birthday;
    document.getElementById('username').value = user.username;
    document.getElementById('welcomeFirstname').innerText = user.firstname;
    const profileImg = document.getElementById('profileImg');
    profileImg.src = user.img_src || '/img/default-avatar.png';
}

function populateGrades(grades) {
    const tbody = document.getElementById('gradesTableBody');
    tbody.innerHTML = '';

    if (!grades.length) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4" style="text-align:center">No grades available</td>';
        tbody.appendChild(row);
        return;
    }

    grades.forEach(g => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${g.subject}</td>
            <td>${g.grade}</td>
            <td>${g.teacher}</td>
            <td>${g.date.split('T')[0]}</td>
        `;
        tbody.appendChild(row);
    });
}

function populateStudenCourses(courses) {
    const coursesContainer = document.getElementById('coursesSection');
    courses.forEach(course => {
        const div = document.createElement('div');
        div.className = 'stat-card';
        div.innerText = `${course.course_name}`;
        coursesContainer.appendChild(div);
    })
}

function showDashboardSection(sectionId) {
    const sections = ['profileSection', 'gradesSection', 'coursesSection'];
    sections.forEach(id => {
        document.getElementById(id).style.display = (id === sectionId + 'Section') ? 'block' : 'none';
    });

    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    document.querySelector(`.menu-item[onclick*="${sectionId}"]`).classList.add('active');
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/';
}


async function exportStudentPdf() {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      const studentName = `${window.user.firstname}  ${window.user.firstname}`;
      const dateExported = new Date().toLocaleDateString();

      const grades = window.grades;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Student Grade Report", 105, 20, { align: "center" });

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Name: ${studentName}`, 14, 30);
      doc.text(`Date: ${dateExported}`, 14, 36);

       

      doc.autoTable({
        startY: 50,
        head: [["Subject", "Grade", "Teacher Ms/Mr", "Date"]],
        body: grades.map(row => [row.subject, row.grade, row.teacher, row.date]),
        theme: "grid",
        styles: {
          fontSize: 11,
          halign: 'center',
          valign: 'middle'
        },
        headStyles: {
          fillColor: [22, 160, 133],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        },
      });

      // Save
      doc.save(`${studentName.replace(/\s+/g, "_")}_grades.pdf`);
    }