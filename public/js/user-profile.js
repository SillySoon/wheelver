async function fetchUser() {
    const pathParts = window.location.pathname.split('/');
    const userId = pathParts[pathParts.length - 1];
    
    if (!userId) {
        showError('No user ID provided');
        return;
    }

    try {
        const response = await fetch(`/api/user/${userId}`);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('User not found');
            }
            throw new Error('Failed to fetch user information');
        }
        const user = await response.json();
        displayUser(user);
    } catch (err) {
        showError(err.message);
    }
}

function displayUser(user) {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('user-content').classList.remove('hidden');
    
    document.getElementById('username').textContent = user.username;
    document.getElementById('discordId').textContent = user.discordId;
    document.getElementById('collectionsCount').textContent = user.collections ? user.collections.length : 0;
    document.getElementById('createdAt').textContent = new Date(user.createdAt).toLocaleDateString();
}

function showError(message) {
    document.getElementById('loading').classList.add('hidden');
    const errorEl = document.getElementById('error-message');
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
}

fetchUser();