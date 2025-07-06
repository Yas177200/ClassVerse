document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const firstname = document.getElementById('firstname').value;
    const lastname = document.getElementById('lastname').value;
    const email = document.getElementById('email').value;
    const birthday = document.getElementById('birthday').value;
    const role_id = document.getElementById('role_id').value;
    const messageEl = document.getElementById('message');

    try {
        const response = await fetch('/createuser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstname,
                lastname,
                birthday,
                username,
                email,
                password,
                role_id 
            })
        });

        const data = await response.json();
        if (data.success) {
            messageEl.textContent = data.message;
            messageEl.className = 'message success';
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } else {
            messageEl.textContent = data.message;
            messageEl.className = 'message error';
        }
    } catch (error) {
        messageEl.textContent = 'An error occurred, please try again.';
        messageEl.className = 'message error';
        console.error('signup error', error);
    }
});
