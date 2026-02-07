async function fetchDashboardData() {
    try {
        const response = await fetch('/api/user/me');
        if (!response.ok) throw new Error('Failed to fetch data');
        const user = await response.json();
        console.log('User data:', user);
        
        const profileData = document.getElementById('profile-data');
        if (profileData) {
            profileData.innerHTML = `
                <p>Username: ${user.username || 'Not set'}</p>
                <p>ID: ${user._id}</p>
                <p>Discord ID: ${user.discordId}</p>
            `;
        }
        
        const editProfileBtn = document.getElementById('edit-profile-btn');
        if (editProfileBtn) {
            editProfileBtn.onclick = () => {
                window.location.href = `/dashboard/u/${user._id}`;
            };
        }

        const collectionsList = document.getElementById('collections-list');
        if (collectionsList) {
            const collectionsResponse = await fetch(`/api/collection?owner=${user._id}`);
            const collections = collectionsResponse.ok ? await collectionsResponse.json() : [];

            if (collections && collections.length > 0) {
                collectionsList.innerHTML = collections.map(c => `
                    <div class="collection-item">
                        <span>${c.name || 'Unnamed Collection'} (${c._id})</span>
                        <button class="edit-collection-btn" data-id="${c._id}">Edit</button>
                    </div>
                `).join('');

                collectionsList.querySelectorAll('.edit-collection-btn').forEach(btn => {
                    btn.onclick = () => {
                        window.location.href = `/dashboard/c/${btn.dataset.id}`;
                    };
                });
            } else {
                collectionsList.innerHTML = '<p>No collections found.</p>';
            }
        }
    } catch (error) {
        console.error(error);
        const profileData = document.getElementById('profile-data');
        const collectionsList = document.getElementById('collections-list');
        if (profileData) profileData.innerText = 'Error loading profile.';
        if (collectionsList) collectionsList.innerText = 'Error loading collections.';
    }
}
fetchDashboardData();
