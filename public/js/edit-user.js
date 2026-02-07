async function fetchUserData() {
    const pathParts = window.location.pathname.split('/');
    const userId = pathParts[pathParts.length - 1];
    
    if (!userId) {
        showError('No user ID provided');
        return;
    }

    try {
        const response = await fetch(`/api/user/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch user data');
        const user = await response.json();
        
        document.getElementById('username').value = user.username || '';
        document.getElementById('discord-id').textContent = user.discordId || 'N/A';
    } catch (error) {
        console.error(error);
        showError('Error loading user data');
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    const pathParts = window.location.pathname.split('/');
    const userId = pathParts[pathParts.length - 1];
    
    const username = document.getElementById('username').value;
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = '';

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
        showError('Username must be 3-20 characters long and contain only letters, numbers, and underscores.');
        return;
    }

    try {
        const response = await fetch(`/api/user/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });

        if (response.ok) {
            window.location.href = '/dashboard';
        } else {
            const data = await response.json();
            showError(data.message || 'Failed to update profile');
        }
    } catch (error) {
        console.error(error);
        showError('An error occurred while updating profile');
    }
}

function showError(message) {
    const errorEl = document.getElementById('error-message');
    if (errorEl) {
        errorEl.textContent = message;
    }
}

document.getElementById('edit-user-form').addEventListener('submit', handleFormSubmit);
fetchUserData();
