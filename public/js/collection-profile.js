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
        const ownerName = collection.owner.username || 'Unknown';
        const ownerId = collection.owner._id || collection.owner;
        ownerEl.innerHTML = `<a href="/u/${ownerId}">${ownerName}</a>`;
    } else {
        ownerEl.textContent = 'Unknown';
    }

    document.getElementById('hotwheels-count').textContent = collection.hotwheels ? collection.hotwheels.length : 0;

    const listContainer = document.getElementById('hotwheels-list');
    listContainer.innerHTML = '';

    if (collection.hotwheels && collection.hotwheels.length > 0) {
        collection.hotwheels.forEach(hw => {
            const card = document.createElement('div');
            card.className = 'hotwheel-item';
            
            const seriesName = hw.series ? hw.series.name : 'Unknown Series';
            const photoUrl = hw.photoUrl || '/images/default.jpg';
            
            card.innerHTML = `
                <img src="${photoUrl}" alt="${hw.name}" class="hw-preview">
                <div class="hw-info">
                    <div class="flex-row">
                        <strong><a href="/hw/${hw._id}">${hw.name}</a></strong>
                        <span>(${hw.toyNumber || 'N/A'})</span>
                    </div>
                    <div>${seriesName} (${hw.seriesNumber || 'N/A'}) - ${hw.year || 'N/A'}</div>
                </div>
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
