# 🚀 Complete Deployment Guide

## 📋 Pre-Deployment Checklist

- [ ] Code is tested and working locally
- [ ] Environment variables are configured
- [ ] Database is set up (MongoDB or file storage)
- [ ] GitHub repository is created
- [ ] Deployment platform is chosen

## 🔧 Step 1: Push to GitHub

### Initialize Git Repository
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: Japan-Africa Car Arbitrage System"

# Add remote repository
git remote add origin https://github.com/yourusername/japan-africa-car-arbitrage.git

# Push to GitHub
git push -u origin main
```

### Create GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Click "New Repository"
3. Name: `japan-africa-car-arbitrage`
4. Description: "System for identifying profitable used car arbitrage opportunities between Japan and Africa"
5. Make it Public or Private
6. Don't initialize with README (we already have one)
7. Click "Create Repository"

## 🌐 Step 2: Choose Deployment Platform

### Option A: Heroku (Easiest - Free Tier Available)

#### Backend Deployment
```bash
# Install Heroku CLI
# Windows: Download from heroku.com
# Mac: brew install heroku/brew/heroku
# Linux: curl https://cli-assets.heroku.com/install.sh | sh

# Login to Heroku
heroku login

# Create backend app
heroku create your-app-name-backend

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set USE_MOCK_DATA=false

# Deploy backend
git subtree push --prefix backend heroku main
```

#### Frontend Deployment
```bash
# Create frontend app
heroku create your-app-name-frontend

# Add buildpack for React
heroku buildpacks:set mars/create-react-app

# Set API URL
heroku config:set REACT_APP_API_URL=https://your-app-name-backend.herokuapp.com

# Deploy frontend
git subtree push --prefix frontend heroku main
```

### Option B: Vercel + Railway (Modern & Fast)

#### Deploy Backend on Railway
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Choose "backend" folder
6. Add MongoDB database service
7. Set environment variables:
   - `NODE_ENV=production`
   - `USE_MOCK_DATA=false`
8. Deploy automatically

#### Deploy Frontend on Vercel
1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Set root directory to "frontend"
6. Add environment variable:
   - `REACT_APP_API_URL=https://your-railway-backend-url`
7. Deploy

### Option C: DigitalOcean Droplet (Full Control)

#### Create Droplet
1. Sign up at [DigitalOcean.com](https://digitalocean.com)
2. Create new Droplet (Ubuntu 22.04, $5/month)
3. Add SSH key for secure access

#### Server Setup
```bash
# Connect to server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt-get update
apt-get install -y mongodb-org

# Start MongoDB
systemctl start mongod
systemctl enable mongod

# Install PM2 for process management
npm install -g pm2

# Install Nginx
apt install nginx -y
```

#### Deploy Application
```bash
# Clone repository
git clone https://github.com/yourusername/japan-africa-car-arbitrage.git
cd japan-africa-car-arbitrage

# Install dependencies
npm run setup

# Create production environment file
cat > .env << EOF
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/car-arbitrage
PORT=5000
USE_MOCK_DATA=false
EOF

# Build frontend
cd frontend && npm run build && cd ..

# Start backend with PM2
pm2 start backend/server.js --name "car-arbitrage-api"

# Start scheduler with PM2
pm2 start scheduler/index.js --name "car-arbitrage-scheduler"

# Save PM2 configuration
pm2 startup
pm2 save
```

#### Configure Nginx
```bash
# Create Nginx configuration
cat > /etc/nginx/sites-available/car-arbitrage << EOF
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /root/japan-africa-car-arbitrage/frontend/build;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/car-arbitrage /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Test and restart Nginx
nginx -t
systemctl restart nginx
```

### Option D: Docker Deployment

#### Local Docker Setup
```bash
# Build and run with Docker Compose
cd deployment
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Production Docker (AWS/GCP/Azure)
```bash
# Build images
docker build -t car-arbitrage-backend -f deployment/Dockerfile.backend .
docker build -t car-arbitrage-frontend -f deployment/Dockerfile.frontend frontend/

# Tag for registry
docker tag car-arbitrage-backend your-registry/car-arbitrage-backend:latest
docker tag car-arbitrage-frontend your-registry/car-arbitrage-frontend:latest

# Push to registry
docker push your-registry/car-arbitrage-backend:latest
docker push your-registry/car-arbitrage-frontend:latest

# Deploy to cloud platform
# (Follow platform-specific instructions)
```

## 🔒 Step 3: Configure Domain & SSL

### Domain Setup
1. Purchase domain from Namecheap, GoDaddy, etc.
2. Point DNS to your server IP
3. Wait for DNS propagation (up to 24 hours)

### SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d your-domain.com

# Auto-renewal
crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Step 4: Monitoring & Maintenance

### Set Up Monitoring
```bash
# Install monitoring tools
npm install -g pm2-logrotate
pm2 install pm2-server-monit

# View monitoring dashboard
pm2 monit
```

### Backup Strategy
```bash
# Create backup script
cat > /root/backup.sh << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
mongodump --db car-arbitrage --out /backup/mongo_\$DATE
tar -czf /backup/app_\$DATE.tar.gz /root/japan-africa-car-arbitrage/data
find /backup -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x /root/backup.sh

# Schedule daily backups
crontab -e
# Add: 0 2 * * * /root/backup.sh
```

## 🚀 Step 5: Go Live!

### Final Checklist
- [ ] Application is accessible via domain
- [ ] SSL certificate is working
- [ ] Database is connected and populated
- [ ] Scraping is working (check admin panel)
- [ ] Monitoring is set up
- [ ] Backups are configured

### Test Your Deployment
1. Visit your domain
2. Check dashboard loads
3. Test car listings page
4. Verify admin panel works
5. Run a manual scrape
6. Check API endpoints

## 🔧 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Find process using port
netstat -tulpn | grep :5000
# Kill process
kill -9 <PID>
```

**MongoDB Connection Issues**
```bash
# Check MongoDB status
systemctl status mongod
# Restart MongoDB
systemctl restart mongod
```

**Nginx Issues**
```bash
# Check Nginx status
systemctl status nginx
# Test configuration
nginx -t
# Check logs
tail -f /var/log/nginx/error.log
```

**PM2 Issues**
```bash
# Check PM2 status
pm2 status
# Restart all processes
pm2 restart all
# View logs
pm2 logs
```

## 📞 Support

If you encounter issues:
1. Check the logs first
2. Review the troubleshooting section
3. Search GitHub issues
4. Create a new issue with detailed error information

## 🎉 Congratulations!

Your Japan-Africa Car Arbitrage System is now live and helping identify profitable opportunities! 🚗💰