#!/bin/bash

# Oilseed Hedging Platform - Development Setup Script
# This script bootstraps the local development environment

set -e

echo "🚀 Setting up Oilseed Hedging Platform development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists, if not copy from .env.example
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Check Node.js version
echo -e "\n${YELLOW}Checking Node.js version...${NC}"
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}✗ Node.js version 18 or higher is required${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"

# Install dependencies
echo -e "\n${YELLOW}Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Root dependencies installed${NC}"

# Install backend dependencies
echo -e "\n${YELLOW}Installing backend dependencies...${NC}"
cd backend && npm install && cd ..
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Install frontend dependencies
echo -e "\n${YELLOW}Installing frontend dependencies...${NC}"
cd frontend && npm install && cd ..
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# Install contracts dependencies
echo -e "\n${YELLOW}Installing smart contract dependencies...${NC}"
cd contracts && npm install && cd ..
echo -e "${GREEN}✓ Contract dependencies installed${NC}"

# Start Docker services
echo -e "\n${YELLOW}Starting Docker services (PostgreSQL, Redis)...${NC}"
docker-compose up -d postgres redis
echo -e "${GREEN}✓ Docker services started${NC}"

# Wait for PostgreSQL to be ready
echo -e "\n${YELLOW}Waiting for PostgreSQL to be ready...${NC}"
sleep 5
until docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
    echo "Waiting for PostgreSQL..."
    sleep 2
done
echo -e "${GREEN}✓ PostgreSQL is ready${NC}"

# Run Prisma migrations
echo -e "\n${YELLOW}Running database migrations...${NC}"
cd backend && npx prisma migrate dev --name init && cd ..
echo -e "${GREEN}✓ Database migrations completed${NC}"

# Generate Prisma client
echo -e "\n${YELLOW}Generating Prisma client...${NC}"
cd backend && npx prisma generate && cd ..
echo -e "${GREEN}✓ Prisma client generated${NC}"

# Seed the database
echo -e "\n${YELLOW}Seeding database with initial data...${NC}"
cd backend && npm run db:seed && cd ..
echo -e "${GREEN}✓ Database seeded${NC}"

# Compile smart contracts
echo -e "\n${YELLOW}Compiling smart contracts...${NC}"
cd contracts && npx hardhat compile && cd ..
echo -e "${GREEN}✓ Smart contracts compiled${NC}"

# Create uploads directory
echo -e "\n${YELLOW}Creating uploads directory...${NC}"
mkdir -p backend/uploads frontend/public/uploads
echo -e "${GREEN}✓ Uploads directory created${NC}"

echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Development environment setup complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "1. Review and update .env file with your configuration"
echo -e "2. Start the development servers:"
echo -e "   ${GREEN}npm run dev${NC}             # Start all services"
echo -e "   ${GREEN}npm run dev:backend${NC}     # Start backend only"
echo -e "   ${GREEN}npm run dev:frontend${NC}    # Start frontend only"
echo -e "   ${GREEN}npm run dev:worker${NC}      # Start worker only"
echo -e "3. Access the application:"
echo -e "   Frontend: ${GREEN}http://localhost:5173${NC}"
echo -e "   Backend API: ${GREEN}http://localhost:3000${NC}"
echo -e "   API Docs: ${GREEN}http://localhost:3000/docs${NC}"
echo -e "   Prisma Studio: ${GREEN}npx prisma studio${NC}"
echo -e "\n${YELLOW}Default test credentials:${NC}"
echo -e "   Email: ${GREEN}farmer@test.com${NC}"
echo -e "   Password: ${GREEN}Test@1234${NC}"
echo -e "\n${YELLOW}Useful commands:${NC}"
echo -e "   ${GREEN}npm run docker:logs${NC}     # View Docker logs"
echo -e "   ${GREEN}npm run docker:down${NC}     # Stop Docker services"
echo -e "   ${GREEN}npm test${NC}                # Run all tests"
echo -e "   ${GREEN}npm run lint${NC}            # Lint all code"
echo -e ""
