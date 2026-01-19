// API Configuration for different environments
// Defaults to localhost:3000 for development

const getEnvironment = () => {
  // Use REACT_APP_NODE_ENV if set, otherwise default to 'development'
  return process.env.REACT_APP_NODE_ENV || 'development';
};

const API_CONFIG = {
  // Development - uses localhost
  development: {
    baseUrl: 'http://localhost:3000',
    timeout: 10000,
  },
  
  // Production server (for Vercel deployments)
  production: {
    baseUrl: 'https://core-server-nine.vercel.app',
    timeout: 10000,
  },
};

// Get current environment
const CURRENT_ENV = getEnvironment();

// Get current API configuration
export const getApiConfig = () => {
  return API_CONFIG[CURRENT_ENV] || API_CONFIG.development;
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
  // Add /api prefix if not already present
  const apiPrefix = cleanEndpoint.startsWith('api/') ? '' : 'api/';
  return `${baseUrl}/${apiPrefix}${cleanEndpoint}`;
};

// Environment constants
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
};

// Export current environment for debugging
export const CURRENT_ENVIRONMENT = CURRENT_ENV;

// Log configuration on load
console.log('API Configuration:', {
  environment: CURRENT_ENV,
  baseUrl: getBaseUrl(),
});

// Default export for easy importing
const apiConfig = {
  getApiConfig,
  getBaseUrl,
  getTimeout,
  buildApiUrl,
  ENVIRONMENTS,
  CURRENT_ENVIRONMENT,
};

export default apiConfig;
