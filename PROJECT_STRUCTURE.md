# 📁 Project Structure

## Overview
```
japan-africa-car-arbitrage/
├── 📁 backend/              # Express.js API server
│   ├── 📁 models/           # Database models
│   ├── 📁 routes/           # API routes
│   ├── package.json         # Backend dependencies
│   └── server.js           # Main server file
├── 📁 frontend/             # React web application
│   ├── 📁 public/          # Static assets
│   ├── 📁 src/             # React source code
│   │   ├── 📁 components/   # Reusable components
│   │   ├── 📁 pages/       # Page components
│   │   ├── App.js          # Main App component
│   │   └── index.js        # Entry point
│   └── package.json        # Frontend dependencies
├── 📁 scraper/             # Web scraping modules
│   ├── japanScraper.js     # Japanese car sites scraper
│   ├── classicScraper.js   # Resale value scraper
│   ├── profitCalculator.js # Profitability calculations
│   ├── mockDataScraper.js  # Mock data generator
│   └── index.js           # Main scraper orchestrator
├── 📁 scheduler/           # Automated job scheduler
│   └── index.js           # Cron job scheduler
├── 📁 docs/               # Documentation
│   └── setup.md          # Setup instructions
├── 📁 .github/           # GitHub Actions
│   └── workflows/        # CI/CD workflows
├── 📁 data/              # Runtime data storage
│   └── cars.json         # File storage (when MongoDB unavailable)
├── 🔧 Configuration Files
│   ├── .env.example       # Environment variables template
│   ├── .gitignore        # Git ignore rules
│   ├── .sevallaignore    # Sevalla deployment ignore
│   ├── sevalla.yml       # Sevalla configuration
│   ├── Dockerfile        # Container configuration
│   └── package.json      # Root dependencies
├── 📖 Documentation
│   ├── README.md         # Main project documentation
│   ├── SEVALLA_DEPLOY.md # Sevalla deployment guide
│   └── PROJECT_STRUCTURE.md # This file
└── 🚀 Deployment Scripts
    ├── deploy-sevalla.sh  # Linux/Mac deployment
    └── deploy-sevalla.bat # Windows deployment
```

## Key Components

### 🖥️ Backend (`/backend`)
- **Express.js** server with REST API
- **MongoDB** integration with Mongoose
- **File storage** fallback system
- **Rate limiting** and security middleware
- **Health checks** and monitoring endpoints

### 🌐 Frontend (`/frontend`)
- **React** single-page application
- **Material-UI** component library
- **React Query** for data fetching
- **React Router** for navigation
- **Recharts** for data visualization

### 🕷️ Scraper (`/scraper`)
- **Puppeteer** for web scraping
- **Axios** for API requests
- **Mock data** generation for testing
- **Profit calculation** algorithms
- **Error handling** and retry logic

### ⏰ Scheduler (`/scheduler`)
- **Node-cron** for scheduled tasks
- **Daily scraping** automation
- **Data updates** and cleanup
- **Exchange rate** updates
- **Health monitoring**

## Data Flow

```
1. 🕷️ Scraper → Japanese car sites
2. 📊 Profit Calculator → Analyze opportunities
3. 💾 Database → Store processed data
4. 🌐 API → Serve data to frontend
5. 📱 Frontend → Display to users
6. ⏰ Scheduler → Automate updates
```

## Environment Configuration

### Development
```bash
NODE_ENV=development
USE_MOCK_DATA=true
MONGODB_URI=mongodb://localhost:27017/car-arbitrage
PORT=8080
```

### Production (Sevalla)
```bash
NODE_ENV=production
USE_MOCK_DATA=false
MONGODB_URI=[Sevalla MongoDB URI]
PORT=8080
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
```

## File Storage vs MongoDB

The system intelligently chooses storage:
- **MongoDB**: Production environment
- **File Storage**: Development/testing or when MongoDB unavailable
- **Automatic fallback**: Seamless switching between storage types

## Deployment Architecture

### Sevalla Platform
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub Repo   │───▶│  Sevalla Build  │───▶│   Live App      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │  MongoDB Atlas  │
                       └─────────────────┘
```

### Auto-scaling
- **Min instances**: 1
- **Max instances**: 3
- **CPU threshold**: 80%
- **Memory threshold**: 80%

## Security Features

- ✅ **Rate limiting** (100 requests/15min)
- ✅ **Helmet.js** security headers
- ✅ **CORS** configuration
- ✅ **Environment variables** for secrets
- ✅ **Input validation** and sanitization
- ✅ **Error handling** without data leaks

## Monitoring & Health

### Health Endpoints
- `GET /health` - Basic health check
- `GET /api/admin/health` - Detailed system health
- `GET /api/scraping/status` - Scraping status

### Metrics Tracked
- 📊 **Performance**: Response times, throughput
- 🔧 **Resources**: CPU, memory usage
- 📝 **Logs**: Application and error logs
- 🚨 **Alerts**: Automated failure notifications

## Development Workflow

1. **Local Development**
   ```bash
   npm run setup    # Install dependencies
   npm run dev      # Start development servers
   npm run scrape   # Test scraping (mock data)
   ```

2. **Testing**
   ```bash
   npm run build    # Build frontend
   npm start        # Test production build
   ```

3. **Deployment**
   ```bash
   git push origin main  # Triggers auto-deploy
   ```

## Scaling Considerations

### Current Capacity
- **Free tier**: 1 instance, 512MB RAM
- **Expected load**: 100-1000 users
- **Data growth**: ~1000 cars/day

### Scaling Options
- **Vertical**: Upgrade instance size
- **Horizontal**: Add more instances
- **Database**: Upgrade MongoDB plan
- **CDN**: Add content delivery network

## Future Enhancements

### Planned Features
- 🔍 **Advanced filtering** and search
- 📧 **Email notifications** for profitable cars
- 📊 **Analytics dashboard** with trends
- 🌍 **Multi-region** car sources
- 🤖 **AI-powered** profit predictions

### Technical Improvements
- 🧪 **Unit tests** and integration tests
- 📦 **Microservices** architecture
- 🔄 **Real-time updates** with WebSockets
- 🗄️ **Data warehouse** for analytics
- 🔐 **User authentication** and roles