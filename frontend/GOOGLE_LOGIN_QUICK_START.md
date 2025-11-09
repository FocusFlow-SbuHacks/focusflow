# Quick Start: Google Login Setup

## 🚀 Fast Setup (5 Minutes)

### 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/Select a project
3. Go to **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
5. If prompted, configure OAuth consent screen (choose External, fill basic info)
6. Create OAuth client:
   - Type: **Web application**
   - Name: `FocusFlow`
   - **Authorized redirect URIs**: 
     ```
     https://dev-dpqkca4rwoqa3qlp.us.auth0.com/login/callback
     ```
7. **Copy Client ID and Client Secret** (save them!)

### 2. Add to Auth0

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. **Authentication** → **Social** → Click **Google**
3. Paste:
   - **Client ID**: (from step 1)
   - **Client Secret**: (from step 1)
4. Enable your application in the **Applications** section
5. Click **Save**

### 3. Test It!

1. Go to `http://localhost:8080/login`
2. Click "Login with Google"
3. You should see Google's login screen! 🎉

## 📝 Important URLs

**Your Auth0 Domain**: `dev-dpqkca4rwoqa3qlp.us.auth0.com`

**Google Redirect URI** (use in Google Cloud Console):
```
https://dev-dpqkca4rwoqa3qlp.us.auth0.com/login/callback
```

## ❌ Common Issues

**"redirect_uri_mismatch"**
- Make sure the redirect URI in Google Console matches exactly (no trailing slash)

**"Invalid credentials"**
- Double-check you copied Client ID and Secret correctly
- Make sure there are no extra spaces

**Google login button not working**
- Verify Google connection is enabled in Auth0
- Check that your app is enabled for Google connection

For detailed instructions, see `GOOGLE_AUTH_SETUP.md`

