# 🚀 Deploy to Sevalla

Sevalla is a modern cloud platform that makes deployment simple and scalable. Here's how to deploy your Japan-Africa Car Arbitrage system.

## 📋 Prerequisites

1. **Sevalla Account**: Sign up at [app.sevalla.com](https://app.sevalla.com)
2. **GitHub Repository**: Your code should be pushed to GitHub
3. **Sevalla CLI** (optional): For advanced management

## 🎯 Method 1: Deploy via Sevalla Dashboard (Recommended)

### Step 1: Create New Project

1. **Login to Sevalla**
   - Go to [app.sevalla.com](https://app.sevalla.com)
   - Sign in with your account

2. **Create New Project**
   - Click "New Project"
   - Choose "Web Application"
   - Select "Node.js" as runtime

### Step 2: Connect GitHub Repository

1. **Connect Repository**
   - Select "GitHub" as source
   - Authorize Sevalla to access your repositories
   - Choose your `japan-africa-car-arbitrage` repository
   - Select `main` branch

2. **Configure Build Settings**
   ```
   Build Command: npm install && cd backend && npm install && cd ../frontend && npm install && npm run build
   Start Command: npm start
   Port: 8080
   Node Version: 18.x
   ```

### Step 3: Environment Variables

Add these environment variables in Sevalla dashboard:

```
NODE_ENV=production
USE_MOCK_DATA=false
MONGODB_URI=mongodb://localhost:27017/car-arbitrage
PORT=8080
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### Step 4: Add Database Service

1. **Add MongoDB Service**
   - In your project dashboard, click "Add Service"
   - Select "MongoDB"
   - Choose version "6.0"
   - Set storage to "1GB" (free tier)
   - Note the connection string provided

2. **Update MongoDB URI**
   - Copy the MongoDB connection string from Sevalla
   - Update the `MONGODB_URI` environment variable
   - Format: `mongodb://username:password@host:port/database`

### Step 5: Deploy

1. **Start Deployment**
   - Click "Deploy" button
   - Wait for build process (5-10 minutes)
   - Monitor build logs for any errors

2. **Verify Deployment**
   - Once deployed, you'll get a URL like: `https://your-app.sevalla.app`
   - Test the health endpoint: `https://your-app.sevalla.app/health`
   - Access the admin panel: `https://your-app.sevalla.app/admin`

## 🎯 Method 2: Deploy via Sevalla CLI

### Step 1: Install Sevalla CLI

```bash
# Install via npm
npm install -g @sevalla/cli

# Or download from Sevalla website
```

### Step 2: Login and Initialize

```bash
# Login to Sevalla
sevalla login

# Initialize project
sevalla init

# Follow the prompts to configure your project
```

### Step 3: Deploy

```bash
# Deploy to Sevalla
sevalla deploy

# Monitor deployment
sevalla logs --follow
```

## 🎯 Method 3: Docker Deployment

If you prefer Docker deployment on Sevalla:

### Step 1: Build Docker Image

```bash
# Build the image
docker build -t japan-africa-car-arbitrage .

# Test locally
docker run -p 8080:8080 -e NODE_ENV=production japan-africa-car-arbitrage
```

### Step 2: Deploy to Sevalla

1. **Push to Container Registry**
   - Tag your image for Sevalla registry
   - Push to Sevalla container registry

2. **Deploy Container**
   - Create new container service in Sevalla
   - Use your pushed image
   - Configure environment variables

## 🔧 Configuration Files Explained

### `sevalla.yml`
Main configuration file that defines:
- Build commands
- Runtime settings
- Environment variables
- Health checks
- Scaling rules

### `Dockerfile`
Multi-stage Docker build that:
- Installs system dependencies
- Builds the frontend
- Sets up production environment
- Configures health checks

### `.sevallaignore`
Excludes unnecessary files from deployment:
- Development dependencies
- Build artifacts
- Documentation files

## 🔍 Post-Deployment Setup

### 1. Verify Application

```bash
# Check health endpoint
curl https://your-app.sevalla.app/health

# Check API endpoints
curl https://your-app.sevalla.app/api/cars/stats/overview
```

### 2. Initialize Data

1. **Access Admin Panel**
   - Go to `https://your-app.sevalla.app/admin`
   - Click "Run Full Scrape"
   - Monitor the scraping process

2. **Check Database**
   - Verify cars are being saved
   - Check profitability calculations

### 3. Configure Custom Domain (Optional)

1. **Add Custom Domain**
   - In Sevalla dashboard, go to "Domains"
   - Add your custom domain
   - Update DNS records as instructed

2. **SSL Certificate**
   - Sevalla provides automatic SSL
   - Your app will be available at `https://yourdomain.com`

## 📊 Monitoring and Scaling

### Application Metrics

Sevalla provides built-in monitoring:
- **Performance**: Response times, throughput
- **Resources**: CPU, memory usage
- **Logs**: Application and system logs
- **Errors**: Error tracking and alerts

### Auto-Scaling

Configure auto-scaling in `sevalla.yml`:
```yaml
scaling:
  min_instances: 1
  max_instances: 5
  cpu_threshold: 70
  memory_threshold: 80
```

### Log Monitoring

```bash
# View real-time logs
sevalla logs --follow

# View specific service logs
sevalla logs --service mongodb

# Download logs
sevalla logs --download
```

## 💰 Pricing

### Free Tier Includes:
- 1 web application
- 512MB RAM
- 1GB storage
- Custom domain support
- SSL certificate
- Basic monitoring

### Paid Plans:
- **Starter**: $10/month - More resources
- **Professional**: $25/month - Advanced features
- **Enterprise**: Custom pricing - Full support

## 🔧 Troubleshooting

### Common Issues

**Build Failures**
```bash
# Check build logs
sevalla logs --build

# Common solutions:
# - Verify Node.js version compatibility
# - Check package.json scripts
# - Ensure all dependencies are listed
```

**Database Connection Issues**
```bash
# Verify MongoDB service is running
sevalla services status

# Check connection string format
# Ensure firewall rules allow connections
```

**Memory Issues**
```bash
# Monitor resource usage
sevalla metrics

# Optimize application:
# - Reduce memory usage in scraping
# - Implement data pagination
# - Use file storage for large datasets
```

**Puppeteer Issues**
```bash
# Puppeteer might need additional configuration
# Set environment variables:
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Or disable real scraping:
USE_MOCK_DATA=true
```

## 🎉 Success Checklist

- [ ] Application deployed successfully
- [ ] Health check returns OK
- [ ] Database connected and accessible
- [ ] Frontend loads correctly
- [ ] API endpoints respond
- [ ] Admin panel accessible
- [ ] Scraping functionality works
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up
- [ ] Backup strategy in place

## 📞 Support

### Sevalla Support
- **Documentation**: [docs.sevalla.com](https://docs.sevalla.com)
- **Community**: Sevalla Discord/Forum
- **Support**: support@sevalla.com

### Application Support
- **GitHub Issues**: Create issues in your repository
- **Logs**: Use `sevalla logs` for debugging
- **Monitoring**: Check Sevalla dashboard metrics

## 🚀 Next Steps

1. **Monitor Performance**: Keep an eye on response times and resource usage
2. **Set Up Alerts**: Configure notifications for errors or downtime
3. **Plan Scaling**: Monitor traffic and scale resources as needed
4. **Backup Data**: Implement regular database backups
5. **Security**: Review and update security settings
6. **Updates**: Set up CI/CD for automatic deployments

Your Japan-Africa Car Arbitrage System is now live on Sevalla! 🎉

**Your Application URLs:**
- **Main App**: `https://your-app.sevalla.app`
- **API Health**: `https://your-app.sevalla.app/health`
- **Admin Panel**: `https://your-app.sevalla.app/admin`
- **Car Listings**: `https://your-app.sevalla.app/cars`