document.addEventListener('DOMContentLoaded', () => {
    const mainElement = document.querySelector('main.l-container');
    const collectionId = mainElement ? mainElement.dataset.collectionId : null;

    if (!collectionId) {
        console.error('Collection ID not found.');
        return;
    }

    // Escape values before inserting them into HTML strings
    const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);

    const formErrorEl = document.getElementById('form-error-message');
    const showError = (msg) => { if (formErrorEl) formErrorEl.textContent = msg; };

    // --- Edit Collection Name ---
    const editCollectionForm = document.getElementById('edit-collection-form');
    const collectionNameInput = document.getElementById('collection-name');

    if (editCollectionForm && collectionNameInput) {
        editCollectionForm.onsubmit = async (e) => {
            e.preventDefault();
            showError('');
            try {
                const res = await fetch(`/api/collection/${collectionId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: collectionNameInput.value.trim() })
                });
                if (res.ok) {
                    window.location.reload();
                } else {
                    const err = await res.json();
                    showError(err.message || 'Failed to update collection');
                }
            } catch {
                showError('Error updating collection');
            }
        };
    }

    // --- Helpers ---
    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const extraBadgeClass = (extra) =>
        `e-hotwheel-card__badge e-hotwheel-card__badge--extra e-hotwheel-card__badge--${extra.toLowerCase().replace(/ /g, '-')} e-hw-row__badge`;

    const extraBadgeLabel = (extra) =>
        extra === 'Treasure Hunt' ? 'TH' : extra === 'Super Treasure Hunt' ? 'STH' : extra;

    const buildBadgeHTML = (extra) =>
        extra && extra !== 'Regular'
            ? `<span class="${esc(extraBadgeClass(extra))}">${esc(extraBadgeLabel(extra))}</span>`
            : '';

    // --- Owned counts (tracked in memory) ---
    const ownedCounts = {};
    document.querySelectorAll('.e-hw-row').forEach(row => {
        const id = row.querySelector('.remove-hotwheel-btn')?.dataset.id;
        if (id) ownedCounts[id] = (ownedCounts[id] || 0) + 1;
    });

    const listControls = document.getElementById('list-controls');
    const hwList = document.getElementById('hw-list');
    const hwEmpty = document.getElementById('hw-empty');

    const showListControls = () => {
        if (listControls) listControls.style.display = '';
        if (hwEmpty) hwEmpty.remove();
    };

    // --- Insert row into list (no reload) ---
    const insertRow = (hw, collectedAt) => {
        showListControls();

        const li = document.createElement('li');
        li.className = 'e-hw-row';
        li.dataset.name = hw.name.toLowerCase();
        li.dataset.toyNumber = (hw.toyNumber || '').toLowerCase();
        li.dataset.series = (hw.series?.name || '').toLowerCase();
        li.dataset.year = hw.year || 0;
        li.dataset.extra = hw.extra || 'Regular';
        li.dataset.collectedAt = collectedAt ? new Date(collectedAt).getTime() : Date.now();

        li.innerHTML = `
            <img class="e-hw-row__thumb" src="${esc(hw.photoUrl || '/images/default.jpg')}" alt="${esc(hw.name)}">
            <div class="e-hw-row__main">
                <span class="e-hw-row__name">${esc(hw.name)}</span>
                ${buildBadgeHTML(hw.extra)}
            </div>
            <span class="e-hw-row__series text--muffled">${esc(hw.series?.name || '-')}</span>
            <span class="e-hw-row__toy-number text--muffled">${esc(hw.toyNumber || '-')}</span>
            <span class="e-hw-row__date text--muffled">${formatDate(collectedAt)}</span>
            <button class="a-button a-button--danger remove-hotwheel-btn" data-id="${esc(hw._id)}" data-collection-id="${esc(collectionId)}">Remove</button>
        `;

        li.querySelector('.remove-hotwheel-btn').addEventListener('click', handleRemove);

        const header = hwList?.querySelector('.m-hw-list__header');
        if (header) header.insertAdjacentElement('afterend', li);
        else hwList?.prepend(li);

        // Brief highlight
        li.style.backgroundColor = '#e8f5e9';
        setTimeout(() => { li.style.transition = 'background-color 0.8s'; li.style.backgroundColor = ''; }, 50);
    };

    // --- Remove row (no reload) ---
    const handleRemove = async (e) => {
        const btn = e.currentTarget;
        const hwId = btn.dataset.id;

        if (!confirm('Remove this hotwheel from the collection?')) return;

        try {
            const res = await fetch(`/api/collection/${collectionId}/hotwheel/${hwId}`, { method: 'DELETE' });
            if (res.ok) {
                const row = btn.closest('.e-hw-row');
                row.remove();
                ownedCounts[hwId] = Math.max(0, (ownedCounts[hwId] || 1) - 1);

                // If preview is showing this hw, refresh owned count
                if (selectedHw?._id === hwId) renderPreview(selectedHw);

                // Show empty state if no rows left
                const remaining = hwList?.querySelectorAll('.e-hw-row');
                if (!remaining || remaining.length === 0) {
                    if (listControls) listControls.style.display = 'none';
                    const emptyLi = document.createElement('li');
                    emptyLi.className = 'm-hw-list__empty';
                    emptyLi.id = 'hw-empty';
                    emptyLi.textContent = 'No hotwheels in this collection yet.';
                    hwList?.appendChild(emptyLi);
                }
            } else {
                const err = await res.json();
                showError(err.message || 'Failed to remove hotwheel');
            }
        } catch {
            showError('Error removing hotwheel');
        }
    };

    document.querySelectorAll('.remove-hotwheel-btn').forEach(btn => btn.addEventListener('click', handleRemove));

    // --- Delete Collection ---
    const deleteBtn = document.getElementById('delete-collection-btn');
    if (deleteBtn) {
        deleteBtn.onclick = async () => {
            if (!confirm('Are you sure you want to delete this collection? This cannot be undone.')) return;
            try {
                const res = await fetch(`/api/collection/${collectionId}`, { method: 'DELETE' });
                if (res.ok) {
                    window.location.href = '/dashboard';
                } else {
                    const err = await res.json();
                    showError(err.message || 'Failed to delete collection');
                }
            } catch {
                showError('Error deleting collection');
            }
        };
    }

    // --- Search & Preview ---
    const hwSearchInput = document.getElementById('hw-search-input');
    const hwSearchResultsDiv = document.getElementById('hw-search-results');
    const hwPreview = document.getElementById('hw-preview');

    if (!hwSearchInput) return;

    let searchResults = [];
    let focusedIndex = -1;
    let selectedHw = null;
    let quantity = 1;
    let debounce;

    const renderPreview = (hw) => {
        if (!hwPreview) return;
        selectedHw = hw;
        quantity = 1;

        const owned = ownedCounts[hw._id] || 0;

        hwPreview.innerHTML = `
            <div class="m-hw-add__preview-image">
                <img src="${esc(hw.photoUrl || '/images/default.jpg')}" alt="${esc(hw.name)}">
                ${buildBadgeHTML(hw.extra)}
            </div>
            <div class="m-hw-add__preview-body">
                <p class="m-hw-add__preview-name">${esc(hw.name)}</p>
                <p class="text--muffled">${esc(hw.series?.name || 'Unknown Series')}</p>
                <p class="text--muffled">${esc([hw.toyNumber, hw.year].filter(Boolean).join(' · '))}</p>
                ${owned > 0 ? `<p class="m-hw-add__owned">×${owned} already in collection</p>` : ''}
            </div>
            <div class="m-hw-add__preview-actions">
                <div class="m-hw-add__qty">
                    <button class="m-hw-add__qty-btn" id="qty-minus">−</button>
                    <span class="m-hw-add__qty-value" id="qty-display">1</span>
                    <button class="m-hw-add__qty-btn" id="qty-plus">+</button>
                </div>
                <button class="a-button" id="add-hw-confirm">Add to Collection</button>
            </div>
        `;
        hwPreview.classList.add('m-hw-add__preview--visible');

        document.getElementById('qty-minus').onclick = () => {
            if (quantity > 1) { quantity--; document.getElementById('qty-display').textContent = quantity; }
        };
        document.getElementById('qty-plus').onclick = () => {
            quantity++;
            document.getElementById('qty-display').textContent = quantity;
        };
        document.getElementById('add-hw-confirm').onclick = () => confirmAdd(hw, quantity);
    };

    const confirmAdd = async (hw, qty) => {
        const addBtn = document.getElementById('add-hw-confirm');
        if (addBtn) { addBtn.disabled = true; addBtn.textContent = 'Adding...'; }
        showError('');

        try {
            for (let i = 0; i < qty; i++) {
                const res = await fetch(`/api/collection/${collectionId}/hotwheel/${hw._id}`, { method: 'POST' });
                if (!res.ok) {
                    const err = await res.json();
                    showError(err.message || 'Failed to add hotwheel');
                    return;
                }
                const data = await res.json();
                const entries = data.hotwheels;
                const newEntry = entries[entries.length - 1];
                insertRow(hw, newEntry?.collectedAt);
                ownedCounts[hw._id] = (ownedCounts[hw._id] || 0) + 1;
            }

            // Reset search, refresh preview with updated count
            hwSearchInput.value = '';
            hwSearchResultsDiv.innerHTML = '';
            hwSearchResultsDiv.style.display = 'none';
            searchResults = [];
            focusedIndex = -1;
            renderPreview(hw);
        } catch {
            showError('Error adding hotwheel');
        }
    };

    const setFocused = (index) => {
        const items = hwSearchResultsDiv.querySelectorAll('.a-search__item');
        items.forEach(el => el.classList.remove('a-search__item--focused'));
        if (index >= 0 && index < items.length) {
            items[index].classList.add('a-search__item--focused');
            items[index].scrollIntoView({ block: 'nearest' });
            focusedIndex = index;
            renderPreview(searchResults[index]);
        }
    };

    const renderResults = (results) => {
        searchResults = results;
        focusedIndex = -1;

        if (results.length === 0) {
            hwSearchResultsDiv.innerHTML = '<div class="a-search__no-results">No results found</div>';
            hwSearchResultsDiv.style.display = 'block';
            return;
        }

        hwSearchResultsDiv.innerHTML = results.map((hw, i) => {
            const owned = ownedCounts[hw._id] || 0;
            const ownedTag = owned > 0 ? `<span class="a-search__item-owned">×${owned} owned</span>` : '';
            return `
                <div class="a-search__item" data-index="${i}">
                    <img src="${esc(hw.photoUrl || '/images/default.jpg')}" class="a-search__item-thumb" alt="${esc(hw.name)}">
                    <div class="a-search__item-info">
                        <span class="a-search__item-name">${esc(hw.name)}</span>
                        <span class="a-search__item-id">${esc(hw.toyNumber || '')} · ${esc(hw.series?.name || '')}</span>
                    </div>
                    ${ownedTag}
                </div>
            `;
        }).join('');
        hwSearchResultsDiv.style.display = 'block';

        hwSearchResultsDiv.querySelectorAll('.a-search__item').forEach((item) => {
            const index = Number(item.dataset.index);
            item.addEventListener('mouseenter', () => setFocused(index));
            item.addEventListener('click', () => {
                renderPreview(searchResults[index]);
                hwSearchResultsDiv.style.display = 'none';
            });
        });
    };

    hwSearchInput.addEventListener('input', () => {
        clearTimeout(debounce);
        const query = hwSearchInput.value.trim();

        if (query.length < 2) {
            hwSearchResultsDiv.innerHTML = '';
            hwSearchResultsDiv.style.display = 'none';
            searchResults = [];
            focusedIndex = -1;
            return;
        }

        hwSearchResultsDiv.innerHTML = '<div class="a-search__no-results">Loading...</div>';
        hwSearchResultsDiv.style.display = 'block';

        debounce = setTimeout(async () => {
            try {
                const res = await fetch(`/api/hotwheel?search=${encodeURIComponent(query)}`);
                if (!res.ok) throw new Error();
                const data = await res.json();
                renderResults(data.slice(0, 8));
            } catch {
                hwSearchResultsDiv.innerHTML = '<div class="a-search__no-results">Search failed</div>';
            }
        }, 250);
    });

    // Keyboard navigation
    hwSearchInput.addEventListener('keydown', (e) => {
        const items = hwSearchResultsDiv.querySelectorAll('.a-search__item');
        if (!items.length) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setFocused(Math.min(focusedIndex + 1, items.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setFocused(Math.max(focusedIndex - 1, 0));
        } else if (e.key === 'Enter' && focusedIndex >= 0) {
            e.preventDefault();
            hwSearchResultsDiv.style.display = 'none';
            confirmAdd(searchResults[focusedIndex], 1);
        } else if (e.key === 'Escape') {
            hwSearchResultsDiv.style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if (!hwSearchResultsDiv.contains(e.target) && e.target !== hwSearchInput) {
            hwSearchResultsDiv.style.display = 'none';
        }
    });
});
