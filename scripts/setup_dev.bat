@echo off
REM Oilseed Hedging Platform - Development Setup Script for Windows
REM This script bootstraps the local development environment on Windows

setlocal enabledelayedexpansion

echo ========================================
echo Setting up Oilseed Hedging Platform development environment...
echo ========================================

REM Check if .env exists, if not copy from .env.example
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo [OK] Created .env file
) else (
    echo [OK] .env file already exists
)

REM Check Node.js installation
echo.
echo Checking Node.js version...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed
    echo Please install Node.js 18 or higher from https://nodejs.org
    exit /b 1
)
echo [OK] Node.js detected

REM Install dependencies
echo.
echo Installing dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install root dependencies
    exit /b 1
)
echo [OK] Root dependencies installed

REM Install backend dependencies
echo.
echo Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install backend dependencies
    exit /b 1
)
cd ..
echo [OK] Backend dependencies installed

REM Install frontend dependencies
echo.
echo Installing frontend dependencies...
cd frontend
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install frontend dependencies
    exit /b 1
)
cd ..
echo [OK] Frontend dependencies installed

REM Install contracts dependencies
echo.
echo Installing smart contract dependencies...
cd contracts
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install contract dependencies
    exit /b 1
)
cd ..
echo [OK] Contract dependencies installed

REM Start Docker services
echo.
echo Starting Docker services (PostgreSQL, Redis)...
docker-compose up -d postgres redis
if errorlevel 1 (
    echo [ERROR] Failed to start Docker services
    echo Make sure Docker Desktop is running
    exit /b 1
)
echo [OK] Docker services started

REM Wait for PostgreSQL to be ready
echo.
echo Waiting for PostgreSQL to be ready...
timeout /t 10 /nobreak >nul

REM Run Prisma migrations
echo.
echo Running database migrations...
cd backend
call npx prisma migrate dev --name init
if errorlevel 1 (
    echo [ERROR] Failed to run migrations
    cd ..
    exit /b 1
)
cd ..
echo [OK] Database migrations completed

REM Generate Prisma client
echo.
echo Generating Prisma client...
cd backend
call npx prisma generate
if errorlevel 1 (
    echo [ERROR] Failed to generate Prisma client
    cd ..
    exit /b 1
)
cd ..
echo [OK] Prisma client generated

REM Seed the database
echo.
echo Seeding database with initial data...
cd backend
call npm run db:seed
if errorlevel 1 (
    echo [ERROR] Failed to seed database
    cd ..
    exit /b 1
)
cd ..
echo [OK] Database seeded

REM Compile smart contracts
echo.
echo Compiling smart contracts...
cd contracts
call npx hardhat compile
if errorlevel 1 (
    echo [ERROR] Failed to compile contracts
    cd ..
    exit /b 1
)
cd ..
echo [OK] Smart contracts compiled

REM Create uploads directory
echo.
echo Creating uploads directory...
if not exist backend\uploads mkdir backend\uploads
if not exist frontend\public\uploads mkdir frontend\public\uploads
echo [OK] Uploads directory created

echo.
echo ========================================
echo [OK] Development environment setup complete!
echo ========================================

echo.
echo Next steps:
echo 1. Review and update .env file with your configuration
echo 2. Start the development servers:
echo    npm run dev             # Start all services
echo    npm run dev:backend     # Start backend only
echo    npm run dev:frontend    # Start frontend only
echo    npm run dev:worker      # Start worker only
echo 3. Access the application:
echo    Frontend: http://localhost:5173
echo    Backend API: http://localhost:3000
echo    API Docs: http://localhost:3000/docs
echo    Prisma Studio: npx prisma studio
echo.
echo Default test credentials:
echo    Email: farmer@test.com
echo    Password: Test@1234
echo.
echo Useful commands:
echo    npm run docker:logs     # View Docker logs
echo    npm run docker:down     # Stop Docker services
echo    npm test                # Run all tests
echo    npm run lint            # Lint all code
echo.

endlocal
