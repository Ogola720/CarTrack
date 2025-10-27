# Japan-Africa Car Arbitrage System

A comprehensive system that identifies used cars in Japan with high resale profit potential in Africa by comparing Japanese car listings with African resale values.

## Features

- Web scraping of Japanese car auction sites
- Integration with classic.com for resale value data
- Profitability ranking algorithm
- Daily automated data updates
- Admin dashboard for monitoring
- Web-based filtering and search interface

## Tech Stack

- Backend: Node.js with Express
- Database: MongoDB
- Scraping: Puppeteer + Cheerio
- Frontend: React
- Scheduling: node-cron
- Monitoring: Custom dashboard

## Quick Start

```bash
npm install
npm run setup
npm run dev
```

## 🚀 Deployment

### Quick Deploy
```bash
# Windows
deploy.bat

# Linux/Mac
chmod +x deploy.sh
./deploy.sh
```

### Manual Deployment Options

1. **Heroku** (Easiest - Free tier available)
2. **Vercel + Railway** (Modern & fast)
3. **DigitalOcean/AWS** (Full control)
4. **Docker** (Containerized)

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## Project Structure

```
├── backend/           # API server and scraping logic
├── frontend/          # React web interface
├── scraper/          # Web scraping modules
├── database/         # Database schemas and migrations
├── scheduler/        # Automated update jobs
└── docs/            # Documentation
```