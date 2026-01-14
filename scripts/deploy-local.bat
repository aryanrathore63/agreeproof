@echo off
REM AgreeProof Local Deployment Script for Windows
REM This script helps you deploy and test the application locally before pushing to production

setlocal enabledelayedexpansion

REM Configuration
set PROJECT_ROOT=%~dp0..
set FRONTEND_PATH=%PROJECT_ROOT%\agreeproof-frontend
set BACKEND_PATH=%PROJECT_ROOT%\agreeproof-backend
set LOG_FILE=%PROJECT_ROOT%\deployment.log

REM Colors for output (Windows 10+ supports ANSI escape codes)
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM Logging function
call :log "Starting local deployment..."

REM Print colored output
:print_status
echo %BLUE%[INFO]%NC% %~1
goto :eof

:print_success
echo %GREEN%[SUCCESS]%NC% %~1
goto :eof

:print_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:print_error
echo %RED%[ERROR]%NC% %~1
goto :eof

REM Logging function
:log
echo %date% %time% - %~1 >> "%LOG_FILE%"
goto :eof

REM Check if command exists
:command_exists
where %1 >nul 2>&1
goto :eof

REM Check prerequisites
:check_prerequisites
call :print_status "Checking prerequisites..."

set missing_deps=

call :command_exists node
if errorlevel 1 set missing_deps=%missing_deps% Node.js

call :command_exists npm
if errorlevel 1 set missing_deps=%missing_deps% npm

call :command_exists docker
if errorlevel 1 set missing_deps=%missing_deps% Docker

call :command_exists curl
if errorlevel 1 set missing_deps=%missing_deps% curl

if not "%missing_deps%"=="" (
    call :print_error "Missing dependencies:%missing_deps%"
    call :print_status "Please install the missing dependencies and try again."
    pause
    exit /b 1
)

call :print_success "All prerequisites are installed"
goto :eof

REM Setup environment files
:setup_environment
call :print_status "Setting up environment files..."

REM Frontend environment
if not exist "%FRONTEND_PATH%\.env.local" (
    call :print_status "Creating frontend .env.local file..."
    (
        echo # Local Development Environment
        echo REACT_APP_API_BASE_URL=http://localhost:3001
        echo REACT_APP_ENVIRONMENT=development
        echo REACT_APP_VERSION=local
        echo REACT_APP_BUILD_TIME=%date:~0,4%-%date:~5,2%-%date:~8,2%T%time:~0,2%:%time:~3,2%:%time:~6,2%Z
        echo REACT_APP_DEBUG=true
    ) > "%FRONTEND_PATH%\.env.local"
    call :print_success "Frontend .env.local created"
) else (
    call :print_warning "Frontend .env.local already exists"
)

REM Backend environment
if not exist "%BACKEND_PATH%\.env" (
    call :print_status "Creating backend .env file..."
    (
        echo # Local Development Environment
        echo NODE_ENV=development
        echo PORT=3001
        echo MONGODB_URI=mongodb://localhost:27017/agreeproof_local
        echo JWT_SECRET=local_development_secret_key_change_in_production
        echo JWT_EXPIRES_IN=7d
        echo CORS_ORIGIN=http://localhost:3000
        echo LOG_LEVEL=debug
        echo RATE_LIMIT_WINDOW_MS=900000
        echo RATE_LIMIT_MAX_REQUESTS=1000
    ) > "%BACKEND_PATH%\.env"
    call :print_success "Backend .env created"
) else (
    call :print_warning "Backend .env already exists"
)
goto :eof

REM Start MongoDB locally
:start_mongodb
call :print_status "Starting MongoDB locally..."

REM Check if MongoDB container is already running
docker ps | findstr agreeproof-mongodb >nul
if not errorlevel 1 (
    call :print_warning "MongoDB is already running"
    goto :eof
)

REM Start MongoDB using Docker
docker run -d --name agreeproof-mongodb -p 27017:27017 -v agreeproof-mongodb-data:/data/db mongo:6.0 --auth

REM Wait for MongoDB to start
call :print_status "Waiting for MongoDB to start..."
timeout /t 10 /nobreak >nul

REM Check if MongoDB is responding
docker exec agreeproof-mongodb mongosh --eval "db.runCommand({ping: 1})" >nul 2>&1
if errorlevel 1 (
    call :print_error "Failed to start MongoDB"
    pause
    exit /b 1
)

call :print_success "MongoDB started successfully"
goto :eof

REM Install dependencies
:install_dependencies
call :print_status "Installing dependencies..."

REM Frontend dependencies
call :print_status "Installing frontend dependencies..."
cd /d "%FRONTEND_PATH%"
call npm install
if errorlevel 1 (
    call :print_error "Failed to install frontend dependencies"
    pause
    exit /b 1
)

REM Backend dependencies
call :print_status "Installing backend dependencies..."
cd /d "%BACKEND_PATH%"
call npm install
if errorlevel 1 (
    call :print_error "Failed to install backend dependencies"
    pause
    exit /b 1
)

cd /d "%PROJECT_ROOT%"
call :print_success "Dependencies installed"
goto :eof

REM Run tests
:run_tests
call :print_status "Running tests..."

REM Backend tests
call :print_status "Running backend tests..."
cd /d "%BACKEND_PATH%"
call npm test
if errorlevel 1 (
    call :print_error "Backend tests failed"
    pause
    exit /b 1
)

REM Frontend tests
call :print_status "Running frontend tests..."
cd /d "%FRONTEND_PATH%"
call npm test -- --watchAll=false
if errorlevel 1 (
    call :print_error "Frontend tests failed"
    pause
    exit /b 1
)

cd /d "%PROJECT_ROOT%"
call :print_success "All tests passed"
goto :eof

REM Build applications
:build_applications
call :print_status "Building applications..."

REM Backend build
call :print_status "Building backend..."
cd /d "%BACKEND_PATH%"
call npm run build
if errorlevel 1 (
    call :print_error "Backend build failed"
    pause
    exit /b 1
)

REM Frontend build
call :print_status "Building frontend..."
cd /d "%FRONTEND_PATH%"
call npm run build
if errorlevel 1 (
    call :print_error "Frontend build failed"
    pause
    exit /b 1
)

cd /d "%PROJECT_ROOT%"
call :print_success "Applications built successfully"
goto :eof

REM Start services
:start_services
call :print_status "Starting services..."

REM Start backend
call :print_status "Starting backend service..."
cd /d "%BACKEND_PATH%"
start "Backend Service" cmd /k "npm start"
set BACKEND_PID=%errorlevel%

REM Wait for backend to start
call :print_status "Waiting for backend to start..."
timeout /t 5 /nobreak >nul

REM Check backend health
curl -f http://localhost:3001/health >nul 2>&1
if errorlevel 1 (
    call :print_error "Backend failed to start"
    call :stop_services
    pause
    exit /b 1
)

call :print_success "Backend started successfully"

REM Start frontend
call :print_status "Starting frontend service..."
cd /d "%FRONTEND_PATH%"
start "Frontend Service" cmd /k "npm start"
set FRONTEND_PID=%errorlevel%

REM Wait for frontend to start
call :print_status "Waiting for frontend to start..."
timeout /t 10 /nobreak >nul

REM Check frontend health
curl -f http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    call :print_error "Frontend failed to start"
    call :stop_services
    pause
    exit /b 1
)

call :print_success "Frontend started successfully"
call :print_success "All services started"
goto :eof

REM Run health checks
:run_health_checks
call :print_status "Running health checks..."

REM Backend health check
call :print_status "Checking backend health..."
curl -s http://localhost:3001/health | findstr healthy >nul
if errorlevel 1 (
    call :print_error "Backend health check failed"
    exit /b 1
)
call :print_success "Backend health check passed"

REM Frontend health check
call :print_status "Checking frontend health..."
curl -f http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    call :print_error "Frontend health check failed"
    exit /b 1
)
call :print_success "Frontend health check passed"

REM API connectivity check
call :print_status "Checking API connectivity..."
curl -s http://localhost:3001/api/agreements | findstr agreements >nul
if errorlevel 1 (
    call :print_warning "API connectivity check returned unexpected response"
) else (
    call :print_success "API connectivity check passed"
)

call :print_success "All health checks passed"
goto :eof

REM Run integration tests
:run_integration_tests
call :print_status "Running integration tests..."
cd /d "%BACKEND_PATH%"
call npm run test:integration
if errorlevel 1 (
    call :print_error "Integration tests failed"
    pause
    exit /b 1
)
call :print_success "Integration tests passed"
goto :eof

REM Stop services
:stop_services
call :print_status "Stopping services..."

REM Stop backend and frontend (close windows)
taskkill /f /im node.exe >nul 2>&1

REM Stop MongoDB
docker ps | findstr agreeproof-mongodb >nul
if not errorlevel 1 (
    docker stop agreeproof-mongodb >nul
    docker rm agreeproof-mongodb >nul
    call :print_success "MongoDB stopped"
)

call :print_success "Services stopped"
goto :eof

REM Cleanup function
:cleanup
call :print_status "Cleaning up..."
call :stop_services
call :print_success "Cleanup completed"
goto :eof

REM Main deployment function
:deploy_local
call :check_prerequisites
call :setup_environment
call :start_mongodb
call :install_dependencies
call :run_tests
call :build_applications
call :start_services
call :run_health_checks
call :run_integration_tests

call :print_success "🎉 Local deployment completed successfully!"
call :print_status "Frontend: http://localhost:3000"
call :print_status "Backend: http://localhost:3001"
call :print_status "Health: http://localhost:3001/health"
call :print_status "Press any key to stop all services..."
pause >nul
call :cleanup
goto :eof

REM Show usage
:show_usage
echo Usage: %~nx0 [COMMAND]
echo.
echo Commands:
echo   deploy     Deploy and start all services
echo   stop       Stop all services
echo   test       Run tests only
echo   build      Build applications only
echo   health     Run health checks only
echo   cleanup    Clean up all resources
echo   help       Show this help message
echo.
echo Examples:
echo   %~nx0 deploy    # Deploy and start all services
echo   %~nx0 stop      # Stop all services
echo   %~nx0 test      # Run tests only
goto :eof

REM Parse command line arguments
if "%1"=="" goto deploy_local
if /i "%1"=="deploy" goto deploy_local
if /i "%1"=="stop" goto stop_services
if /i "%1"=="test" (
    call :check_prerequisites
    call :install_dependencies
    call :run_tests
    goto :eof
)
if /i "%1"=="build" (
    call :check_prerequisites
    call :install_dependencies
    call :build_applications
    goto :eof
)
if /i "%1"=="health" (
    call :run_health_checks
    goto :eof
)
if /i "%1"=="cleanup" goto cleanup
if /i "%1"=="help" goto show_usage
if /i "%1"=="--help" goto show_usage
if /i "%1"=="-h" goto show_usage

call :print_error "Unknown command: %1"
call :show_usage
pause
exit /b 1