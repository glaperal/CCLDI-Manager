# Complete Deployment Guide

## 🎯 Deployment Overview

This guide covers deploying your CCLDI Student Management System to production using **free cloud services**.

**Stack:**
- Frontend: GitHub Pages (Static hosting)
- Backend: Railway.app (Node.js hosting)
- Database: Railway PostgreSQL (Managed database)

**Total Cost**: $0/month (Free tier)

---

## 📦 Part 1: Deploy Backend to Railway

### Step 1: Create Railway Account

1. Go to [Railway.app](https://railway.app/)
2. Click "Start a New Project"
3. Sign up with GitHub account
4. Authorize Railway to access your repositories

### Step 2: Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `CCLDI-Manager` repository
4. Select the repository

### Step 3: Configure Build Settings

Railway will auto-detect Node.js. Configure these settings:

**Root Directory**: `backend`

**Build Command**:
```bash
npm install
```

**Start Command**:
```bash
npm start
```

### Step 4: Add PostgreSQL Database

1. In your Railway project, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Railway will provision a PostgreSQL instance
4. Database URL will be automatically added to environment variables

### Step 5: Set Environment Variables

In Railway project settings → Variables, add:

```env
NODE_ENV=production
FRONTEND_URL=https://glaperal.github.io/CCLDI-Manager
PORT=3000
```

**Note**: `DATABASE_URL` is automatically set by Railway.

### Step 6: Initialize Database

After deployment, run the database initialization:

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login:
```bash
railway login
```

3. Link to your project:
```bash
cd CCLDI-Student-Management-System/backend
railway link
```

4. Run database initialization:
```bash
railway run npm run init-db
```

This creates all tables and seeds initial data.

### Step 7: Get Your Backend URL

1. Go to Railway project → Settings
2. Click "Generate Domain"
3. Your backend URL will be something like:
   `https://ccldi-backend-production.up.railway.app`

4. **Copy this URL** - you'll need it for frontend integration

### Step 8: Test Your Backend

Visit: `https://your-backend-url.railway.app/health`

You should see:
```json
{
  "status": "healthy",
  "timestamp": "2024-02-14T...",
  "service": "CCLDI Backend API"
}
```

---

## 🌐 Part 2: Update and Deploy Frontend

### Step 1: Update Frontend API URL

In `index.html`, update the API configuration:

```javascript
// Change from:
const API_BASE_URL = 'http://localhost:3000/api';

// To your Railway URL:
const API_BASE_URL = 'https://your-backend-url.railway.app/api';
```

### Step 2: Commit and Push Changes

```bash
cd C:\Users\ADMIN\CCLDI-Student-Management-System
git add index.html
git commit -m "Update API URL for production deployment"
git push origin main
```

### Step 3: Frontend is Already Live!

Your frontend is already deployed at:
**https://glaperal.github.io/CCLDI-Manager/**

GitHub Pages automatically updates when you push to main branch.

---

## ✅ Verification Checklist

Test your production deployment:

- [ ] Backend health check works
- [ ] Frontend loads without errors
- [ ] Dashboard displays data
- [ ] Can create new student
- [ ] Can edit student
- [ ] Can delete student
- [ ] Can record payment
- [ ] Aging report displays correctly
- [ ] Settings can be updated

---

## 🔧 Alternative Deployment Options

### Option 2: Render.com (Alternative to Railway)

**Backend:**
1. Go to [Render.com](https://render.com/)
2. New → Web Service
3. Connect GitHub repository
4. Configure:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: `backend`

**Database:**
1. New → PostgreSQL
2. Copy DATABASE_URL
3. Add to web service environment variables

**Cost**: Free tier (spins down after 15 min of inactivity)

### Option 3: Vercel (Frontend) + Supabase (Database)

**Frontend on Vercel:**
```bash
npm install -g vercel
cd C:\Users\ADMIN\CCLDI-Student-Management-System
vercel
```

**Database on Supabase:**
1. Create project at [Supabase.com](https://supabase.com/)
2. Get connection string from Settings
3. Run schema.sql in SQL Editor

**Cost**: Free tier for both

---

## 🚀 Advanced: Custom Domain

### Add Custom Domain to Railway

1. Purchase domain from Namecheap/GoDaddy ($10/year)
2. In Railway → Settings → Custom Domain
3. Add your domain: `api.yourdomain.com`
4. Update DNS records at your registrar:
   - Type: CNAME
   - Name: api
   - Value: [Railway provides this]

### Add Custom Domain to GitHub Pages

1. In repository Settings → Pages
2. Add custom domain: `app.yourdomain.com`
3. Update DNS:
   - Type: CNAME
   - Name: app
   - Value: glaperal.github.io

---

## 📊 Monitoring and Logs

### Railway Logs

View real-time logs:
```bash
railway logs
```

Or in Railway dashboard → Deployments → View Logs

### Error Monitoring

Add free error tracking:

1. Sign up for [Sentry.io](https://sentry.io/)
2. Add to backend:
```bash
npm install @sentry/node
```

3. Configure in server.js:
```javascript
const Sentry = require("@sentry/node");
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

---

## 🔒 Security for Production

### 1. Add Rate Limiting

Install:
```bash
npm install express-rate-limit
```

Add to server.js:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 2. Add Authentication (Future)

For production, implement JWT authentication:
```bash
npm install jsonwebtoken bcrypt
```

Create auth middleware to protect routes.

### 3. Enable HTTPS Only

Railway automatically provides HTTPS.

For custom servers, use Let's Encrypt SSL certificate.

---

## 💰 Cost Breakdown

### Free Tier (Current Setup)

| Service | Cost | Limits |
|---------|------|--------|
| Railway Backend | $0 | 500 hours/month, 512MB RAM |
| Railway PostgreSQL | $0 | 1GB storage |
| GitHub Pages | $0 | 100GB bandwidth/month |
| **Total** | **$0/month** | Good for ~1000 students |

### Paid Tier (For Scale)

| Service | Cost | Limits |
|---------|------|--------|
| Railway Pro | $5/month | Unlimited hours, 8GB RAM |
| Railway PostgreSQL | $5/month | 10GB storage |
| Custom Domain | $10/year | Your branding |
| **Total** | **~$11/month** | Good for 10,000+ students |

---

## 📈 Scaling Checklist

When you outgrow free tier:

- [ ] Upgrade Railway to Pro plan ($5/mo)
- [ ] Add database backups (automatic on Pro)
- [ ] Enable database connection pooling
- [ ] Add Redis for caching (Railway add-on)
- [ ] Implement CDN for static assets
- [ ] Add monitoring and alerting
- [ ] Consider multi-region deployment

---

## 🐛 Deployment Troubleshooting

### Backend Not Starting

**Check Logs:**
```bash
railway logs
```

**Common Issues:**
- Missing environment variables
- Wrong start command
- Database connection failed

### Frontend Can't Connect to Backend

**Check:**
- API_BASE_URL is correct in index.html
- CORS settings in backend allow your frontend URL
- Backend is actually running (check Railway dashboard)

### Database Errors

**Check:**
- DATABASE_URL is set correctly
- Database initialization ran successfully
- Tables exist: `railway run npm run init-db`

---

## 📞 Support Resources

- **Railway Docs**: https://docs.railway.app/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **GitHub Pages**: https://docs.github.com/pages
- **Your Backend API**: https://your-url.railway.app/health

---

## 🎉 Success!

Your CCLDI Student Management System is now live and accessible worldwide!

**Frontend**: https://glaperal.github.io/CCLDI-Manager/
**Backend**: https://your-backend-url.railway.app/

Share these URLs with your team and start managing your 16 centers efficiently!
