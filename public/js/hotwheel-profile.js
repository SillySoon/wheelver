async function fetchHotwheel() {
    const pathParts = window.location.pathname.split('/');
    const hwId = pathParts[pathParts.length - 1];
    
    if (!hwId) {
        showError('No Hot Wheel ID provided');
        return;
    }

    try {
        const response = await fetch(`/api/hotwheel/${hwId}`);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Hot Wheel not found');
            }
            throw new Error('Failed to fetch Hot Wheel information');
        }
        const hotwheel = await response.json();
        displayHotwheel(hotwheel);
    } catch (err) {
        showError(err.message);
    }
}

function displayHotwheel(hw) {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('hw-content').classList.remove('hidden');
    
    document.getElementById('hw-name').textContent = hw.name;
    document.getElementById('hw-series').textContent = hw.series ? hw.series.name : 'Unknown';
    document.getElementById('hw-series-number').textContent = hw.seriesNumber || 'N/A';
    document.getElementById('hw-toy-number').textContent = hw.toyNumber || 'N/A';
    document.getElementById('hw-col-number').textContent = hw.colNumber || 'N/A';
    document.getElementById('hw-year').textContent = hw.year || 'N/A';
    document.getElementById('hw-extra').textContent = hw.extra || 'None';

    const photoContainer = document.getElementById('hw-photo-container');
    const photoImg = document.getElementById('hw-photo');
    photoImg.src = hw.photoUrl || '/images/default.jpg';
    photoContainer.classList.remove('hidden');
}

function showError(message) {
    document.getElementById('loading').classList.add('hidden');
    const errorEl = document.getElementById('error-message');
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
}

fetchHotwheel();
