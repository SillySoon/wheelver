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
        setupSearch(collectionId);

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

    list.innerHTML = hotwheels.map(hw => {
        const photoUrl = hw.photoUrl || '/images/default.jpg';
        return `
        <div class="hotwheel-item">
            <img src="${photoUrl}" alt="${hw.name}" class="hw-preview">
            <div class="hw-info">
                <div class="flex-row">
                    <strong>${hw.name}</strong>
                    <button class="a-button remove-hw-btn" data-hw-id="${hw._id}">Remove</button>
                </div>
                <div>(${hw.toyNumber}) - ${hw.series?.name || 'No Series'}</div>
            </div>
        </div>
    `}).join('');

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

function setupSearch(collectionId) {
    const searchInput = document.getElementById('hw-search-input');
    const resultsDiv = document.getElementById('search-results');
    const addButton = document.getElementById('add-hw-btn');
    const selectedInfo = document.getElementById('selected-hw-info');

    let selectedHw = null;
    let debounceTimer;

    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const query = searchInput.value.trim();
        
        selectedHw = null;
        addButton.disabled = true;
        selectedInfo.textContent = '';

        if (query.length < 2) {
            resultsDiv.style.display = 'none';
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                const response = await fetch(`/api/hotwheel?search=${encodeURIComponent(query)}`);
                if (!response.ok) throw new Error('Search failed');
                const hotwheels = await response.json();
                
                // Show max 5
                const displayList = hotwheels.slice(0, 5);
                
                if (displayList.length > 0) {
                    resultsDiv.innerHTML = displayList.map(hw => {
                        const photoUrl = hw.photoUrl || '/images/default.jpg';
                        return `
                        <div class="search-item" data-id="${hw._id}" style="padding: 5px; cursor: pointer; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 10px;">
                            <img src="${photoUrl}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
                            <div>
                                <div>${hw.name}</div>
                                <div style="font-size: 0.8em; color: #666;">(${hw.toyNumber}) - ${hw.series?.name || 'No Series'}</div>
                            </div>
                        </div>
                    `}).join('');
                    resultsDiv.style.display = 'block';

                    resultsDiv.querySelectorAll('.search-item').forEach(item => {
                        item.onclick = () => {
                            const id = item.dataset.id;
                            selectedHw = displayList.find(h => h._id === id);
                            searchInput.value = selectedHw.name;
                            selectedInfo.textContent = `Selected: ${selectedHw.name} (${selectedHw.toyNumber})`;
                            addButton.disabled = false;
                            resultsDiv.style.display = 'none';
                        };
                    });
                } else {
                    resultsDiv.innerHTML = '<div style="padding: 5px;">No results found</div>';
                    resultsDiv.style.display = 'block';
                }
            } catch (err) {
                console.error(err);
            }
        }, 300);
    });

    // Close results when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target !== searchInput && e.target !== resultsDiv) {
            resultsDiv.style.display = 'none';
        }
    });

    addButton.onclick = async () => {
        if (!selectedHw) return;

        try {
            const response = await fetch(`/api/collection/${collectionId}/hotwheel/${selectedHw._id}`, {
                method: 'POST'
            });

            if (response.ok) {
                const updatedCollection = await response.json();
                renderHotwheels(updatedCollection.hotwheels, collectionId);
                
                // Reset search
                searchInput.value = '';
                selectedHw = null;
                addButton.disabled = true;
                selectedInfo.textContent = '';
            } else {
                const err = await response.json();
                showError(err.message || 'Failed to add hotwheel');
            }
        } catch (err) {
            console.error(err);
            showError('Error adding hotwheel');
        }
    };
}

fetchCollection();
