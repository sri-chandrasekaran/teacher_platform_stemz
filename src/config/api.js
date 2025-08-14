// API Configuration for different environments
const API_CONFIG = {
  // Local development
  local: {
    baseUrl: 'http://localhost:3000',
    timeout: 10000,
  },
  
  // Production server
  production: {
    baseUrl: 'https://core-server-nine.vercel.app',
    timeout: 10000,
  },
};

// Current environment - change this to switch between environments
const CURRENT_ENV = 'production'; // Options: 'local', 'production'

// Get current API configuration
export const getApiConfig = () => {
  return API_CONFIG[CURRENT_ENV] || API_CONFIG.local;
};

// Get base URL for current environment
export const getBaseUrl = () => {
  return getApiConfig().baseUrl;
};

// Get timeout for current environment
export const getTimeout = () => {
  return getApiConfig().timeout;
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint) => {
  const baseUrl = getBaseUrl();
  // Remove leading slash if endpoint has one
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
};

// Environment constants
export const ENVIRONMENTS = {
  LOCAL: 'local',
  DEV: 'dev',
  STAGING: 'staging',
  PRODUCTION: 'production',
};

// Export current environment for debugging
export const CURRENT_ENVIRONMENT = CURRENT_ENV;

// Default export for easy importing
export default {
  getApiConfig,
  getBaseUrl,
  getTimeout,
  buildApiUrl,
  ENVIRONMENTS,
  CURRENT_ENVIRONMENT,
}; 