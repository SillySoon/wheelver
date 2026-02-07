async function updateHeaderAuth() {
    try {
        const response = await fetch('/api/user/me');
        const loginLink = document.getElementById('login-link');
        const dashboardLink = document.getElementById('dashboard-link');

        if (response.ok) {
            if (loginLink) loginLink.style.display = 'none';
            if (dashboardLink) dashboardLink.style.display = 'inline';
        } else {
            if (loginLink) loginLink.style.display = 'inline';
            if (dashboardLink) dashboardLink.style.display = 'none';
        }
    } catch (error) {
        console.error('Error updating header auth:', error);
    }
}
updateHeaderAuth();
