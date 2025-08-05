import { buildApiUrl, getTimeout } from '../config/api.js';

// Standard headers for all API requests
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Standard timeout for requests
const DEFAULT_TIMEOUT = getTimeout();

/**
 * Standardized API client for making HTTP requests
 */
class ApiClient {
  constructor() {
    this.baseHeaders = DEFAULT_HEADERS;
    this.timeout = DEFAULT_TIMEOUT;
  }

  /**
   * Add custom headers to the request
   * @param {Object} headers - Additional headers to include
   */
  setHeaders(headers) {
    this.baseHeaders = { ...this.baseHeaders, ...headers };
  }

  /**
   * Set authorization token
   * @param {string} token - Bearer token
   */
  setAuthToken(token) {
    if (token) {
      this.baseHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.baseHeaders['Authorization'];
    }
  }

  /**
   * Create a timeout promise
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise} - Promise that rejects after timeout
   */
  createTimeoutPromise(timeout) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeout);
    });
  }

  /**
   * Make a GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Object>} - Response data
   */
  async get(endpoint, options = {}) {
    const url = buildApiUrl(endpoint);
    
    const fetchOptions = {
      method: 'GET',
      headers: { ...this.baseHeaders, ...options.headers },
      ...options,
    };

    return this.makeRequest(url, fetchOptions);
  }

  /**
   * Make a POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Object>} - Response data
   */
  async post(endpoint, data = null, options = {}) {
    const url = buildApiUrl(endpoint);
    
    const fetchOptions = {
      method: 'POST',
      headers: { ...this.baseHeaders, ...options.headers },
      ...options,
    };

    if (data) {
      fetchOptions.body = JSON.stringify(data);
    }

    return this.makeRequest(url, fetchOptions);
  }

  /**
   * Make a PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Object>} - Response data
   */
  async put(endpoint, data = null, options = {}) {
    const url = buildApiUrl(endpoint);
    
    const fetchOptions = {
      method: 'PUT',
      headers: { ...this.baseHeaders, ...options.headers },
      ...options,
    };

    if (data) {
      fetchOptions.body = JSON.stringify(data);
    }

    return this.makeRequest(url, fetchOptions);
  }

  /**
   * Make a DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Object>} - Response data
   */
  async delete(endpoint, options = {}) {
    const url = buildApiUrl(endpoint);
    
    const fetchOptions = {
      method: 'DELETE',
      headers: { ...this.baseHeaders, ...options.headers },
      ...options,
    };

    return this.makeRequest(url, fetchOptions);
  }

  /**
   * Make a PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Object>} - Response data
   */
  async patch(endpoint, data = null, options = {}) {
    const url = buildApiUrl(endpoint);
    
    const fetchOptions = {
      method: 'PATCH',
      headers: { ...this.baseHeaders, ...options.headers },
      ...options,
    };

    if (data) {
      fetchOptions.body = JSON.stringify(data);
    }

    return this.makeRequest(url, fetchOptions);
  }

  /**
   * Execute the actual HTTP request with timeout and error handling
   * @param {string} url - Full URL
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} - Response data
   */
  async makeRequest(url, options) {
    try {
      // Create timeout promise
      const timeoutPromise = this.createTimeoutPromise(this.timeout);
      
      // Create fetch promise
      const fetchPromise = fetch(url, options);
      
      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error('API request failed:', {
        url,
        method: options.method,
        error: error.message,
      });
      throw error;
    }
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();

export default apiClient; 