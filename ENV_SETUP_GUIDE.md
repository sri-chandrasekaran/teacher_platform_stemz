# Environment Setup Guide

## How It Works (Simplified)

**By default:** Uses `development` environment → `http://localhost:3000`

No `.env` file needed for local development! Just run `npm start` and it will connect to your local server.

For production (Vercel), set:
```
REACT_APP_NODE_ENV=production → https://core-server-nine.vercel.app
```

## Configuration

### Local Development (Default)
**No setup needed!** Just run:
```bash
npm start
```

Automatically uses `http://localhost:3000`

### Production (Vercel Only)
In Vercel environment variables, set:
```
REACT_APP_NODE_ENV=production
```

Automatically uses `https://core-server-nine.vercel.app`

## What You Need To Do

**For local development:** Nothing! Just run `npm start`

**If you have a `.env` file:**
- Delete `REACT_APP_API_URL` if it exists (it was causing the issue)
- You don't need any environment variables for local development

**For Vercel production:**
- Go to Vercel Project Settings → Environment Variables
- Add: `REACT_APP_NODE_ENV` = `production`

## Debugging

The console will show:

```javascript
// Development (default)
{ environment: 'development', baseUrl: 'http://localhost:3000' }

// Production
{ environment: 'production', baseUrl: 'https://core-server-nine.vercel.app' }
```

## Quick Fix

**If you're seeing the wrong URL:**

1. Check if you have a `.env` file in your project root
2. Delete any `REACT_APP_API_URL` entries
3. Restart: `npm start`

That's it!
