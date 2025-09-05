// Application configuration
export const config = {
    // Environment
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
    
    // API configuration
    api: {
        baseURL: import.meta.env.VITE_API_BASE_URL || '',
        timeout: 10000,
    },
    
    // UI configuration
    ui: {
        defaultTheme: 'light',
        autoSaveDelay: 2000, // 2 seconds
        scheduleRetentionDays: 90,
    },
    
    // Feature flags
    features: {
        enableDebugLogs: import.meta.env.DEV,
        enablePerformanceMonitoring: import.meta.env.PROD,
    },
    
    // Schedule configuration
    schedule: {
        columns: ['Item', 'Time', 'Points', 'Done'],
        maxHistoryDays: 90,
        autoSaveInterval: 2000,
        resetTime: { hour: 23, minute: 59 }, // 11:59 PM
    },
};

// Utility functions
export const isDevelopment = () => config.isDev;
export const isProduction = () => config.isProd;
export const getApiUrl = (endpoint) => `${config.api.baseURL}${endpoint}`;
