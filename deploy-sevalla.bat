@echo off
echo 🚀 Deploying Japan-Africa Car Arbitrage to Sevalla
echo ==================================================

REM Check if git is initialized
if not exist ".git" (
    echo Initializing Git repository...
    git init
    git add .
    git commit -m "Initial commit for Sevalla deployment"
)

REM Check if Sevalla CLI is installed
sevalla --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Sevalla CLI not found. You can:
    echo 1. Install it: npm install -g @sevalla/cli
    echo 2. Or deploy via Sevalla web dashboard
    echo.
    echo 📱 Web Dashboard Deployment:
    echo 1. Go to https://app.sevalla.com
    echo 2. Create new project
    echo 3. Connect your GitHub repository
    echo 4. Configure build settings:
    echo    - Build Command: npm install ^&^& cd backend ^&^& npm install ^&^& cd ../frontend ^&^& npm install ^&^& npm run build
    echo    - Start Command: npm start
    echo    - Port: 8080
    echo 5. Add environment variables (see SEVALLA_DEPLOY.md)
    echo 6. Deploy!
    pause
    exit /b 0
)

echo 🔐 Logging into Sevalla...
sevalla login

echo 📦 Preparing deployment...

REM Create sevalla.yml if it doesn't exist
if not exist "sevalla.yml" (
    echo ⚠️  sevalla.yml not found. Creating default configuration...
    (
        echo name: japan-africa-car-arbitrage
        echo description: System for identifying profitable used car arbitrage opportunities
        echo.
        echo build:
        echo   commands:
        echo     - npm install
        echo     - cd backend ^&^& npm install
        echo     - cd ../frontend ^&^& npm install ^&^& npm run build
        echo.
        echo run:
        echo   command: npm start
        echo.
        echo env:
        echo   NODE_ENV: production
        echo   USE_MOCK_DATA: false
        echo   PORT: 8080
        echo.
        echo health_check:
        echo   path: /health
        echo   port: 8080
    ) > sevalla.yml
)

echo 🚀 Deploying to Sevalla...
sevalla deploy

echo 📊 Checking deployment status...
sevalla status

echo.
echo 🎉 Deployment process completed!
echo ================================
echo.
echo 📋 Next Steps:
echo 1. Check Sevalla dashboard for your app URL
echo 2. Test health endpoint: [YOUR_APP_URL]/health
echo 3. Access admin panel: [YOUR_APP_URL]/admin
echo 4. Run initial scrape to populate data
echo 5. Configure custom domain (optional)
echo.
echo 📖 For detailed configuration, see SEVALLA_DEPLOY.md
echo 📊 View logs: sevalla logs --follow
echo 📈 Monitor app: sevalla metrics
echo 🔧 Manage app: https://app.sevalla.com
echo.
pause