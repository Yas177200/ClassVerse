document.getElementById('loginForm').addEventListener('submit',async(e)=>{
    e.preventDefault();
    const username = document.getElementById('loginusername').value;
    const password =  document.getElementById('loginpassword').value;
    const messageEl = document.getElementById('message');

    try{
        const response = await fetch('/api/login',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify({username,password})
        });
        const data = await response.json();
        if(data.success){
            messageEl.textContent = data.message;
            messageEl.className = 'message success';
            localStorage.setItem('token',data.token);
            

            setTimeout(()=>{
                if (data.user_role === 3) 
                {
                    window.location.href = '/student';
                }
                if (data.user_role === 4 || data.user_role === 5) {
                    window.location.href = '/notapproved'
                }
                if (data.user_role === 2) 
                {
                    window.location.href = '/teacher';
                }
                if (data.user_role === 1) 
                {
                    window.location.href = '/admin';
                }
            },1000);
        }else{
            messageEl.textContent =data.message;
            messageEl.className = 'message error'
        }
    }catch(error){
        messageEl.textContent ='An error ocurred , please try again. later'
        messageEl.className = 'message error'
        console.error('login error',error)
    }
})

