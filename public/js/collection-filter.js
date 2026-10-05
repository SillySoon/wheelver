document.addEventListener("DOMContentLoaded", () => {
    const grid = document.querySelector(".m-collection__grid");
    const searchInput = document.getElementById("hw-filter-search");
    const sortSelect = document.getElementById("hw-sort");
    const pills = document.querySelectorAll(".a-pill");
    const noResults = document.getElementById("hw-no-results");

    if (!grid || !searchInput) return;

    let activeExtra = "all";

    const getCards = () => Array.from(grid.querySelectorAll(".e-hotwheel-card"));

    const applyFiltersAndSort = () => {
        const query = searchInput.value.trim().toLowerCase();
        const sort = sortSelect ? sortSelect.value : "name-asc";

        let cards = getCards();

        // Filter
        cards.forEach((card) => {
            const name = card.dataset.name || "";
            const toyNumber = card.dataset.toyNumber || "";
            const extra = card.dataset.extra || "Regular";

            const matchesSearch = !query || name.includes(query) || toyNumber.includes(query);
            const matchesExtra = activeExtra === "all" || extra === activeExtra;

            card.style.display = matchesSearch && matchesExtra ? "" : "none";
        });

        // Sort visible cards
        const visible = cards.filter((c) => c.style.display !== "none");

        visible.sort((a, b) => {
            switch (sort) {
                case "name-asc":
                    return (a.dataset.name || "").localeCompare(b.dataset.name || "");
                case "name-desc":
                    return (b.dataset.name || "").localeCompare(a.dataset.name || "");
                case "year-desc":
                    return Number(b.dataset.year) - Number(a.dataset.year);
                case "year-asc":
                    return Number(a.dataset.year) - Number(b.dataset.year);
                case "collected-desc":
                    return Number(b.dataset.collectedAt) - Number(a.dataset.collectedAt);
                case "count-desc":
                    return Number(b.dataset.count) - Number(a.dataset.count);
                default:
                    return 0;
            }
        });

        visible.forEach((card) => grid.appendChild(card));

        if (noResults) {
            noResults.style.display = visible.length === 0 ? "" : "none";
        }
    };

    // Search
    let debounce;
    searchInput.addEventListener("input", () => {
        clearTimeout(debounce);
        debounce = setTimeout(applyFiltersAndSort, 200);
    });

    // Sort
    if (sortSelect) {
        sortSelect.addEventListener("change", applyFiltersAndSort);
    }

    // Disable pills for extra types not present in the collection
    const presentExtras = new Set(getCards().map((c) => c.dataset.extra));
    pills.forEach((pill) => {
        if (pill.dataset.extra !== "all" && !presentExtras.has(pill.dataset.extra)) {
            pill.disabled = true;
            pill.style.opacity = "0.35";
            pill.style.cursor = "not-allowed";
        }
    });

    // Apply on load
    applyFiltersAndSort();

    // Pills
    pills.forEach((pill) => {
        pill.addEventListener("click", () => {
            pills.forEach((p) => p.classList.remove("a-pill--active"));
            pill.classList.add("a-pill--active");
            activeExtra = pill.dataset.extra;
            applyFiltersAndSort();
        });
    });
});
