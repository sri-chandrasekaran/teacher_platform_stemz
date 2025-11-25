# API Configuration Setup

## Environment Variables

This project uses environment variables to manage different API endpoints for local development and production.

### Setting Up Environment Variables

1. **For Local Development:**
   ```bash
   # Copy the example file
   cp env.local.example .env.local
   ```
   
   This will use `http://localhost:3000` as the API base URL.

2. **For Production:**
   ```bash
   # Copy the example file
   cp env.production.example .env.production
   ```
   
   This will use `https://core-server-nine.vercel.app` as the API base URL.

3. **For Vercel Deployment:**
   
   Add these environment variables in your Vercel project settings:
   ```
   REACT_APP_API_URL=https://core-server-nine.vercel.app
   REACT_APP_NODE_ENV=production
   GENERATE_SOURCEMAP=false
   ```

### Environment Files

- `env.example` - Template showing all available environment variables
- `env.local.example` - Local development configuration
- `env.production.example` - Production configuration

### How It Works

The application reads from `process.env.REACT_APP_API_URL` to determine which API to connect to:

- **Local Development**: When you run `npm start`, it uses `.env.local` (if present) or defaults to localhost
- **Production Build**: When you run `npm run build`, it uses `.env.production` or the environment variables from Vercel

### API Services Consolidation

The codebase has been refactored to use a unified API configuration:

1. **`src/config/api.js`** - Central configuration that reads environment variables
2. **`src/apiService.js`** - Main API service with all endpoint methods
3. **`src/services/api.js`** - Unified API request functions
4. **`src/components/api.js`** - Legacy call_api function (uses config)
5. **`src/services/apiClient.js`** - Generic HTTP client (uses config)

All services now use the environment-based configuration from `src/config/api.js`.

### Migration Guide

If you were previously using hardcoded URLs:

**Before:**
```javascript
const API_URL = 'http://localhost:3000/api';
```

**After:**
```javascript
import { getBaseUrl } from './config/api';
const API_URL = getBaseUrl();
```

### Troubleshooting

If you see connection errors like `ERR_CONNECTION_REFUSED`:

1. Check that your `.env.local` or `.env.production` file exists
2. Verify the `REACT_APP_API_URL` variable is set correctly
3. For production, ensure Vercel environment variables are configured
4. Restart your development server after changing environment variables
5. Check the console logs - the API configuration is logged on app start (development only)

### API Service Usage Examples

```javascript
// Using ApiService (recommended for most cases)
import ApiService from './apiService';

const users = await ApiService.fetchUsers();
const classroom = await ApiService.fetchClassroomById(classroomId);

// Using unified api service
import { apiRequest } from './services/api';

const data = await apiRequest('users', 'GET');
const result = await apiRequest('classrooms', 'POST', { name: 'New Class' });

// Legacy call_api (backward compatibility)
import { call_api } from './components/api';

const data = await call_api(payload, 'endpoint', 'POST');
```

