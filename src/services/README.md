# API Services Guide

This guide explains how to use the standardized API client and configuration system for making HTTP requests in the application.

## 📁 File Structure

```
src/
├── config/
│   └── api.js          # API configuration and environment settings
└── services/
    ├── apiClient.js     # Standardized HTTP client
    ├── progressService.js # Example service using apiClient
    └── README.md        # This guide
```

## 🚀 Quick Start

### Basic Usage

```javascript
import apiClient from './services/apiClient.js';

// Simple GET request
const data = await apiClient.get('api/users/123');

// POST with data
const newUser = await apiClient.post('api/users', { name: 'John', email: 'john@example.com' });

// PUT with data
const updatedUser = await apiClient.put('api/users/123', { name: 'John Updated' });

// DELETE request
await apiClient.delete('api/users/123');
```

## ⚙️ Configuration (`src/config/api.js`)

### Environment Setup

The configuration file supports multiple environments:

```javascript
const API_CONFIG = {
  local: {
    baseUrl: 'http://localhost:3000',
    timeout: 10000,
  },
  production: {
    baseUrl: 'https://core-server-nine.vercel.app/',
    timeout: 10000,
  },
};
```

### Switching Environments

To switch between environments, change the `CURRENT_ENV` variable:

```javascript
// In src/config/api.js
const CURRENT_ENV = 'local'; // Change to 'production' for production
```

### Available Functions

```javascript
import { getBaseUrl, buildApiUrl, getTimeout } from '../config/api.js';

// Get current base URL
const baseUrl = getBaseUrl(); // Returns current environment's base URL

// Build full API URL
const fullUrl = buildApiUrl('api/users/123'); // Returns complete URL

// Get timeout for current environment
const timeout = getTimeout(); // Returns timeout in milliseconds
```

## 🔧 API Client (`src/services/apiClient.js`)

### Available Methods

| Method | Description | Example |
|--------|-------------|---------|
| `get(endpoint, options)` | GET request | `apiClient.get('api/users')` |
| `post(endpoint, data, options)` | POST request | `apiClient.post('api/users', userData)` |
| `put(endpoint, data, options)` | PUT request | `apiClient.put('api/users/123', userData)` |
| `patch(endpoint, data, options)` | PATCH request | `apiClient.patch('api/users/123', userData)` |
| `delete(endpoint, options)` | DELETE request | `apiClient.delete('api/users/123')` |

### Authentication

```javascript
// Set authentication token
apiClient.setAuthToken('your-jwt-token');

// Make authenticated request
const protectedData = await apiClient.get('api/protected-endpoint');

// Clear token
apiClient.setAuthToken(null);
```

### Custom Headers

```javascript
// Set custom headers for all requests
apiClient.setHeaders({
  'X-Custom-Header': 'value',
  'X-API-Version': 'v1',
});

// Or for a single request
const data = await apiClient.get('api/users', {
  headers: {
    'X-Special-Header': 'special-value',
  },
});
```

## 📝 Creating Service Functions

### Example: Progress Service

```javascript
// src/services/progressService.js
import apiClient from './apiClient.js';

/**
 * Get user progress for a specific course
 * @param {string} courseName - The name of the course
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - Progress data
 */
export const getUserCourseProgress = async (courseName, userId) => {
  try {
    return await apiClient.get(`api/progress/user/${userId}/course/${courseName}/completion`);
  } catch (error) {
    console.error('Error fetching user course progress:', error);
    throw error;
  }
};

/**
 * Update user progress
 * @param {string} courseName - The name of the course
 * @param {string} userId - The user ID
 * @param {Object} progressData - Updated progress data
 * @returns {Promise<Object>} - Updated progress
 */
export const updateUserProgress = async (courseName, userId, progressData) => {
  try {
    return await apiClient.put(
      `api/progress/user/${userId}/course/${courseName}/completion`,
      progressData
    );
  } catch (error) {
    console.error('Error updating user progress:', error);
    throw error;
  }
};
```

### Example: User Service

```javascript
// src/services/userService.js
import apiClient from './apiClient.js';

export const getUserProfile = async (userId) => {
  try {
    return await apiClient.get(`api/users/${userId}/profile`);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    return await apiClient.put(`api/users/${userId}/profile`, profileData);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const getUserCourses = async (userId) => {
  try {
    return await apiClient.get(`api/users/${userId}/courses`);
  } catch (error) {
    console.error('Error fetching user courses:', error);
    throw error;
  }
};
```

## 🛡️ Error Handling

The API client includes built-in error handling:

### Automatic Error Handling

```javascript
try {
  const data = await apiClient.get('api/nonexistent-endpoint');
} catch (error) {
  // Error will be: "HTTP 404: Not Found"
  console.error('Request failed:', error.message);
}
```

### Custom Error Handling

```javascript
export const getUserData = async (userId) => {
  try {
    return await apiClient.get(`api/users/${userId}`);
  } catch (error) {
    if (error.message.includes('404')) {
      throw new Error('User not found');
    } else if (error.message.includes('401')) {
      throw new Error('Unauthorized access');
    } else {
      throw new Error('Failed to fetch user data');
    }
  }
};
```

## ⏱️ Timeout Configuration

Timeouts are automatically handled based on environment:

```javascript
// In src/config/api.js
const API_CONFIG = {
  local: {
    baseUrl: 'http://localhost:3000',
    timeout: 10000, // 10 seconds
  },
  production: {
    baseUrl: 'https://core-server-nine.vercel.app/',
    timeout: 15000, // 15 seconds
  },
};
```

## 🔄 Environment Switching

### Development Workflow

1. **Local Development**: Set `CURRENT_ENV = 'local'` in `api.js`
2. **Production**: Set `CURRENT_ENV = 'production'` in `api.js`

### Using Environment Variables (Optional)

You can enhance the configuration to use environment variables:

```javascript
// In src/config/api.js
const CURRENT_ENV = process.env.REACT_APP_API_ENV || 'local';
```

## 📋 Best Practices

### 1. Service Organization

- Create separate service files for different domains (users, courses, progress, etc.)
- Keep service functions focused and single-purpose
- Use descriptive function names

### 2. Error Handling

- Always wrap API calls in try-catch blocks
- Log errors for debugging
- Provide meaningful error messages to users

### 3. Type Safety

- Use JSDoc comments for better IDE support
- Consider using TypeScript for better type safety

### 4. Authentication

- Set authentication tokens early in your app initialization
- Clear tokens on logout
- Handle 401 errors appropriately

### 5. Performance

- Use appropriate timeouts for different environments
- Consider implementing request caching for frequently accessed data
- Monitor API response times

## 🚨 Common Issues

### CORS Errors

If you encounter CORS errors, ensure your backend allows requests from your frontend domain.

### Network Errors

The API client includes timeout handling, but network issues can still occur. Always implement proper error handling.

### Authentication Errors

Make sure to set the correct authentication token before making protected requests.

## 📚 Additional Resources

- [Fetch API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [REST API Best Practices](https://restfulapi.net/)

---

**Note**: This guide assumes you're using the standardized API client. If you need to make direct fetch calls, refer to the Fetch API documentation. 