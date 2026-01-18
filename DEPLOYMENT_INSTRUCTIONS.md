# 🚀 AgreeProof Deployment Instructions

## 📋 Prerequisites

Before you begin, make sure you have:
- GitHub repository: https://github.com/aryanrathore63/agreeproof
- MongoDB Atlas account (free tier)
- Vercel account (free tier)
- Render account (free tier)

## 🗂️ Project Structure

```
agreeproof/
├── agreeproof-backend/     # Node.js API (Deploy to Render)
├── agreeproof-frontend/    # React App (Deploy to Vercel)
├── database/              # MongoDB configuration
├── scripts/               # Deployment scripts
├── .github/               # CI/CD workflows
└── docs/                  # Documentation
```

## 🎯 Deployment Steps

### 1. MongoDB Atlas Setup

1. **Create Cluster**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free M0 cluster
   - Choose a region closest to your users

2. **Configure Network Access**:
   - Add IP address: `0.0.0.0/0` (allows all access for development)
   - For production, add specific Vercel and Render IPs

3. **Create Database User**:
   - Username: `agreeproof-user`
   - Password: Generate a strong password
   - Database User Permissions: Read and write to any database

4. **Get Connection String**:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

### 2. Backend Deployment (Render)

1. **Connect GitHub to Render**:
   - Go to [Render](https://render.com)
   - Sign up with GitHub
   - Click "New +" → "Web Service"

2. **Configure Backend Service**:
   - Repository: `aryanrathore63/agreeproof`
   - Root Directory: `agreeproof-backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://agreeproof-user:<password>@cluster.mongodb.net/agreeproof?retryWrites=true&w=majority
   FRONTEND_URL=https://your-frontend-url.vercel.app
   JWT_SECRET=your-jwt-secret-here
   ```

4. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your backend URL: `https://your-backend.onrender.com`

### 3. Frontend Deployment (Vercel)

1. **Connect GitHub to Vercel**:
   - Go to [Vercel](https://vercel.com)
   - Sign up with GitHub
   - Click "Add New..." → "Project"

2. **Configure Frontend**:
   - Repository: `aryanrathore63/agreeproof`
   - Root Directory: `agreeproof-frontend`
   - Framework Preset: `Create React App`

3. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete
   - Note your frontend URL: `https://your-frontend-url.vercel.app`

### 4. Update Backend CORS

1. Go back to Render dashboard
2. Update `FRONTEND_URL` environment variable with your actual Vercel URL
3. Redeploy the backend

## 🔧 Automated Deployment Setup

### GitHub Actions Configuration

The project includes automated CI/CD workflows that:

1. **Run Tests**: On every pull request
2. **Deploy to Production**: When code is merged to `main` branch
3. **Security Scanning**: Automated vulnerability checks
4. **Performance Testing**: Lighthouse CI for frontend

### Branch Protection Rules

1. Go to your GitHub repository
2. Settings → Branches → Add branch protection rule
3. Branch name pattern: `main`
4. Enable:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging

## 🌐 Production URLs

After deployment, you'll have:

- **Frontend**: `https://agreeproof.vercel.app`
- **Backend API**: `https://agreeproof-backend.onrender.com`
- **API Documentation**: `https://agreeproof-backend.onrender.com/api-docs`

## 🧪 Testing the Deployment

1. **Frontend Test**:
   - Visit your frontend URL
   - Create a test agreement
   - Verify the form works correctly

2. **Backend Test**:
   - Visit `https://your-backend.onrender.com/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

3. **Integration Test**:
   - Create agreement via frontend
   - Copy the share link
   - Open in new tab and confirm agreement

## 📊 Monitoring and Maintenance

### Render Monitoring
- Automatic health checks
- Error logging in dashboard
- Performance metrics

### Vercel Analytics
- Built-in performance monitoring
- User analytics
- Build logs

### MongoDB Atlas Monitoring
- Database performance metrics
- Query optimization suggestions
- Backup management

## 🔒 Security Considerations

1. **Environment Variables**: Never commit secrets to Git
2. **Database Security**: Use strong passwords and IP whitelisting
3. **API Security**: Rate limiting and input validation enabled
4. **HTTPS**: Automatic SSL certificates from Vercel and Render

## 🚀 Scaling Up

When you're ready to scale:

1. **Database**: Upgrade MongoDB Atlas cluster
2. **Backend**: Add more instances on Render
3. **Frontend**: Vercel automatically scales
4. **CDN**: Vercel provides global CDN

## 🆘 Troubleshooting

### Common Issues

1. **Backend Won't Start**:
   - Check environment variables
   - Verify MongoDB connection string
   - Check Render logs

2. **Frontend Can't Connect to Backend**:
   - Verify CORS settings
   - Check API URL environment variable
   - Ensure backend is deployed

3. **Database Connection Failed**:
   - Verify MongoDB credentials
   - Check IP whitelist
   - Ensure cluster is running

### Getting Help

- Check the logs in Render and Vercel dashboards
- Review the [GitHub Issues](https://github.com/aryanrathore63/agreeproof/issues)
- Consult the [Documentation](./README.md)

## 🎉 Success!

Once deployed, your AgreeProof MVP will be:
- ✅ Live on production URLs
- ✅ Automatically deploying on merges
- ✅ Monitored and secured
- ✅ Ready for user testing

Congratulations! You now have a production-ready MVP that can validate your business idea and attract users or investors.