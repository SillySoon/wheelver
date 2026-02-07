document.addEventListener('DOMContentLoaded', () => {
    const createForm = document.getElementById('create-collection-form');
    if (!createForm) return;

    const nameInput = document.getElementById('new-collection-name');
    const formErrorEl = document.getElementById('form-error-message');
    const currentUserId = createForm.dataset.userId;

    const showError = (message) => {
        if (formErrorEl) {
            formErrorEl.textContent = message;
        }
    };

    const reloadCollections = () => {
        window.location.reload(); // Simple reload to refresh collections after action
    };

    if (createForm && nameInput) {
        createForm.onsubmit = async (e) => {
            e.preventDefault();
            const name = nameInput.value.trim();
            showError('');

            try {
                const response = await fetch('/api/collection', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, owner: currentUserId })
                });

                if (response.ok) {
                    nameInput.value = '';
                    reloadCollections();
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

    document.querySelectorAll('.remove-collection-btn').forEach(btn => {
        btn.onclick = async () => {
            if (confirm('Are you sure you want to remove this collection? This cannot be undone.')) {
                try {
                    const collectionId = btn.dataset.id;
                    const response = await fetch(`/api/collection/${collectionId}`, {
                        method: 'DELETE'
                    });

                    if (response.ok) {
                        reloadCollections();
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
});