# 🚀 Deploy to Heroku from GitHub

## Method 1: One-Click Deploy (Easiest)

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/yourusername/japan-africa-car-arbitrage)

1. Click the "Deploy to Heroku" button above
2. Fill in your app name
3. Click "Deploy app"
4. Wait for deployment to complete
5. Click "View" to see your app!

## Method 2: Manual Setup via Heroku Dashboard

### Step 1: Create Heroku Account
1. Go to [heroku.com](https://heroku.com)
2. Sign up for free account
3. Verify your email

### Step 2: Create New App
1. Click "New" → "Create new app"
2. App name: `your-app-name` (must be unique)
3. Region: Choose closest to your users
4. Click "Create app"

### Step 3: Connect to GitHub
1. In your Heroku app dashboard, go to "Deploy" tab
2. Under "Deployment method", select "GitHub"
3. Click "Connect to GitHub"
4. Search for your repository: `japan-africa-car-arbitrage`
5. Click "Connect"

### Step 4: Add Database
1. Go to "Resources" tab
2. In "Add-ons" search box, type "mLab MongoDB"
3. Select "mLab MongoDB :: Sandbox (Free)"
4. Click "Submit Order Form"

### Step 5: Configure Environment Variables
1. Go to "Settings" tab
2. Click "Reveal Config Vars"
3. Add these variables:
   ```
   NODE_ENV = production
   USE_MOCK_DATA = false
   PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = true
   ```

### Step 6: Deploy
1. Go back to "Deploy" tab
2. Scroll to "Manual deploy"
3. Select branch: `main`
4. Click "Deploy Branch"
5. Wait for build to complete (5-10 minutes)

### Step 7: Enable Auto-Deploy (Optional)
1. In "Automatic deploys" section
2. Select branch: `main`
3. Click "Enable Automatic Deploys"
4. Now every push to GitHub will auto-deploy!

## Method 3: Heroku CLI (Advanced)

```bash
# Install Heroku CLI first
# Then login
heroku login

# Create app
heroku create your-app-name

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set USE_MOCK_DATA=false
heroku config:set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Connect to GitHub repo
heroku git:remote -a your-app-name

# Deploy
git push heroku main
```

## 🔧 Post-Deployment Setup

### 1. Check Your App
- Visit: `https://your-app-name.herokuapp.com`
- Check: `https://your-app-name.herokuapp.com/health`

### 2. Run Initial Scrape
1. Go to your app URL
2. Navigate to `/admin`
3. Click "Run Full Scrape"
4. Wait for data to populate

### 3. Monitor Logs
```bash
heroku logs --tail -a your-app-name
```

### 4. Scale Workers (Optional)
```bash
# Enable background scraping
heroku ps:scale worker=1 -a your-app-name
```

## 🎯 Custom Domain (Optional)

### Free Custom Domain
1. Go to "Settings" tab in Heroku dashboard
2. Scroll to "Domains"
3. Click "Add domain"
4. Enter your domain: `yourdomain.com`
5. Update your DNS to point to Heroku

### SSL Certificate
- Heroku provides free SSL for all apps
- Your app will be available at `https://your-app-name.herokuapp.com`

## 🔍 Troubleshooting

### Build Fails
- Check logs: `heroku logs -a your-app-name`
- Common issues:
  - Missing dependencies
  - Node version mismatch
  - Build timeout

### App Crashes
- Check logs: `heroku logs --tail -a your-app-name`
- Restart app: `heroku restart -a your-app-name`

### Database Issues
- Check MongoDB addon is active in "Resources" tab
- Verify MONGODB_URI config var is set

### Scraping Issues
- Puppeteer might not work on Heroku free tier
- Set `USE_MOCK_DATA=true` for testing
- Consider upgrading to paid dyno for full scraping

## 💰 Costs

### Free Tier Includes:
- 550-1000 dyno hours/month
- Free MongoDB (500MB)
- Free SSL certificate
- Custom domain support

### Paid Options:
- Basic dyno: $7/month (no sleep)
- Standard dyno: $25/month (better performance)
- MongoDB upgrades available

## 🎉 Success!

Your Japan-Africa Car Arbitrage System is now live on Heroku! 

**Next Steps:**
1. Share your app URL with users
2. Set up monitoring and alerts
3. Configure custom domain
4. Plan for scaling as usage grows

**Your App URLs:**
- Main App: `https://your-app-name.herokuapp.com`
- API Health: `https://your-app-name.herokuapp.com/health`
- Admin Panel: `https://your-app-name.herokuapp.com/admin`