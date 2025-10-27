#!/bin/bash

# Japan-Africa Car Arbitrage System - Quick Deploy Script
echo "🚗 Japan-Africa Car Arbitrage System Deployment"
echo "================================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: Japan-Africa Car Arbitrage System"
fi

# Function to deploy to different platforms
deploy_platform() {
    case $1 in
        "heroku")
            echo "🚀 Deploying to Heroku..."
            
            # Check if Heroku CLI is installed
            if ! command -v heroku &> /dev/null; then
                echo "❌ Heroku CLI not found. Please install it first."
                echo "Visit: https://devcenter.heroku.com/articles/heroku-cli"
                exit 1
            fi
            
            echo "Creating Heroku apps..."
            read -p "Enter your app name prefix (e.g., 'myapp'): " APP_PREFIX
            
            # Create backend app
            heroku create ${APP_PREFIX}-backend
            heroku addons:create mongolab:sandbox -a ${APP_PREFIX}-backend
            heroku config:set NODE_ENV=production -a ${APP_PREFIX}-backend
            heroku config:set USE_MOCK_DATA=false -a ${APP_PREFIX}-backend
            
            # Create frontend app
            heroku create ${APP_PREFIX}-frontend
            heroku buildpacks:set mars/create-react-app -a ${APP_PREFIX}-frontend
            heroku config:set REACT_APP_API_URL=https://${APP_PREFIX}-backend.herokuapp.com -a ${APP_PREFIX}-frontend
            
            echo "✅ Heroku apps created successfully!"
            echo "Backend: https://${APP_PREFIX}-backend.herokuapp.com"
            echo "Frontend: https://${APP_PREFIX}-frontend.herokuapp.com"
            ;;
            
        "docker")
            echo "🐳 Deploying with Docker..."
            
            # Check if Docker is installed
            if ! command -v docker &> /dev/null; then
                echo "❌ Docker not found. Please install Docker first."
                exit 1
            fi
            
            cd deployment
            docker-compose up -d
            
            echo "✅ Docker deployment started!"
            echo "Frontend: http://localhost:3000"
            echo "Backend: http://localhost:5000"
            echo "MongoDB: localhost:27017"
            ;;
            
        "github")
            echo "📚 Pushing to GitHub..."
            
            read -p "Enter your GitHub username: " GITHUB_USER
            read -p "Enter repository name (default: japan-africa-car-arbitrage): " REPO_NAME
            REPO_NAME=${REPO_NAME:-japan-africa-car-arbitrage}
            
            # Add remote if not exists
            if ! git remote get-url origin &> /dev/null; then
                git remote add origin https://github.com/${GITHUB_USER}/${REPO_NAME}.git
            fi
            
            git add .
            git commit -m "Deploy: $(date)"
            git push -u origin main
            
            echo "✅ Code pushed to GitHub!"
            echo "Repository: https://github.com/${GITHUB_USER}/${REPO_NAME}"
            ;;
            
        *)
            echo "❌ Unknown platform: $1"
            echo "Available platforms: heroku, docker, github"
            exit 1
            ;;
    esac
}

# Main menu
echo ""
echo "Choose deployment option:"
echo "1) Push to GitHub only"
echo "2) Deploy with Docker (local)"
echo "3) Deploy to Heroku"
echo "4) All of the above"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        deploy_platform "github"
        ;;
    2)
        deploy_platform "docker"
        ;;
    3)
        deploy_platform "heroku"
        ;;
    4)
        deploy_platform "github"
        echo ""
        deploy_platform "docker"
        echo ""
        deploy_platform "heroku"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "Next steps:"
echo "- Check your application is running"
echo "- Configure your domain (if applicable)"
echo "- Set up monitoring and backups"
echo "- Review the DEPLOYMENT.md file for detailed instructions"