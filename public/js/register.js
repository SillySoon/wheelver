const urlParams = new URLSearchParams(window.location.search);
const error = urlParams.get('error');
if (error) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = error;
    }
}
