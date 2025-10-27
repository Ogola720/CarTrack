@echo off
echo 🚗 Japan-Africa Car Arbitrage System Deployment
echo ================================================

REM Check if git is initialized
if not exist ".git" (
    echo Initializing Git repository...
    git init
    git add .
    git commit -m "Initial commit: Japan-Africa Car Arbitrage System"
)

echo.
echo Choose deployment option:
echo 1) Push to GitHub only
echo 2) Deploy with Docker (local)
echo 3) Setup for Heroku
echo 4) All of the above
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto github
if "%choice%"=="2" goto docker
if "%choice%"=="3" goto heroku
if "%choice%"=="4" goto all
goto invalid

:github
echo 📚 Pushing to GitHub...
set /p github_user="Enter your GitHub username: "
set /p repo_name="Enter repository name (default: japan-africa-car-arbitrage): "
if "%repo_name%"=="" set repo_name=japan-africa-car-arbitrage

REM Add remote if not exists
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    git remote add origin https://github.com/%github_user%/%repo_name%.git
)

git add .
git commit -m "Deploy: %date% %time%"
git push -u origin main

echo ✅ Code pushed to GitHub!
echo Repository: https://github.com/%github_user%/%repo_name%
goto end

:docker
echo 🐳 Deploying with Docker...

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker not found. Please install Docker Desktop first.
    echo Visit: https://www.docker.com/products/docker-desktop
    goto end
)

cd deployment
docker-compose up -d

echo ✅ Docker deployment started!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo MongoDB: localhost:27017
goto end

:heroku
echo 🚀 Setting up for Heroku...

REM Check if Heroku CLI is installed
heroku --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Heroku CLI not found. Please install it first.
    echo Visit: https://devcenter.heroku.com/articles/heroku-cli
    goto end
)

set /p app_prefix="Enter your app name prefix (e.g., 'myapp'): "

echo Creating Heroku apps...
heroku create %app_prefix%-backend
heroku addons:create mongolab:sandbox -a %app_prefix%-backend
heroku config:set NODE_ENV=production -a %app_prefix%-backend
heroku config:set USE_MOCK_DATA=false -a %app_prefix%-backend

heroku create %app_prefix%-frontend
heroku buildpacks:set mars/create-react-app -a %app_prefix%-frontend
heroku config:set REACT_APP_API_URL=https://%app_prefix%-backend.herokuapp.com -a %app_prefix%-frontend

echo ✅ Heroku apps created successfully!
echo Backend: https://%app_prefix%-backend.herokuapp.com
echo Frontend: https://%app_prefix%-frontend.herokuapp.com
echo.
echo To deploy, run:
echo git subtree push --prefix backend heroku main
echo git subtree push --prefix frontend heroku main
goto end

:all
call :github
echo.
call :docker
echo.
call :heroku
goto end

:invalid
echo ❌ Invalid choice
goto end

:end
echo.
echo 🎉 Deployment setup completed!
echo.
echo Next steps:
echo - Check your application is running
echo - Configure your domain (if applicable)
echo - Set up monitoring and backups
echo - Review the DEPLOYMENT.md file for detailed instructions
pause