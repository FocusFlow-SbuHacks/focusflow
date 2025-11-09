# Auth0 Configuration for FocusFlow

## Required Auth0 Dashboard Settings

### Application Type
- **Application Type**: Single Page Application

### URLs Configuration

#### Allowed Callback URLs
```
http://localhost:8080
```

#### Allowed Logout URLs
```
http://localhost:8080
```

#### Allowed Web Origins
```
http://localhost:8080
```

#### Allowed Origins (CORS)
```
http://localhost:8080
```

## Frontend Environment Variables

Create or update `frontend/.env`:

```env
VITE_AUTH0_DOMAIN=dev-dpqkca4rwoqa3qlp.us.auth0.com
VITE_AUTH0_CLIENT_ID=HJJiMaA5REw1kBVzH0T1FfEY5AUnnMxA
VITE_AUTH0_REDIRECT_URI=http://localhost:8080
```

## Step-by-Step Auth0 Dashboard Configuration

1. **Log in to Auth0 Dashboard**
   - Go to https://manage.auth0.com/
   - Sign in with your Auth0 account

2. **Navigate to Applications**
   - Click "Applications" in the left sidebar
   - Find your application (or create a new one)

3. **Application Settings**
   - Click on your application name
   - Scroll to "Application URIs" section

4. **Update URLs** (one per line or comma-separated):
   - **Allowed Callback URLs**: `http://localhost:8080`
   - **Allowed Logout URLs**: `http://localhost:8080`
   - **Allowed Web Origins**: `http://localhost:8080`

5. **Save Changes**
   - Scroll to bottom
   - Click "Save Changes"

6. **Verify Application Type**
   - Make sure "Application Type" is set to "Single Page Application"

## Testing

After configuration:
1. Restart your frontend: `npm run dev` in the frontend folder
2. Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
3. Try logging in at `http://localhost:8080/login`

## Troubleshooting

### "Callback URL mismatch" Error
- Double-check that `http://localhost:8080` is in Allowed Callback URLs
- Make sure there's no trailing slash
- Clear browser cache and try again

### Still Not Working?
1. Check browser console for the exact redirect URI being used
2. Verify `VITE_AUTH0_REDIRECT_URI` in your `.env` file
3. Make sure you saved changes in Auth0 dashboard
4. Wait a few seconds for Auth0 to propagate changes

