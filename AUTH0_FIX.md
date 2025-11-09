# Fix Auth0 Callback URL Mismatch

## Quick Fix Steps

### 1. Go to Auth0 Dashboard
- Visit: https://manage.auth0.com/
- Navigate to: **Applications** → Your Application (or create one)

### 2. Update Allowed Callback URLs
In the **Allowed Callback URLs** field, add:
```
http://localhost:8080
```

**Important:** If you have multiple URLs, separate them with commas:
```
http://localhost:8080,http://localhost:8080/callback
```

### 3. Update Allowed Logout URLs
In the **Allowed Logout URLs** field, add:
```
http://localhost:8080
```

### 4. Update Allowed Web Origins (if needed)
In the **Allowed Web Origins** field, add:
```
http://localhost:8080
```

### 5. Save Changes
Click **Save Changes** at the bottom of the page.

### 6. Verify Your Frontend .env
Make sure your `frontend/.env` file has:
```env
VITE_AUTH0_REDIRECT_URI=http://localhost:8080
```

### 7. Restart Your Frontend
After making changes, restart your frontend dev server:
```bash
cd frontend
npm run dev
```

## Common Issues

### Still Getting Error?
1. **Clear browser cache** - Auth0 may have cached the old redirect URI
2. **Check browser console** - Look for the exact redirect URI being sent
3. **Verify the URL** - Make sure there's no trailing slash: `http://localhost:8080` (not `http://localhost:8080/`)

### Multiple Environments
If you're testing on different ports, add all of them:
```
http://localhost:8080,http://localhost:5173,http://localhost:3000
```

### Production Setup
For production, you'll need to add your production URL:
```
http://localhost:8080,https://yourdomain.com
```

## Verify It's Working

After updating Auth0:
1. Clear your browser cache
2. Try logging in again
3. You should be redirected back to `http://localhost:8080` after authentication

