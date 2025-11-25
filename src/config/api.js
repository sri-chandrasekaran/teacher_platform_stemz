// API Configuration for different environments
// This now uses environment variables instead of hardcoded values

const getEnvironment = () => {
  // Check environment variable first, fallback to NODE_ENV, then to 'development'
  return process.env.REACT_APP_NODE_ENV || process.env.NODE_ENV || 'development';
};

const API_CONFIG = {
  // Local development
  local: {
    baseUrl: 'http://localhost:3000',
    timeout: 10000,
  },
  development: {
    baseUrl: 'http://localhost:3000',
    timeout: 10000,
  },
  
  // Production server
  production: {
    baseUrl: 'https://core-server-nine.vercel.app',
    timeout: 10000,
  },
};

// Get current environment from environment variables
const CURRENT_ENV = getEnvironment();

// Get current API configuration
export const getApiConfig = () => {
  // Use environment variable if set, otherwise use config
  const envApiUrl = process.env.REACT_APP_API_URL;
  
  if (envApiUrl) {
    return {
      baseUrl: envApiUrl,
      timeout: 10000,
    };
  }
  
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
  LOCAL: 'local',
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
};

// Export current environment for debugging
export const CURRENT_ENVIRONMENT = CURRENT_ENV;

// Log configuration on load (only in development)
if (CURRENT_ENV !== 'production') {
  console.log('API Configuration:', {
    environment: CURRENT_ENV,
    baseUrl: getBaseUrl(),
    fromEnvVar: !!process.env.REACT_APP_API_URL,
  });
}

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
