function setupUserSearch(container) {
    // Escape values before inserting them into HTML strings
    const esc = (value) =>
        String(value ?? "").replace(
            /[&<>"']/g,
            (c) =>
                ({
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;",
                })[c],
        );

    const searchInput = container.querySelector(".a-search__input");
    const resultsDiv = container.querySelector(".a-search__results");

    if (!searchInput || !resultsDiv) return;

    // Prevent form submission on Enter
    const form = container.closest("form");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
        });
    }

    let debounceTimer;

    searchInput.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        const query = searchInput.value.trim();

        if (query.length < 2) {
            resultsDiv.style.display = "none";
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                const response = await fetch(`/api/user?search=${encodeURIComponent(query)}&limit=5`);
                if (!response.ok) throw new Error("Search failed");
                const { data: displayList } = await response.json();

                if (displayList.length > 0) {
                    resultsDiv.innerHTML = displayList
                        .map(
                            (user) => `
                        <a class="a-search__item" href="/u/${encodeURIComponent(user.handle)}">
                            <strong class="a-search__item-name">${esc(user.displayName)}</strong>
                            <span class="a-search__item-id">@${esc(user.handle)}</span>
                        </a>
                    `,
                        )
                        .join("");
                    resultsDiv.style.display = "block";
                } else {
                    resultsDiv.innerHTML = '<div class="a-search__no-results">No users found</div>';
                    resultsDiv.style.display = "block";
                }
            } catch (err) {
                console.error("User search error:", err);
            }
        }, 300);
    });

    // Close results when clicking outside
    document.addEventListener("click", (e) => {
        if (!container.contains(e.target)) {
            resultsDiv.style.display = "none";
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-user-search]").forEach(setupUserSearch);
});
