async function fetchCollection() {
    const pathParts = window.location.pathname.split('/');
    const collectionId = pathParts[pathParts.length - 1];
    
    if (!collectionId) {
        showError('No collection ID provided');
        return;
    }

    try {
        const response = await fetch(`/api/collection/${collectionId}`);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Collection not found');
            }
            throw new Error('Failed to fetch collection information');
        }
        const collection = await response.json();
        displayCollection(collection);
    } catch (err) {
        showError(err.message);
    }
}

function displayCollection(collection) {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('collection-content').classList.remove('hidden');
    
    document.getElementById('collection-name').textContent = collection.name;
    
    const ownerEl = document.getElementById('collection-owner');
    if (collection.owner) {
        ownerEl.textContent = `${collection.owner.username} (${collection.owner.discordId})`;
    } else {
        ownerEl.textContent = 'Unknown';
    }

    document.getElementById('hotwheels-count').textContent = collection.hotwheels ? collection.hotwheels.length : 0;

    const listContainer = document.getElementById('hotwheels-list');
    listContainer.innerHTML = '';

    if (collection.hotwheels && collection.hotwheels.length > 0) {
        collection.hotwheels.forEach(hw => {
            const card = document.createElement('div');
            card.className = 'hotwheel-card';
            
            const seriesName = hw.series ? hw.series.name : 'Unknown Series';
            
            card.innerHTML = `
                <h3><a href="/hw/${hw._id}">${hw.name}</a></h3>
                <p><strong>Series:</strong> ${seriesName} (${hw.seriesNumber || 'N/A'})</p>
                <p><strong>Toy Number:</strong> ${hw.toyNumber || 'N/A'}</p>
                <p><strong>Year:</strong> ${hw.year || 'N/A'}</p>
            `;
            listContainer.appendChild(card);
        });
    } else {
        listContainer.innerHTML = '<p>No Hot Wheels in this collection yet.</p>';
    }
}

function showError(message) {
    document.getElementById('loading').classList.add('hidden');
    const errorEl = document.getElementById('error-message');
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
}

fetchCollection();
