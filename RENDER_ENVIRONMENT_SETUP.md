# Render Environment Variables Setup Guide

## 🚨 Critical: Environment Variables Required for Production

The AgreeProof backend requires the following environment variables to be set in Render:

### Required Environment Variables

1. **MONGODB_URI** - MongoDB Atlas connection string
   ```
   mongodb+srv://demo:demo123@cluster0.mongodb.net/agreeproof?retryWrites=true&w=majority
   ```

2. **FRONTEND_URL** - Netlify frontend URL
   ```
   https://agreeproof.netlify.app
   ```

3. **NODE_ENV** - Environment mode
   ```
   production
   ```

4. **PORT** - Server port (Render sets this automatically)
   ```
   5000
   ```

## 🔧 How to Set Environment Variables in Render

### Step 1: Go to Render Dashboard
1. Navigate to [Render Dashboard](https://dashboard.render.com/)
2. Select your `agreeproof` service

### Step 2: Add Environment Variables
1. Click on "Environment" tab
2. Add the following environment variables:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://demo:demo123@cluster0.mongodb.net/agreeproof?retryWrites=true&w=majority` |
| `FRONTEND_URL` | `https://agreeproof.netlify.app` |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |

### Step 3: Redeploy
1. Click "Manual Deploy" → "Deploy Latest Commit"
2. Wait for deployment to complete

## 🔍 Verification

After setting environment variables, test the API:

```bash
# Health check
curl https://agreeproof.onrender.com/health

# Create agreement test
curl -X POST https://agreeproof.onrender.com/api/agreements/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Agreement",
    "content": "This is a test agreement",
    "partyA": {"name": "Test User", "email": "test@example.com"},
    "partyB": {"name": "Test User 2", "email": "test2@example.com"}
  }'
```

## 🐛 Troubleshooting

### If API returns "Internal server error":
1. Check Render logs for MongoDB connection errors
2. Verify MONGODB_URI is correct and accessible
3. Ensure MongoDB Atlas allows connections from Render's IP

### If CORS errors persist:
1. Verify FRONTEND_URL matches exactly: `https://agreeproof.netlify.app`
2. Check that the backend code includes both Netlify and Vercel domains in CORS config

### Current CORS Configuration:
```javascript
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://agreeproof.netlify.app',
    'https://agreeproof.vercel.app'
  ],
  credentials: true
}));
```

## 📋 Current Status

- ✅ Backend code deployed to Render
- ✅ CORS configuration updated
- ⏳ Environment variables need to be set in Render dashboard
- ⏳ MongoDB connection needs to be verified

## 🎯 Next Steps

1. Set environment variables in Render dashboard
2. Trigger manual redeploy
3. Test API endpoints
4. Verify frontend-backend communication
5. Test complete user workflow