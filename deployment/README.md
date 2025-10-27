# Deployment Guide

## Quick Deploy Options

### Option 1: Docker Compose (Recommended)
```bash
# Clone your repository
git clone https://github.com/yourusername/japan-africa-car-arbitrage.git
cd japan-africa-car-arbitrage

# Deploy with Docker
cd deployment
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

### Option 2: Heroku Deployment

1. **Prepare for Heroku**
```bash
# Install Heroku CLI
# Create Heroku apps
heroku create your-app-name-backend
heroku create your-app-name-frontend

# Add MongoDB Atlas
heroku addons:create mongolab:sandbox -a your-app-name-backend
```

2. **Deploy Backend**
```bash
# Set environment variables
heroku config:set NODE_ENV=production -a your-app-name-backend
heroku config:set USE_MOCK_DATA=false -a your-app-name-backend

# Deploy
git subtree push --prefix backend heroku-backend main
```

3. **Deploy Frontend**
```bash
# Set API URL
heroku config:set REACT_APP_API_URL=https://your-app-name-backend.herokuapp.com -a your-app-name-frontend

# Deploy
git subtree push --prefix frontend heroku-frontend main
```

### Option 3: Vercel + Railway

1. **Deploy Backend on Railway**
   - Connect GitHub repository
   - Select backend folder
   - Add MongoDB database
   - Deploy automatically

2. **Deploy Frontend on Vercel**
   - Connect GitHub repository
   - Select frontend folder
   - Set environment variables
   - Deploy automatically

### Option 4: AWS/DigitalOcean VPS

1. **Server Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

2. **Deploy Application**
```bash
# Clone repository
git clone https://github.com/yourusername/japan-africa-car-arbitrage.git
cd japan-africa-car-arbitrage

# Install dependencies
npm run setup

# Build frontend
cd frontend && npm run build

# Start services with PM2
pm2 start backend/server.js --name "car-arbitrage-api"
pm2 start scheduler/index.js --name "car-arbitrage-scheduler"
pm2 startup
pm2 save
```

3. **Configure Nginx**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/japan-africa-car-arbitrage/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Environment Variables

### Backend (.env)
```
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/car-arbitrage
PORT=5000
USE_MOCK_DATA=false
CLASSIC_COM_API_KEY=your_api_key
EXCHANGE_RATE_API_KEY=your_api_key
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=production
```

## Monitoring & Maintenance

### Health Checks
- Backend: `GET /health`
- Admin Dashboard: `/admin`
- Logs: Check PM2 logs or Docker logs

### Backup Strategy
```bash
# MongoDB backup
mongodump --db car-arbitrage --out /backup/$(date +%Y%m%d)

# File storage backup (if using)
tar -czf backup-$(date +%Y%m%d).tar.gz data/
```

### Updates
```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm run setup

# Restart services
pm2 restart all
# or
docker-compose restart
```