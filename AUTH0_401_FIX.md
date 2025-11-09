# Fix Auth0 401 Error on /oauth/token

## Problem
Getting `401 Unauthorized` error on `dev-dpqkca4rwoqa3qlp.us.auth0.com/oauth/token`

This typically happens when:
1. Refresh tokens are enabled but not properly configured
2. Application type mismatch in Auth0
3. Missing or incorrect audience configuration

## Solution

### Option 1: Disable Refresh Tokens (Recommended for SPA)

For a Single Page Application, you typically don't need refresh tokens unless you're accessing an API.

**The code has been updated** to automatically disable refresh tokens if no audience is set.

**Make sure your `frontend/.env` does NOT have `VITE_AUTH0_AUDIENCE` set:**
```env
# Don't set this unless you need API access
# VITE_AUTH0_AUDIENCE=
```

### Option 2: Verify Auth0 Application Settings

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Navigate to **Applications** → Your Application
3. Check **Application Type**: Should be **"Single Page Application"**
4. Verify **Token Endpoint Authentication Method**: Should be **"None"** (for SPA)
5. Scroll to **Advanced Settings** → **Grant Types**:
   - ✅ **Authorization Code**
   - ✅ **Refresh Token** (only if using refresh tokens)
   - ❌ **Implicit** (not recommended)
6. Click **Save Changes**

### Option 3: Clear Browser Storage

The error might be from cached tokens. Clear your browser storage:

1. Open browser DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Find **Local Storage** → `http://localhost:8080`
4. Delete all Auth0-related keys (usually start with `@@auth0spa`)
5. Refresh the page and try again

### Option 4: Check Application Grant Types

In Auth0 Dashboard:
1. **Applications** → Your App → **Advanced Settings**
2. **Grant Types** tab
3. Make sure these are enabled:
   - ✅ **Authorization Code**
   - ✅ **Refresh Token** (if using refresh tokens)
4. **OAuth** tab:
   - **Token Endpoint Authentication Method**: **None** (for SPA)

## Quick Fix Steps

1. **Clear browser cache and localStorage**
   ```javascript
   // In browser console:
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Restart frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Verify .env file**
   Make sure `frontend/.env` doesn't have `VITE_AUTH0_AUDIENCE` set (unless you need it)

4. **Try logging in again**

## If You Need API Access (with Audience)

If you need to access a protected API:

1. **Create an API in Auth0:**
   - Go to **APIs** → **Create API**
   - Name: `FocusFlow API`
   - Identifier: `https://focusflow-api` (or your domain)
   - Signing Algorithm: `RS256`

2. **Update frontend/.env:**
   ```env
   VITE_AUTH0_AUDIENCE=https://focusflow-api
   ```

3. **Update Auth0 Application:**
   - Go to **Applications** → Your App
   - **Advanced Settings** → **Grant Types**
   - Enable **Refresh Token**
   - **OAuth** tab → **Token Endpoint Authentication Method**: **None**

## Verification

After fixing, you should:
- ✅ Be able to log in without 401 errors
- ✅ See user info after authentication
- ✅ No errors in browser console

## Still Having Issues?

1. Check browser console for the exact error message
2. Verify your Auth0 application is set to "Single Page Application"
3. Make sure callback URLs are correct in Auth0 dashboard
4. Try in an incognito/private window to rule out cache issues

