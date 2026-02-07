function setupUserSearch(container) {
    const searchInput = container.querySelector('.a-user-search__input');
    const resultsDiv = container.querySelector('.a-user-search__results');

    if (!searchInput || !resultsDiv) return;

    let debounceTimer;

    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const query = searchInput.value.trim();
        
        if (query.length < 2) {
            resultsDiv.style.display = 'none';
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                const response = await fetch(`/api/user?search=${encodeURIComponent(query)}`);
                if (!response.ok) throw new Error('Search failed');
                const users = await response.json();
                
                // Show max 5
                const displayList = users.slice(0, 5);
                
                if (displayList.length > 0) {
                    resultsDiv.innerHTML = displayList.map(user => `
                        <div class="a-user-search__item" data-id="${user._id}">
                            <strong class="a-user-search__item-name">${user.username || 'No username'}</strong>
                            <div class="a-user-search__item-id">ID: ${user.discordId}</div>
                        </div>
                    `).join('');
                    resultsDiv.style.display = 'block';

                    resultsDiv.querySelectorAll('.a-user-search__item').forEach(item => {
                        item.onclick = () => {
                            const id = item.dataset.id;
                            window.location.href = `/u/${id}`;
                        };
                    });
                } else {
                    resultsDiv.innerHTML = '<div class="a-user-search__no-results">No users found</div>';
                    resultsDiv.style.display = 'block';
                }
            } catch (err) {
                console.error('User search error:', err);
            }
        }, 300);
    });

    // Close results when clicking outside
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            resultsDiv.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.a-user-search').forEach(setupUserSearch);
});
