# Google Login Setup with Auth0

This guide will help you set up Google OAuth login through Auth0.

## Part 1: Get Google OAuth Credentials

### Step 1: Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account

### Step 2: Create a New Project (or Select Existing)
1. Click the project dropdown at the top
2. Click "New Project"
3. Enter project name: `FocusFlow` (or any name)
4. Click "Create"
5. Wait for project creation, then select it

### Step 3: Enable Google+ API
1. In the left sidebar, go to **APIs & Services** → **Library**
2. Search for "Google+ API" or "Google Identity"
3. Click on it and click **Enable**

### Step 4: Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** at the top
3. Select **OAuth client ID**

### Step 5: Configure OAuth Consent Screen (First Time Only)
If this is your first time, you'll need to configure the consent screen:

1. Click **CONFIGURE CONSENT SCREEN**
2. Choose **External** (unless you have a Google Workspace account)
3. Click **Create**
4. Fill in the required fields:
   - **App name**: `FocusFlow`
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click **Save and Continue**
6. **Scopes** (optional): Click **Save and Continue**
7. **Test users** (optional): Click **Save and Continue**
8. Click **Back to Dashboard**

### Step 6: Create OAuth Client ID
1. Go back to **Credentials** → **+ CREATE CREDENTIALS** → **OAuth client ID**
2. **Application type**: Select **Web application**
3. **Name**: `FocusFlow Web Client`
4. **Authorized JavaScript origins**:
   ```
   https://dev-dpqkca4rwoqa3qlp.us.auth0.com
   ```
   (This is your Auth0 domain)
5. **Authorized redirect URIs**:
   ```
   https://dev-dpqkca4rwoqa3qlp.us.auth0.com/login/callback
   ```
   (Replace with your Auth0 domain if different)
6. Click **Create**

### Step 7: Copy Your Credentials
After creation, you'll see a popup with:
- **Your Client ID** (looks like: `123456789-abc.apps.googleusercontent.com`)
- **Your Client Secret** (looks like: `GOCSPX-xxxxxxxxxxxxx`)

**IMPORTANT**: Copy both of these immediately! You won't be able to see the secret again.

## Part 2: Add Google to Auth0

### Step 1: Go to Auth0 Dashboard
1. Visit [Auth0 Dashboard](https://manage.auth0.com/)
2. Sign in to your account

### Step 2: Navigate to Social Connections
1. In the left sidebar, click **Authentication**
2. Click **Social** (under Connections)

### Step 3: Add Google Connection
1. Find **Google** in the list of social connections
2. Click on it (or click the toggle to enable it)

### Step 4: Enter Google Credentials
1. **Client ID**: Paste your Google Client ID
2. **Client Secret**: Paste your Google Client Secret
3. **Scopes** (optional): Leave default or add:
   ```
   email profile openid
   ```

### Step 5: Configure Connection Settings
1. **Connection Name**: `google-oauth2` (or keep default)
2. **Display Name**: `Google` (or customize)
3. **Icon URL**: (optional, leave default)
4. Make sure **Enabled** is toggled ON

### Step 6: Application Settings
1. Scroll down to **Applications** section
2. Make sure your FocusFlow application is **enabled** (toggle ON)
3. This allows your app to use Google login

### Step 7: Save Changes
1. Click **Save** at the bottom
2. Wait for confirmation

## Part 3: Test Google Login

### Step 1: Verify Frontend Code
Your frontend already has Google login configured in `Login.tsx`:
```typescript
const handleGoogleLogin = () => {
  loginWithRedirect({
    authorizationParams: {
      connection: "google-oauth2",
    },
  });
};
```

### Step 2: Test the Login
1. Start your frontend: `npm run dev` in the frontend folder
2. Go to `http://localhost:8080/login`
3. Click "Login with Google"
4. You should see Google's login screen
5. After logging in, you'll be redirected back to your app

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Make sure the redirect URI in Google Cloud Console is exactly:
  ```
  https://dev-dpqkca4rwoqa3qlp.us.auth0.com/login/callback
  ```
- Replace `dev-dpqkca4rwoqa3qlp.us.auth0.com` with your actual Auth0 domain

### "Invalid Client ID"
- Double-check that you copied the Client ID correctly
- Make sure there are no extra spaces
- Verify it's the Web application client ID (not iOS/Android)

### "Invalid Client Secret"
- You can't view the secret again after creation
- If lost, create a new OAuth client ID in Google Cloud Console
- Update the new credentials in Auth0

### Google Login Not Appearing
- Check that the Google connection is enabled in Auth0
- Verify your application is enabled for the Google connection
- Clear browser cache and try again

### "Access Blocked"
- If you see "This app isn't verified", it's normal for development
- Click "Advanced" → "Go to FocusFlow (unsafe)" to proceed
- For production, you'll need to verify your app with Google

## Production Considerations

### For Production:
1. **Verify Your App** with Google (required for public use)
2. **Add Production URLs** to authorized redirect URIs:
   ```
   https://dev-dpqkca4rwoqa3qlp.us.auth0.com/login/callback
   https://yourdomain.com
   ```
3. **Update OAuth Consent Screen** with:
   - App logo
   - Privacy policy URL
   - Terms of service URL
   - App domain verification

## Quick Reference

### Google Cloud Console
- URL: https://console.cloud.google.com/
- Credentials: APIs & Services → Credentials
- OAuth Consent: APIs & Services → OAuth consent screen

### Auth0 Dashboard
- URL: https://manage.auth0.com/
- Social Connections: Authentication → Social
- Your Domain: Check in Applications → Settings

### Your Auth0 Domain
Your Auth0 domain is: `dev-dpqkca4rwoqa3qlp.us.auth0.com`

Use this in:
- Google Cloud Console redirect URIs
- Authorized JavaScript origins

