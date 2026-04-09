document.addEventListener('DOMContentLoaded', () => {
    const list = document.querySelector('.m-hw-list');
    const searchInput = document.getElementById('hw-filter-search');
    const sortSelect = document.getElementById('hw-sort');
    const pills = document.querySelectorAll('.a-pill');
    const noResults = document.getElementById('hw-no-results');

    if (!list || !searchInput) return;

    let activeExtra = 'all';

    const getRows = () => Array.from(list.querySelectorAll('.e-hw-row'));

    const applyFiltersAndSort = () => {
        const query = searchInput.value.trim().toLowerCase();
        const sort = sortSelect ? sortSelect.value : 'collected-desc';

        let rows = getRows();

        // Filter
        rows.forEach(row => {
            const name = row.dataset.name || '';
            const toyNumber = row.dataset.toyNumber || '';
            const extra = row.dataset.extra || 'Regular';

            const matchesSearch = !query || name.includes(query) || toyNumber.includes(query);
            const matchesExtra = activeExtra === 'all' || extra === activeExtra;

            row.style.display = matchesSearch && matchesExtra ? '' : 'none';
        });

        // Sort visible rows
        const visible = rows.filter(r => r.style.display !== 'none');

        visible.sort((a, b) => {
            switch (sort) {
                case 'name-asc':       return (a.dataset.name || '').localeCompare(b.dataset.name || '');
                case 'name-desc':      return (b.dataset.name || '').localeCompare(a.dataset.name || '');
                case 'year-desc':      return Number(b.dataset.year) - Number(a.dataset.year);
                case 'year-asc':       return Number(a.dataset.year) - Number(b.dataset.year);
                case 'collected-desc': return Number(b.dataset.collectedAt) - Number(a.dataset.collectedAt);
                default: return 0;
            }
        });

        visible.forEach(row => list.appendChild(row));

        if (noResults) {
            noResults.style.display = visible.length === 0 ? '' : 'none';
        }
    };

    // Disable pills for extra types not present
    const presentExtras = new Set(getRows().map(r => r.dataset.extra));
    pills.forEach(pill => {
        if (pill.dataset.extra !== 'all' && !presentExtras.has(pill.dataset.extra)) {
            pill.disabled = true;
            pill.style.opacity = '0.35';
            pill.style.cursor = 'not-allowed';
        }
    });

    // Apply on load
    applyFiltersAndSort();

    // Search
    let debounce;
    searchInput.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(applyFiltersAndSort, 200);
    });

    // Sort
    if (sortSelect) {
        sortSelect.addEventListener('change', applyFiltersAndSort);
    }

    // Pills
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            if (pill.disabled) return;
            pills.forEach(p => p.classList.remove('a-pill--active'));
            pill.classList.add('a-pill--active');
            activeExtra = pill.dataset.extra;
            applyFiltersAndSort();
        });
    });
});
