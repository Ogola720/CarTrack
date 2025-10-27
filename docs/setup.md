# Setup Guide

## Prerequisites

- Node.js 16+ and npm
- MongoDB 4.4+
- Git

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd japan-africa-car-arbitrage
   ```

2. **Install dependencies**
   ```bash
   npm run setup
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Run the application**
   ```bash
   # Development mode (both frontend and backend)
   npm run dev
   
   # Or run separately
   npm run server  # Backend only
   npm run client  # Frontend only
   ```

## Configuration

### Database Setup

The application will automatically create the necessary collections and indexes on first run.

### Scraping Configuration

Edit the scraper configuration in `scraper/` files:

- `japanScraper.js` - Configure Japanese car sources
- `classicScraper.js` - Configure resale value sources
- `profitCalculator.js` - Adjust cost parameters

### Scheduling

To run automated scraping:

```bash
npm run scheduler
```

This will start:
- Daily full scrape at 2 AM JST
- Hourly data updates every 4 hours
- Exchange rate updates every hour
- Weekly database cleanup

## API Endpoints

### Cars
- `GET /api/cars` - List cars with filtering
- `GET /api/cars/top-profitable` - Top profitable cars
- `GET /api/cars/stats/overview` - Statistics

### Scraping
- `POST /api/scraping/trigger-full-scrape` - Manual full scrape
- `POST /api/scraping/trigger-updates` - Manual updates
- `GET /api/scraping/status` - Scraping status

### Admin
- `GET /api/admin/dashboard` - Dashboard data
- `GET /api/admin/health` - System health check
- `GET /api/admin/config` - System configuration

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env

2. **Scraping Failures**
   - Check internet connection
   - Verify target websites are accessible
   - Review rate limiting settings

3. **Missing Data**
   - Run manual scrape: `npm run scrape`
   - Check scraping logs in admin panel

### Performance Optimization

1. **Database Indexes**
   - Indexes are created automatically
   - Monitor query performance in admin panel

2. **Scraping Rate Limits**
   - Adjust delays in scraper configuration
   - Use proxy rotation if needed

3. **Memory Usage**
   - Monitor with admin dashboard
   - Adjust batch sizes for large datasets

## Deployment

### Production Setup

1. **Environment Variables**
   ```bash
   NODE_ENV=production
   MONGODB_URI=mongodb://your-production-db
   ```

2. **Build Frontend**
   ```bash
   cd frontend && npm run build
   ```

3. **Process Management**
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start backend/server.js --name car-arbitrage-api
   pm2 start scheduler/index.js --name car-arbitrage-scheduler
   ```

4. **Reverse Proxy (Nginx)**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location /api {
           proxy_pass http://localhost:5000;
       }
       
       location / {
           root /path/to/frontend/build;
           try_files $uri $uri/ /index.html;
       }
   }
   ```

### Monitoring

- Use admin dashboard for system health
- Set up log monitoring
- Configure alerts for scraping failures
- Monitor database performance

## Maintenance

### Regular Tasks

1. **Database Cleanup**
   - Automated weekly cleanup
   - Manual cleanup via admin panel

2. **Update Exchange Rates**
   - Automated hourly updates
   - Manual update if needed

3. **Monitor Scraping Health**
   - Check admin dashboard daily
   - Review error logs

4. **Update Dependencies**
   ```bash
   npm audit
   npm update
   ```