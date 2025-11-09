# MongoDB Atlas Setup Guide

## Step-by-Step Instructions

### 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account (M0 Free Tier)

### 2. Create a Cluster
1. After logging in, click "Build a Database"
2. Choose "M0 FREE" tier
3. Select your preferred cloud provider and region
4. Click "Create" (takes 3-5 minutes)

### 3. Create Database User
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter a username and generate a secure password
5. **Save the password** - you'll need it for the connection string
6. Set user privileges to "Atlas admin" (or "Read and write to any database")
7. Click "Add User"

### 4. Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development, click "Allow Access from Anywhere" (adds `0.0.0.0/0`)
   - **Note:** For production, use specific IP addresses
4. Click "Confirm"

### 5. Get Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" as the driver
5. Copy the connection string

### 6. Format Connection String
Your connection string will look like:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

Replace:
- `<username>` with your database username
- `<password>` with your database user password
- Add database name: `/<database>` before the `?`

**Final format:**
```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/focusflow?retryWrites=true&w=majority
```

### 7. Add to Backend .env
Create or edit `backend/.env`:
```env
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/focusflow?retryWrites=true&w=majority
```

### 8. Test Connection
Start your backend server:
```bash
cd backend
npm run dev
```

You should see: `MongoDB connected successfully` and `Connected to: MongoDB Atlas`

## Troubleshooting

### Connection Timeout
- Check that your IP is whitelisted in Network Access
- Verify the connection string is correct
- Ensure the cluster is not paused

### Authentication Failed
- Double-check username and password
- Ensure special characters in password are URL-encoded
- Verify database user has proper permissions

### SSL/TLS Errors
- MongoDB Atlas requires SSL connections
- Make sure your connection string uses `mongodb+srv://` (not `mongodb://`)
- Node.js should handle SSL automatically with `mongodb+srv://`

### Database Not Found
- The database will be created automatically on first connection
- Or create it manually in MongoDB Atlas dashboard

## Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use environment-specific users** - Different users for dev/prod
3. **Restrict IP access** - Use specific IPs in production
4. **Rotate passwords regularly**
5. **Use MongoDB Atlas VPC Peering** for production (if applicable)

