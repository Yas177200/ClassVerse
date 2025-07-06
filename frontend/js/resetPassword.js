function openResetPasswordModal() {
  document.getElementById('resetPasswordModal').style.display = 'flex';
  document.getElementById('resetPasswordMessage').textContent = '';
  document.getElementById('oldPassword').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmNewPassword').value = '';
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
    
  const oldInput = document.getElementById('oldPassword');
  const newInput = document.getElementById('newPassword');
  const confirmInput = document.getElementById('confirmNewPassword');
  const msg = document.getElementById('resetPasswordMessage');

  oldInput.classList.remove('input-error');
  newInput.classList.remove('input-error');
  confirmInput.classList.remove('input-error');
  msg.style.color = 'red';

}

async function submitPasswordReset() {
  const oldInput = document.getElementById('oldPassword');
  const newInput = document.getElementById('newPassword');
  const confirmInput = document.getElementById('confirmNewPassword');
  const oldPass = oldInput.value;
  const newPass = newInput.value;
  const confirmPass = confirmInput.value;
  const msg = document.getElementById('resetPasswordMessage');
  const username = document.getElementById('username').value;

  oldInput.classList.remove('input-error');
  newInput.classList.remove('input-error');
  confirmInput.classList.remove('input-error');
  msg.style.color = 'red';

  if (!oldPass || !newPass || !confirmPass) {
    msg.textContent = "All fields are required.";
    return;
  }


  if (newPass !== confirmPass) {
    msg.textContent = "New passwords do not match.";
    newInput.classList.add('input-error');
    confirmInput.classList.add('input-error');
    return;
  }

  const response = await fetch('/updatepass', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, newPass, oldPass })
  });

  const result = await response.json();

  if (result.success) {
    msg.style.color = "green";
    msg.textContent = result.message;
    setTimeout(() => closeModal('resetPasswordModal'), 1500);
  } else {
    msg.textContent = result.message;

    if (result.message.toLowerCase().includes("old password")) {
      oldInput.classList.add('input-error');
    }
  }
}
