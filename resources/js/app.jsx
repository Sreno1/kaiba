import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.jsx`,
            import.meta.glob('./pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
    onError: async (error) => {
        // Handle CSRF token mismatch (419 errors)
        if (error.response && error.response.status === 419) {
            try {
                // Try to refresh the CSRF token
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
                    // The request will be retried by Inertia automatically
                    return;
                }
            } catch (refreshError) {
                console.error('Failed to refresh CSRF token:', refreshError);
            }
            
            // If refresh failed, reload the page as fallback
            window.location.reload();
            return;
        }
        
        // For other errors, show the default error handling
        console.error('Inertia error:', error);
    },
});
