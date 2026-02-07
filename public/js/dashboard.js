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
            const loadCollections = async () => {
                const collectionsResponse = await fetch(`/api/collection?owner=${user._id}`);
                const collections = collectionsResponse.ok ? await collectionsResponse.json() : [];

                if (collections && collections.length > 0) {
                    collectionsList.innerHTML = collections.map(c => `
                        <div class="collection-item flex-row">
                            <span>${c.name || 'Unnamed Collection'}</span>
                            <div class="actions">
                                <button class="a-button edit-collection-btn" data-id="${c._id}">Edit</button>
                                <button class="a-button remove-collection-btn" data-id="${c._id}">Remove</button>
                            </div>
                        </div>
                    `).join('');

                    collectionsList.querySelectorAll('.edit-collection-btn').forEach(btn => {
                        btn.onclick = () => {
                            window.location.href = `/dashboard/c/${btn.dataset.id}`;
                        };
                    });

                    collectionsList.querySelectorAll('.remove-collection-btn').forEach(btn => {
                        btn.onclick = async () => {
                            if (confirm('are you sure? this cannot be reversed')) {
                                try {
                                    const response = await fetch(`/api/collection/${btn.dataset.id}`, {
                                        method: 'DELETE'
                                    });
                                    if (response.ok) {
                                        await loadCollections();
                                    } else {
                                        const err = await response.json();
                                        showError('Error: ' + (err.message || 'Failed to remove collection'));
                                    }
                                } catch (err) {
                                    console.error(err);
                                    showError('Error removing collection');
                                }
                            }
                        };
                    });
                } else {
                    collectionsList.innerHTML = '<p>No collections found.</p>';
                }
            };

            await loadCollections();

            const createForm = document.getElementById('create-collection-form');
            const nameInput = document.getElementById('new-collection-name');
            if (createForm && nameInput) {
                createForm.onsubmit = async (e) => {
                    e.preventDefault();
                    const name = nameInput.value.trim();
                    showError('');

                    try {
                        const response = await fetch('/api/collection', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name, owner: user._id })
                        });

                        if (response.ok) {
                            nameInput.value = '';
                            await loadCollections();
                        } else {
                            const err = await response.json();
                            showError('Error: ' + (err.message || 'Failed to create collection'));
                        }
                    } catch (err) {
                        console.error(err);
                        showError('Error creating collection');
                    }
                };
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

function showError(message) {
    const errorEl = document.getElementById('error-message');
    if (errorEl) {
        errorEl.textContent = message;
    }
}
