let isEditing = false;


async function toggleEditProfile() {
    const firstnameinput = document.getElementById("firstname");
    const lastnameinput = document.getElementById("lastname");
    const birthdayinput = document.getElementById("birthday");
    const emailinput = document.getElementById("email");
    const username = document.getElementById("username").value;
    document.getElementById('resetpassbtn').style.display = 'none';

    const button = document.getElementById("editProfileBtn");
    const cancelButton = document.getElementById("cancelEditBtn");
    const inputs = [firstnameinput, lastnameinput, birthdayinput, emailinput];

    if (!isEditing) {
        originalProfileData = {
            firstname: firstnameinput.value,
            lastname: lastnameinput.value,
            birthday: birthdayinput.value,
            email: emailinput.value
        };
        inputs.forEach(input => {
            input.removeAttribute("readonly");
            input.style.backgroundColor = '#8dd9fc';
        });
        button.textContent = "Save";
        cancelButton.style.display = "inline-block";
        isEditing = true;
    } else {
        const firstname = firstnameinput.value;
        const lastname = lastnameinput.value;
        const birthday = birthdayinput.value;
        const email = emailinput.value;
        await fetch("/updateuser", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ firstname, lastname, birthday, email, username })
        })
        .then(response => {
            if (!response.ok) throw new Error("Update failed");
            return response.json();
        })
        .then(data => {
            console.log("User updated:", data.message);
            inputs.forEach(input => {
                input.setAttribute("readonly", true);
                input.style.backgroundColor = '#F9F9F9';

            });
            button.textContent = "Edit Profile";
            document.getElementById('resetpassbtn').style.display = 'inline-block';
            cancelButton.style.display = "none";
            isEditing = false;
        })
        .catch(error => {
            console.error("Error updating profile:", error);
            alert("Failed to update profile.");
        });
    }
}

function cancelEditProfile() {
    const firstnameinput = document.getElementById("firstname");
    const lastnameinput = document.getElementById("lastname");
    const birthdayinput = document.getElementById("birthday");
    const emailinput = document.getElementById("email");
    const button = document.getElementById("editProfileBtn");
    const cancelButton = document.getElementById("cancelEditBtn");
    document.getElementById('resetpassbtn').style.display = 'inline-block';

    firstnameinput.value = originalProfileData.firstname;
    lastnameinput.value = originalProfileData.lastname;
    birthdayinput.value = originalProfileData.birthday;
    emailinput.value = originalProfileData.email;

    [firstnameinput, lastnameinput, birthdayinput, emailinput].forEach(input => {
        input.style.backgroundColor = '#F9F9F9';
        input.setAttribute("readonly", true)
    });
    
    button.textContent = "Edit Profile";
    cancelButton.style.display = "none";
    isEditing = false;
}



document.addEventListener('DOMContentLoaded', () => {
  const profileImg = document.getElementById('profileImg');
  const fileInput = document.getElementById('profileImageInput');
  const imgOverlay = document.getElementById('imgOverlay');

  function updateOverlayText() {
    const defaultPath = '/img/default-avatar.png';
    if (!profileImg.src || profileImg.src.endsWith(defaultPath)) {
      imgOverlay.textContent = 'Upload Image';
    } else {
      imgOverlay.textContent = 'Update Image';
    }
  }

  updateOverlayText();

  profileImg.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', async () => {
    if (!fileInput.files.length) return;

    const username = document.getElementById('username').value;

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async function(event) {
      const img_src = event.target.result;

      try {
        const response = await fetch('/updateuser', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, img_src })
        });

        const data = await response.json();

        if (!response.ok || data.success === false) {
          // Show backend error message if available
          const errorMessage = data.message || `Error: ${response.status} ${response.statusText}`;
          alert(errorMessage);
          console.error('Backend error:', errorMessage);
          return;
        }

        profileImg.src = data.img_src || img_src;

        updateOverlayText();
        fileInput.value = '';
        console.log('Image updated successfully', username);
      } catch (error) {
        console.error('Fetch or parsing error:', error);
        alert('Image Size must be less than 50 KB and 200px X 200px');
      }
    };

    reader.readAsDataURL(file);
  });
});
