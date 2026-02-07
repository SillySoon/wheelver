async function fetchUser() {
    const pathParts = window.location.pathname.split('/');
    const userId = pathParts[pathParts.length - 1];
    
    if (!userId) {
        showError('No user ID provided');
        return;
    }

    try {
        const userResponse = await fetch(`/api/user/${userId}`);
        if (!userResponse.ok) {
            if (userResponse.status === 404) {
                throw new Error('User not found');
            }
            throw new Error('Failed to fetch user information');
        }
        const user = await userResponse.json();

        const collectionsResponse = await fetch(`/api/collection?owner=${userId}`);
        const collections = collectionsResponse.ok ? await collectionsResponse.json() : [];

        displayUser(user, collections);
    } catch (err) {
        showError(err.message);
    }
}

function displayUser(user, collections) {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('user-content').classList.remove('hidden');
    
    document.getElementById('username').textContent = user.username;
    document.getElementById('discordId').textContent = user.discordId;
    document.getElementById('collectionsCount').textContent = collections ? collections.length : 0;
    document.getElementById('createdAt').textContent = new Date(user.createdAt).toLocaleDateString();

    const collectionsList = document.getElementById('collections-list');
    collectionsList.innerHTML = '';
    
    if (collections && collections.length > 0) {
        collections.forEach(collection => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `/c/${collection._id}`;
            a.textContent = collection.name || `Collection ${collection._id}`;
            li.appendChild(a);
            
            if (collection.hotwheels) {
                const span = document.createElement('span');
                span.textContent = ` (${collection.hotwheels.length} items)`;
                li.appendChild(span);
            }
            
            collectionsList.appendChild(li);
        });
    } else {
        collectionsList.innerHTML = '<li>No collections found.</li>';
    }
}

function showError(message) {
    document.getElementById('loading').classList.add('hidden');
    const errorEl = document.getElementById('error-message');
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
}

fetchUser();