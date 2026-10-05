function showError(message) {
    const errorEl = document.getElementById("error-message");
    if (errorEl) {
        errorEl.textContent = message;
    }
}

async function handleDeleteAccount(event) {
    const userId = event.currentTarget.dataset.userId;

    if (!confirm("Delete your account and all collections permanently? This cannot be undone.")) {
        return;
    }

    showError("");
    try {
        const response = await fetch(`/api/user/${userId}`, { method: "DELETE" });
        if (response.ok) {
            window.location.href = "/";
        } else {
            const data = await response.json();
            showError(data.message || "Failed to delete account");
        }
    } catch (error) {
        console.error(error);
        showError("An error occurred while deleting the account");
    }
}

document.getElementById("delete-account-btn").addEventListener("click", handleDeleteAccount);
