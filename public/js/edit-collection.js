async function fetchCollection() {
    const pathParts = window.location.pathname.split('/');
    const collectionId = pathParts[pathParts.length - 1];

    if (!collectionId) {
        alert('No collection ID provided');
        return;
    }

    try {
        const response = await fetch(`/api/collection/${collectionId}`);
        if (!response.ok) throw new Error('Failed to fetch collection');
        const collection = await response.json();
        console.log('Collection data:', collection);

        if (collection.owner) {
            const ownerInfo = document.getElementById('owner-info');
            if (ownerInfo) {
                const ownerName = collection.owner.username || 'Unknown';
                const ownerId = collection.owner._id || collection.owner;
                ownerInfo.innerHTML = `Owner: <a href="/u/${ownerId}">${ownerName}</a>`;
            }
        }

        document.getElementById('collection-name').value = collection.name;

        renderHotwheels(collection.hotwheels, collectionId);

        const form = document.getElementById('edit-collection-form');
        form.onsubmit = async (e) => {
            e.preventDefault();
            const newName = document.getElementById('collection-name').value.trim();
            showError('');

            try {
                const updateResponse = await fetch(`/api/collection/${collectionId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newName })
                });

                if (updateResponse.ok) {
                    alert('Collection updated successfully');
                    window.location.href = '/dashboard';
                } else {
                    const err = await updateResponse.json();
                    showError(err.message || 'Failed to update collection');
                }
            } catch (err) {
                console.error(err);
                showError('Error updating collection');
            }
        };
    } catch (err) {
        console.error(err);
        showError('Error loading collection data');
    }
}

function showError(message) {
    const errorEl = document.getElementById('error-message');
    if (errorEl) {
        errorEl.textContent = message;
    }
}

function renderHotwheels(hotwheels, collectionId) {
    const list = document.getElementById('hotwheels-list');
    if (!list) return;

    if (!hotwheels || hotwheels.length === 0) {
        list.innerHTML = '<p>No hotwheels in this collection.</p>';
        return;
    }

    list.innerHTML = hotwheels.map(hw => `
        <div class="hotwheel-item" style="border: 1px solid #ccc; padding: 10px; margin-bottom: 5px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <strong>${hw.name}</strong> (${hw.toyNumber}) - ${hw.series?.name || 'No Series'}
            </div>
            <button class="remove-hw-btn" data-hw-id="${hw._id}">Remove</button>
        </div>
    `).join('');

    list.querySelectorAll('.remove-hw-btn').forEach(btn => {
        btn.onclick = async () => {
            const hwId = btn.dataset.hwId;
            if (confirm('Remove this hotwheel from collection?')) {
                try {
                    const response = await fetch(`/api/collection/${collectionId}/hotwheel/${hwId}`, {
                        method: 'DELETE'
                    });
                    if (response.ok) {
                        const updatedCollection = await response.json();
                        renderHotwheels(updatedCollection.hotwheels, collectionId);
                    } else {
                        const err = await response.json();
                        showError(err.message || 'Failed to remove hotwheel');
                    }
                } catch (err) {
                    console.error(err);
                    showError('Error removing hotwheel');
                }
            }
        };
    });
}

fetchCollection();
