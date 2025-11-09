# Fix Auth0 Callback URL Mismatch

## The Problem
You're getting: "Callback URL mismatch. The provided redirect_uri is not in the list of allowed callback URLs."

## The Solution

### Step 1: Find Your Render Frontend URL
Your frontend is deployed at: `https://focusflow.onrender.com` (or whatever URL Render gave you)

### Step 2: Update Auth0 Settings

1. Go to [Auth0 Dashboard](https://manage.auth0.com)
2. Navigate to **Applications** → Your Application (the one with client ID `HJJiMaA5REw1kBVzH0T1FfEY5AUnnMxA`)
3. Scroll down to **Application URIs** section

4. **Allowed Callback URLs** - Add these URLs (one per line):
   ```
   https://focusflow.onrender.com/callback
   http://localhost:5173/callback
   http://localhost:8080/callback
   ```

5. **Allowed Logout URLs** - Add these URLs:
   ```
   https://focusflow.onrender.com
   http://localhost:5173
   http://localhost:8080
   ```

6. **Allowed Web Origins** - Add these URLs:
   ```
   https://focusflow.onrender.com
   http://localhost:5173
   http://localhost:8080
   ```

7. **Allowed Origins (CORS)** - Add these URLs:
   ```
   https://focusflow.onrender.com
   http://localhost:5173
   http://localhost:8080
   ```

8. Click **Save Changes**

### Step 3: Verify Your Frontend URL

Make sure you're using the correct Render URL. Check your Render dashboard:
- Go to your Static Site service
- Copy the URL (should be something like `https://focusflow.onrender.com`)

### Step 4: Rebuild and Redeploy

After updating Auth0, you may need to:
1. Clear your browser cache
2. Try logging in again

The callback URL should now work!

---

## Quick Checklist

- [ ] Added `https://YOUR-RENDER-URL.onrender.com/callback` to Allowed Callback URLs
- [ ] Added `https://YOUR-RENDER-URL.onrender.com` to Allowed Logout URLs
- [ ] Added `https://YOUR-RENDER-URL.onrender.com` to Allowed Web Origins
- [ ] Added `https://YOUR-RENDER-URL.onrender.com` to Allowed Origins (CORS)
- [ ] Saved changes in Auth0
- [ ] Cleared browser cache
- [ ] Tried logging in again

---

## Common Issues

### Still Getting Error?
1. **Check the exact URL** - Make sure there's no trailing slash
2. **Check protocol** - Must be `https://` for production
3. **Wait a few seconds** - Auth0 changes may take a moment to propagate
4. **Check browser console** - Look for the exact callback URL being used

### Local Development
Make sure you also have `http://localhost:5173/callback` in your Auth0 settings for local testing.

---

## Environment Variables

Make sure your Render frontend has these environment variables set:
- `VITE_AUTH0_DOMAIN=dev-dpqkca4rwoqa3qlp.us.auth0.com`
- `VITE_AUTH0_CLIENT_ID=HJJiMaA5REw1kBVzH0T1FfEY5AUnnMxA`
- `VITE_AUTH0_AUDIENCE=your-api-identifier` (if using API)

The redirect URI is automatically set to `${window.location.origin}/callback`, so it will work for both local and production.

