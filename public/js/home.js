function setupUserSearch() {
    const searchInput = document.getElementById('user-search-input');
    const resultsDiv = document.getElementById('user-search-results');

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
                        <div class="search-item" data-id="${user._id}" style="padding: 10px; cursor: pointer; border-bottom: 1px solid #eee;">
                            <strong>${user.username || 'No username'}</strong>
                            <div style="font-size: 0.8em; color: #666;">ID: ${user.discordId}</div>
                        </div>
                    `).join('');
                    resultsDiv.style.display = 'block';

                    resultsDiv.querySelectorAll('.search-item').forEach(item => {
                        item.onclick = () => {
                            const id = item.dataset.id;
                            window.location.href = `/u/${id}`;
                        };
                    });
                } else {
                    resultsDiv.innerHTML = '<div style="padding: 10px;">No users found</div>';
                    resultsDiv.style.display = 'block';
                }
            } catch (err) {
                console.error('User search error:', err);
            }
        }, 300);
    });

    // Close results when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target !== searchInput && e.target !== resultsDiv) {
            resultsDiv.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', setupUserSearch);
