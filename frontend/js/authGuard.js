function checkTokenExpiration() {
    const token = localStorage.getItem('token');
    if (!token) return kickOut();

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        if (isExpired) return kickOut();
    } catch (err) {
        return kickOut(); 
    }
}

function kickOut() {
    alert('Session expired. You will be redirected to login.');
    localStorage.removeItem('token');
    window.location.href = '/'; 
}

checkTokenExpiration();

setInterval(checkTokenExpiration, 10000);
