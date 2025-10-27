#!/bin/bash

echo "🚀 Deploying Japan-Africa Car Arbitrage to Sevalla"
echo "=================================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit for Sevalla deployment"
fi

# Check if Sevalla CLI is installed
if ! command -v sevalla &> /dev/null; then
    echo "⚠️  Sevalla CLI not found. You can:"
    echo "1. Install it: npm install -g @sevalla/cli"
    echo "2. Or deploy via Sevalla web dashboard"
    echo ""
    echo "📱 Web Dashboard Deployment:"
    echo "1. Go to https://app.sevalla.com"
    echo "2. Create new project"
    echo "3. Connect your GitHub repository"
    echo "4. Configure build settings:"
    echo "   - Build Command: npm install && cd backend && npm install && cd ../frontend && npm install && npm run build"
    echo "   - Start Command: npm start"
    echo "   - Port: 8080"
    echo "5. Add environment variables (see SEVALLA_DEPLOY.md)"
    echo "6. Deploy!"
    exit 0
fi

echo "🔐 Logging into Sevalla..."
sevalla login

echo "📦 Preparing deployment..."

# Create or update sevalla.yml if needed
if [ ! -f "sevalla.yml" ]; then
    echo "⚠️  sevalla.yml not found. Creating default configuration..."
    cat > sevalla.yml << EOF
name: japan-africa-car-arbitrage
description: System for identifying profitable used car arbitrage opportunities

build:
  commands:
    - npm install
    - cd backend && npm install
    - cd ../frontend && npm install && npm run build

run:
  command: npm start
  
env:
  NODE_ENV: production
  USE_MOCK_DATA: false
  PORT: 8080

health_check:
  path: /health
  port: 8080
EOF
fi

echo "🚀 Deploying to Sevalla..."
sevalla deploy

echo "📊 Checking deployment status..."
sevalla status

echo "📝 Getting application URL..."
APP_URL=$(sevalla info --format json | jq -r '.url')

if [ "$APP_URL" != "null" ]; then
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "=================================="
    echo "🌐 Application URL: $APP_URL"
    echo "🏥 Health Check: $APP_URL/health"
    echo "👨‍💼 Admin Panel: $APP_URL/admin"
    echo "🚗 Car Listings: $APP_URL/cars"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Test your application: curl $APP_URL/health"
    echo "2. Access admin panel to run initial scrape"
    echo "3. Configure custom domain (optional)"
    echo "4. Set up monitoring and alerts"
    echo ""
    echo "📖 For detailed configuration, see SEVALLA_DEPLOY.md"
else
    echo "⚠️  Could not retrieve application URL. Check Sevalla dashboard."
fi

echo ""
echo "📊 View logs: sevalla logs --follow"
echo "📈 Monitor app: sevalla metrics"
echo "🔧 Manage app: https://app.sevalla.com"