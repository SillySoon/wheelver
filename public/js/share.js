document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#share-button').forEach(button => {
        button.addEventListener('click', async () => {
            const urlToCopy = button.dataset.shareUrl || window.location.href;
            try {
                await navigator.clipboard.writeText(urlToCopy);
                // Provide visual feedback
                const originalText = button.textContent;
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = originalText;
                }, 2000);
            } catch (err) {
                console.error('Failed to copy: ', err);
                // Optionally provide error feedback to the user
                const originalText = button.textContent;
                button.textContent = 'Failed to copy!';
                setTimeout(() => {
                    button.textContent = originalText;
                }, 2000);
            }
        });
    });
});