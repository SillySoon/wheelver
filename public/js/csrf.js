// Attaches the CSRF token to every state-changing same-origin fetch request
(() => {
    const token = document.querySelector('meta[name="csrf-token"]')?.content;
    if (!token) return;

    const originalFetch = window.fetch.bind(window);
    window.fetch = (input, init = {}) => {
        const method = (init.method || "GET").toUpperCase();
        const url = new URL(typeof input === "string" ? input : input.url, window.location.href);

        if (method !== "GET" && method !== "HEAD" && url.origin === window.location.origin) {
            const headers = new Headers(init.headers || {});
            headers.set("X-CSRF-Token", token);
            init = { ...init, headers };
        }
        return originalFetch(input, init);
    };
})();
