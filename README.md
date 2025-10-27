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

### Deploy to Sevalla (Recommended)

**Quick Deploy via Web Dashboard:**
1. Push code to GitHub
2. Go to [app.sevalla.com](https://app.sevalla.com)
3. Create new project → Connect GitHub repository
4. Configure build settings and deploy

**Automated Deploy:**
```bash
# Windows
deploy-sevalla.bat

# Linux/Mac
chmod +x deploy-sevalla.sh
./deploy-sevalla.sh
```

See [SEVALLA_DEPLOY.md](SEVALLA_DEPLOY.md) for detailed instructions.

## Project Structure

```
├── backend/           # API server and scraping logic
├── frontend/          # React web interface
├── scraper/          # Web scraping modules
├── database/         # Database schemas and migrations
├── scheduler/        # Automated update jobs
└── docs/            # Documentation
```