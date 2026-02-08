document.addEventListener('DOMContentLoaded', () => {
    const mainElement = document.querySelector('main.l-container');
    const collectionId = mainElement ? mainElement.dataset.collectionId : null;

    if (!collectionId) {
        console.error('Collection ID not found in data attribute.');
        return;
    }

    const formErrorEl = document.getElementById('form-error-message');

    const showError = (message) => {
        if (formErrorEl) {
            formErrorEl.textContent = message;
        }
    };

    const reloadPage = () => {
        window.location.reload();
    };

    // --- Edit Collection Name ---
    const editCollectionForm = document.getElementById('edit-collection-form');
    const collectionNameInput = document.getElementById('collection-name');

    if (editCollectionForm && collectionNameInput) {
        editCollectionForm.onsubmit = async (e) => {
            e.preventDefault();
            const newName = collectionNameInput.value.trim();
            showError('');

            try {
                const response = await fetch(`/api/collection/${collectionId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newName })
                });

                if (response.ok) {
                    reloadPage();
                } else {
                    const err = await response.json();
                    showError(err.message || 'Failed to update collection');
                }
            } catch (err) {
                console.error(err);
                showError('Error updating collection');
            }
        };
    }

    // --- Add Hot Wheel to Collection ---
    const hwSearchInput = document.getElementById('hw-search-input');
    const hwSearchResultsDiv = document.getElementById('hw-search-results');
    const addHwBtn = document.getElementById('add-hw-btn');
    const selectedHwInfo = document.getElementById('selected-hw-info');

    let selectedHw = null;
    let debounceTimer;

    if (hwSearchInput && hwSearchResultsDiv && addHwBtn && selectedHwInfo) {
        hwSearchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            const query = hwSearchInput.value.trim();
            
            selectedHw = null;
            addHwBtn.disabled = true;
            selectedHwInfo.textContent = '';
            hwSearchResultsDiv.style.display = 'none';

            if (query.length < 2) {
                return;
            }

            debounceTimer = setTimeout(async () => {
                try {
                    const response = await fetch(`/api/hotwheel?search=${encodeURIComponent(query)}`);
                    if (!response.ok) throw new Error('Search failed');
                    const hotwheels = await response.json();
                    
                    const displayList = hotwheels.slice(0, 5); // Show max 5
                    
                    if (displayList.length > 0) {
                        hwSearchResultsDiv.innerHTML = displayList.map(hw => {
                            const photoUrl = hw.photoUrl || '/images/default.jpg';
                            return `
                                <div class="a-search__item" data-id="${hw._id}" style="padding: 5px; cursor: pointer; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 10px;">
                                    <img src="${photoUrl}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
                                    <div>
                                        <div>${hw.name}</div>
                                        <div style="font-size: 0.8em; color: #666;">(${hw.toyNumber}) - ${hw.series?.name || 'No Series'}</div>
                                    </div>
                                </div>
                            `}).join('');
                        hwSearchResultsDiv.style.display = 'block';

                        hwSearchResultsDiv.querySelectorAll('.a-search__item').forEach(item => {
                            item.onclick = () => {
                                const id = item.dataset.id;
                                selectedHw = displayList.find(h => h._id === id);
                                hwSearchInput.value = selectedHw.name;
                                selectedHwInfo.textContent = `Selected: ${selectedHw.name} (${selectedHw.toyNumber})`;
                                addHwBtn.disabled = false;
                                hwSearchResultsDiv.style.display = 'none';
                            };
                        });
                    } else {
                        hwSearchResultsDiv.innerHTML = '<div class="a-search__no-results" style="padding: 5px;">No results found</div>';
                        hwSearchResultsDiv.style.display = 'block';
                    }
                } catch (err) {
                    console.error('Hotwheel search error:', err);
                }
            }, 300);
        });

        document.addEventListener('click', (e) => {
            if (e.target !== hwSearchInput && e.target !== hwSearchResultsDiv) {
                hwSearchResultsDiv.style.display = 'none';
            }
        });

        addHwBtn.onclick = async () => {
            if (!selectedHw) return;

            try {
                const response = await fetch(`/api/collection/${collectionId}/hotwheel/${selectedHw._id}`, {
                    method: 'POST'
                });

                if (response.ok) {
                    reloadPage();
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

    // --- Remove Hot Wheel ---
    document.querySelectorAll('.remove-hotwheel-btn').forEach(btn => {
        btn.onclick = async () => {
            const hwId = btn.dataset.id;
            if (confirm('Are you sure you want to remove this hotwheel from the collection?')) {
                try {
                    const response = await fetch(`/api/collection/${collectionId}/hotwheel/${hwId}`, {
                        method: 'DELETE'
                    });
                    if (response.ok) {
                        reloadPage();
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
});