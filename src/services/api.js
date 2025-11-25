/**
 * Unified API Service
 * This consolidates all API calls into a single service
 */

import { getBaseUrl } from '../config/api';

const BASE_URL = getBaseUrl();

/**
 * Handle token expiration and redirect to login
 */
const handleTokenExpiration = (response, data) => {
  const isTokenExpired = 
    response.status === 401 || 
    response.status === 403 || 
    data?.message?.toLowerCase().includes('token') ||
    data?.message?.toLowerCase().includes('unauthorized') ||
    data?.message?.toLowerCase().includes('expired') ||
    data?.error?.toLowerCase().includes('token') ||
    data?.error?.toLowerCase().includes('unauthorized');

  if (isTokenExpired) {
    // Clear expired token
    localStorage.removeItem('token');
    localStorage.removeItem('login_response');
    
    // Redirect to login with return URL
    const currentPath = window.location.pathname;
    const returnUrl = encodeURIComponent(currentPath);
    const message = encodeURIComponent('Your session has expired. Please log in again.');
    
    window.location.href = `/login?returnUrl=${returnUrl}&message=${message}`;
    return true;
  }
  
  return false;
};

/**
 * Core API request function
 */
export const apiRequest = async (endpoint, method = 'GET', body = null, requiresAuth = true) => {
  const url = `${BASE_URL}/api/${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
  };

  if (requiresAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const fetchOptions = {
    method,
    headers,
  };

  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, fetchOptions);
    
    let data;
    try {
      data = await response.json();
    } catch (error) {
      data = { 
        message: response.statusText || 'Unknown error',
        status: response.status 
      };
    }
    
    // Check for token expiration
    if (handleTokenExpiration(response, data)) {
      throw new Error('Token expired');
    }
    
    if (!response.ok) {
      const error = new Error(`API request failed with status ${response.status}`);
      error.response = { status: response.status, data };
      throw error;
    }

    return data;
  } catch (error) {
    console.error('API request failed:', {
      url,
      method,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Legacy call_api function for backward compatibility
 */
export const call_api = (payload, target, method) => {
  return apiRequest(target, method, payload);
};

// Export as default for backward compatibility
export default {
  apiRequest,
  call_api,
};

