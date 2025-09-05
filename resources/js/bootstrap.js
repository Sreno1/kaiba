import axios from 'axios';

// Function to get current CSRF token from meta tag
function getCurrentCSRFToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
}

// Function to refresh CSRF token
async function refreshCSRFToken() {
    try {
        const response = await fetch('/csrf-token', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            // Update the meta tag
            const metaTag = document.querySelector('meta[name="csrf-token"]');
            if (metaTag) {
                metaTag.setAttribute('content', data.csrf_token);
            }
            // Update axios header
            axios.defaults.headers.common['X-CSRF-TOKEN'] = data.csrf_token;
            return data.csrf_token;
        }
    } catch (error) {
        console.error('Failed to refresh CSRF token:', error);
    }
    return null;
}

// Configure axios defaults
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.headers.common['X-CSRF-TOKEN'] = getCurrentCSRFToken();
axios.defaults.withCredentials = true;

// Handle authentication and CSRF errors
axios.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 401) {
            window.location.href = '/login';
            return Promise.reject(error);
        }
        
        // Handle CSRF token mismatch - try to refresh token and retry
        if (error.response?.status === 419) {
            const newToken = await refreshCSRFToken();
            if (newToken && error.config) {
                // Update the request headers and retry
                error.config.headers['X-CSRF-TOKEN'] = newToken;
                return axios.request(error.config);
            } else {
                // If refresh failed, redirect to reload
                window.location.reload();
            }
        }
        
        return Promise.reject(error);
    }
);

// Refresh CSRF token periodically (every 30 minutes)
setInterval(refreshCSRFToken, 30 * 60 * 1000);

// Make axios available globally for debugging if needed
if (import.meta.env.DEV) {
    window.axios = axios;
}
