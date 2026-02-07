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

        document.getElementById('collection-name').value = collection.name;

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

fetchCollection();
