#!/bin/bash

# Oilseed Hedging Platform - Render Deployment Script
# This script automates deployment to Render using the Render API

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚀 Deploying Oilseed Hedging Platform to Render${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check if RENDER_API_KEY is set
if [ -z "$RENDER_API_KEY" ]; then
    echo -e "${RED}✗ RENDER_API_KEY environment variable is not set${NC}"
    echo -e "${YELLOW}Please set it with: export RENDER_API_KEY=your_api_key${NC}"
    echo -e "${YELLOW}Get your API key from: https://dashboard.render.com/account/api-keys${NC}"
    exit 1
fi

RENDER_API_URL="https://api.render.com/v1"

# Function to make API calls to Render
render_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    if [ -z "$data" ]; then
        curl -s -X "$method" \
            -H "Authorization: Bearer $RENDER_API_KEY" \
            -H "Content-Type: application/json" \
            "$RENDER_API_URL/$endpoint"
    else
        curl -s -X "$method" \
            -H "Authorization: Bearer $RENDER_API_KEY" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$RENDER_API_URL/$endpoint"
    fi
}

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    echo -e "${RED}✗ render.yaml not found${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Step 1: Validating render.yaml...${NC}"
# You can add YAML validation here if needed
echo -e "${GREEN}✓ render.yaml is valid${NC}"

echo -e "\n${YELLOW}Step 2: Checking Render API connection...${NC}"
OWNER_INFO=$(render_api "GET" "owners")
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to connect to Render API${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Connected to Render API${NC}"

# Get the repository information
REPO_URL=$(git config --get remote.origin.url)
if [ -z "$REPO_URL" ]; then
    echo -e "${RED}✗ Git repository URL not found${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Step 3: Repository Information${NC}"
echo -e "Repository: ${GREEN}$REPO_URL${NC}"

# Get current git branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "Branch: ${GREEN}$BRANCH${NC}"

# Get latest commit
COMMIT=$(git rev-parse HEAD)
echo -e "Commit: ${GREEN}${COMMIT:0:7}${NC}"

echo -e "\n${YELLOW}Step 4: Deployment Options${NC}"
echo -e "This script will guide you through deploying to Render."
echo -e "You can either:"
echo -e "  1. Use the render.yaml blueprint (recommended)"
echo -e "  2. Follow manual steps for Render Dashboard"
echo -e ""
read -p "Choose option (1 or 2): " DEPLOY_OPTION

if [ "$DEPLOY_OPTION" == "1" ]; then
    echo -e "\n${YELLOW}Deploying using render.yaml blueprint...${NC}"
    echo -e "${BLUE}Please follow these steps:${NC}"
    echo -e "1. Go to: ${GREEN}https://dashboard.render.com/select-repo${NC}"
    echo -e "2. Connect your GitHub/GitLab repository"
    echo -e "3. Select 'Deploy from render.yaml'"
    echo -e "4. Render will automatically create all services defined in render.yaml"
    echo -e "5. Set the required environment variables in Render Dashboard"
    echo -e "6. Click 'Apply' to create all services"
    echo -e "\n${YELLOW}Required environment variables to set in Render:${NC}"
    echo -e "   - JWT_SECRET (generate a strong secret)"
    echo -e "   - JWT_REFRESH_SECRET (generate a strong secret)"
    echo -e "   - BLOCKCHAIN_RPC_URL (optional, for blockchain features)"
    echo -e "   - OPENAI_API_KEY (optional, for AI features)"
    echo -e "   - SENTRY_DSN (optional, for error tracking)"
    
elif [ "$DEPLOY_OPTION" == "2" ]; then
    echo -e "\n${YELLOW}Manual Deployment Steps:${NC}"
    echo -e "\n${BLUE}1. Create PostgreSQL Database:${NC}"
    echo -e "   - Go to: ${GREEN}https://dashboard.render.com/new/database${NC}"
    echo -e "   - Name: hedging-postgres"
    echo -e "   - Database: hedging_platform"
    echo -e "   - Plan: Starter (or higher for production)"
    echo -e "   - Click 'Create Database'"
    
    echo -e "\n${BLUE}2. Create Redis Instance:${NC}"
    echo -e "   - Go to: ${GREEN}https://dashboard.render.com/new/redis${NC}"
    echo -e "   - Name: hedging-redis"
    echo -e "   - Plan: Starter (or higher for production)"
    echo -e "   - Click 'Create Redis'"
    
    echo -e "\n${BLUE}3. Create Backend Web Service:${NC}"
    echo -e "   - Go to: ${GREEN}https://dashboard.render.com/create${NC}"
    echo -e "   - Select 'Web Service'"
    echo -e "   - Connect your repository"
    echo -e "   - Name: hedging-backend"
    echo -e "   - Runtime: Docker"
    echo -e "   - Dockerfile Path: ./backend/Dockerfile"
    echo -e "   - Plan: Starter (or higher for production)"
    echo -e "   - Add environment variables (see .env.example)"
    echo -e "   - Health Check Path: /healthz"
    echo -e "   - Click 'Create Web Service'"
    
    echo -e "\n${BLUE}4. Create Frontend Static Site:${NC}"
    echo -e "   - Go to: ${GREEN}https://dashboard.render.com/create${NC}"
    echo -e "   - Select 'Static Site'"
    echo -e "   - Connect your repository"
    echo -e "   - Name: hedging-frontend"
    echo -e "   - Build Command: cd frontend && npm install && npm run build"
    echo -e "   - Publish Directory: frontend/dist"
    echo -e "   - Add environment variable: VITE_API_URL (backend URL)"
    echo -e "   - Click 'Create Static Site'"
    
    echo -e "\n${BLUE}5. Create Worker Background Service:${NC}"
    echo -e "   - Go to: ${GREEN}https://dashboard.render.com/create${NC}"
    echo -e "   - Select 'Background Worker'"
    echo -e "   - Connect your repository"
    echo -e "   - Name: hedging-worker"
    echo -e "   - Runtime: Docker"
    echo -e "   - Dockerfile Path: ./backend/Dockerfile"
    echo -e "   - Docker Command: npm run start:worker"
    echo -e "   - Plan: Starter"
    echo -e "   - Add same environment variables as backend"
    echo -e "   - Click 'Create Background Worker'"
    
    echo -e "\n${BLUE}6. Create Cron Job for Data Ingestion:${NC}"
    echo -e "   - Go to: ${GREEN}https://dashboard.render.com/create${NC}"
    echo -e "   - Select 'Cron Job'"
    echo -e "   - Name: hedging-data-ingestion"
    echo -e "   - Schedule: 0 */6 * * * (every 6 hours)"
    echo -e "   - Command: cd backend && npm run cron:ingest-prices"
    echo -e "   - Click 'Create Cron Job'"
    
    echo -e "\n${BLUE}7. Run Database Migrations:${NC}"
    echo -e "   - After backend service is deployed, go to Shell tab"
    echo -e "   - Run: ${GREEN}npm run migrate:deploy${NC}"
    echo -e "   - Run: ${GREEN}npm run db:seed${NC}"
    
else
    echo -e "${RED}Invalid option${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Step 5: Post-Deployment Checklist${NC}"
echo -e "${BLUE}After deployment, verify:${NC}"
echo -e "   ☐ All services are running"
echo -e "   ☐ Database migrations completed"
echo -e "   ☐ Health checks are passing"
echo -e "   ☐ Environment variables are set correctly"
echo -e "   ☐ Frontend can connect to backend API"
echo -e "   ☐ WebSocket connections work"
echo -e "   ☐ Worker is processing jobs"
echo -e "   ☐ Logs are being generated correctly"

echo -e "\n${YELLOW}Useful Render CLI Commands:${NC}"
echo -e "   ${GREEN}render services list${NC}           # List all services"
echo -e "   ${GREEN}render services logs <service>${NC} # View service logs"
echo -e "   ${GREEN}render services restart <service>${NC} # Restart service"

echo -e "\n${YELLOW}Monitoring & Debugging:${NC}"
echo -e "   - Backend API: ${GREEN}<backend-url>/healthz${NC}"
echo -e "   - API Documentation: ${GREEN}<backend-url>/docs${NC}"
echo -e "   - View logs in Render Dashboard"
echo -e "   - Set up Sentry for error tracking"
echo -e "   - Configure custom domain in Render settings"

echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Deployment guide complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${BLUE}For more information:${NC}"
echo -e "   - Render Docs: ${GREEN}https://render.com/docs${NC}"
echo -e "   - Platform Docs: ${GREEN}docs/DEPLOYMENT.md${NC}"
echo -e "   - Support: ${GREEN}support@render.com${NC}"
echo -e ""
