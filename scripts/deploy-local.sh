#!/bin/bash

# AgreeProof Local Deployment Script
# This script helps you deploy and test the application locally before pushing to production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_PATH="$PROJECT_ROOT/agreeproof-frontend"
BACKEND_PATH="$PROJECT_ROOT/agreeproof-backend"
LOG_FILE="$PROJECT_ROOT/deployment.log"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    local missing_deps=()
    
    if ! command_exists node; then
        missing_deps+=("Node.js")
    fi
    
    if ! command_exists npm; then
        missing_deps+=("npm")
    fi
    
    if ! command_exists docker; then
        missing_deps+=("Docker")
    fi
    
    if ! command_exists docker-compose; then
        missing_deps+=("Docker Compose")
    fi
    
    if ! command_exists curl; then
        missing_deps+=("curl")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_status "Please install the missing dependencies and try again."
        exit 1
    fi
    
    print_success "All prerequisites are installed"
}

# Setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Frontend environment
    if [ ! -f "$FRONTEND_PATH/.env.local" ]; then
        print_status "Creating frontend .env.local file..."
        cat > "$FRONTEND_PATH/.env.local" << EOF
# Local Development Environment
REACT_APP_API_BASE_URL=http://localhost:3001
REACT_APP_ENVIRONMENT=development
REACT_APP_VERSION=local
REACT_APP_BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
REACT_APP_DEBUG=true
EOF
        print_success "Frontend .env.local created"
    else
        print_warning "Frontend .env.local already exists"
    fi
    
    # Backend environment
    if [ ! -f "$BACKEND_PATH/.env" ]; then
        print_status "Creating backend .env file..."
        cat > "$BACKEND_PATH/.env" << EOF
# Local Development Environment
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/agreeproof_local
JWT_SECRET=local_development_secret_key_change_in_production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
EOF
        print_success "Backend .env created"
    else
        print_warning "Backend .env already exists"
    fi
}

# Start MongoDB locally
start_mongodb() {
    print_status "Starting MongoDB locally..."
    
    # Check if MongoDB is already running
    if pgrep mongod > /dev/null; then
        print_warning "MongoDB is already running"
        return 0
    fi
    
    # Start MongoDB using Docker
    docker run -d \
        --name agreeproof-mongodb \
        -p 27017:27017 \
        -v agreeproof-mongodb-data:/data/db \
        mongo:6.0 \
        --auth
    
    # Wait for MongoDB to start
    print_status "Waiting for MongoDB to start..."
    sleep 10
    
    # Check if MongoDB is responding
    if docker exec agreeproof-mongodb mongosh --eval "db.runCommand({ping: 1})" > /dev/null 2>&1; then
        print_success "MongoDB started successfully"
    else
        print_error "Failed to start MongoDB"
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Frontend dependencies
    print_status "Installing frontend dependencies..."
    cd "$FRONTEND_PATH"
    npm install
    
    # Backend dependencies
    print_status "Installing backend dependencies..."
    cd "$BACKEND_PATH"
    npm install
    
    cd "$PROJECT_ROOT"
    print_success "Dependencies installed"
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    # Backend tests
    print_status "Running backend tests..."
    cd "$BACKEND_PATH"
    npm test
    
    # Frontend tests
    print_status "Running frontend tests..."
    cd "$FRONTEND_PATH"
    npm test -- --watchAll=false
    
    cd "$PROJECT_ROOT"
    print_success "All tests passed"
}

# Build applications
build_applications() {
    print_status "Building applications..."
    
    # Backend build
    print_status "Building backend..."
    cd "$BACKEND_PATH"
    npm run build
    
    # Frontend build
    print_status "Building frontend..."
    cd "$FRONTEND_PATH"
    npm run build
    
    cd "$PROJECT_ROOT"
    print_success "Applications built successfully"
}

# Start services
start_services() {
    print_status "Starting services..."
    
    # Start backend
    print_status "Starting backend service..."
    cd "$BACKEND_PATH"
    npm start &
    BACKEND_PID=$!
    
    # Wait for backend to start
    print_status "Waiting for backend to start..."
    sleep 5
    
    # Check backend health
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        print_success "Backend started successfully"
    else
        print_error "Backend failed to start"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
    
    # Start frontend
    print_status "Starting frontend service..."
    cd "$FRONTEND_PATH"
    npm start &
    FRONTEND_PID=$!
    
    # Wait for frontend to start
    print_status "Waiting for frontend to start..."
    sleep 10
    
    # Check frontend health
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend started successfully"
    else
        print_error "Frontend failed to start"
        kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
        exit 1
    fi
    
    # Save PIDs for cleanup
    echo $BACKEND_PID > "$PROJECT_ROOT/.backend.pid"
    echo $FRONTEND_PID > "$PROJECT_ROOT/.frontend.pid"
    
    print_success "All services started"
}

# Run health checks
run_health_checks() {
    print_status "Running health checks..."
    
    # Backend health check
    print_status "Checking backend health..."
    BACKEND_HEALTH=$(curl -s http://localhost:3001/health)
    if echo "$BACKEND_HEALTH" | grep -q "healthy"; then
        print_success "Backend health check passed"
    else
        print_error "Backend health check failed"
        return 1
    fi
    
    # Frontend health check
    print_status "Checking frontend health..."
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend health check passed"
    else
        print_error "Frontend health check failed"
        return 1
    fi
    
    # API connectivity check
    print_status "Checking API connectivity..."
    API_RESPONSE=$(curl -s http://localhost:3001/api/agreements)
    if echo "$API_RESPONSE" | grep -q "agreements"; then
        print_success "API connectivity check passed"
    else
        print_warning "API connectivity check returned unexpected response"
    fi
    
    print_success "All health checks passed"
}

# Run integration tests
run_integration_tests() {
    print_status "Running integration tests..."
    
    cd "$BACKEND_PATH"
    npm run test:integration
    
    print_success "Integration tests passed"
}

# Stop services
stop_services() {
    print_status "Stopping services..."
    
    # Stop backend
    if [ -f "$PROJECT_ROOT/.backend.pid" ]; then
        BACKEND_PID=$(cat "$PROJECT_ROOT/.backend.pid")
        if kill -0 $BACKEND_PID 2>/dev/null; then
            kill $BACKEND_PID
            print_success "Backend stopped"
        fi
        rm "$PROJECT_ROOT/.backend.pid"
    fi
    
    # Stop frontend
    if [ -f "$PROJECT_ROOT/.frontend.pid" ]; then
        FRONTEND_PID=$(cat "$PROJECT_ROOT/.frontend.pid")
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            kill $FRONTEND_PID
            print_success "Frontend stopped"
        fi
        rm "$PROJECT_ROOT/.frontend.pid"
    fi
    
    # Stop MongoDB
    if docker ps | grep -q agreeproof-mongodb; then
        docker stop agreeproof-mongodb
        docker rm agreeproof-mongodb
        print_success "MongoDB stopped"
    fi
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    stop_services
    print_success "Cleanup completed"
}

# Set up signal handlers
trap cleanup EXIT INT TERM

# Main deployment function
deploy_local() {
    log "Starting local deployment..."
    
    check_prerequisites
    setup_environment
    start_mongodb
    install_dependencies
    run_tests
    build_applications
    start_services
    run_health_checks
    run_integration_tests
    
    print_success "🎉 Local deployment completed successfully!"
    print_status "Frontend: http://localhost:3000"
    print_status "Backend: http://localhost:3001"
    print_status "Health: http://localhost:3001/health"
    print_status "Press Ctrl+C to stop all services"
    
    # Keep script running
    while true; do
        sleep 1
    done
}

# Show usage
show_usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  deploy     Deploy and start all services"
    echo "  stop       Stop all services"
    echo "  test       Run tests only"
    echo "  build      Build applications only"
    echo "  health     Run health checks only"
    echo "  cleanup    Clean up all resources"
    echo "  help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy    # Deploy and start all services"
    echo "  $0 stop      # Stop all services"
    echo "  $0 test      # Run tests only"
}

# Parse command line arguments
case "${1:-deploy}" in
    deploy)
        deploy_local
        ;;
    stop)
        stop_services
        ;;
    test)
        check_prerequisites
        install_dependencies
        run_tests
        ;;
    build)
        check_prerequisites
        install_dependencies
        build_applications
        ;;
    health)
        run_health_checks
        ;;
    cleanup)
        cleanup
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        print_error "Unknown command: $1"
        show_usage
        exit 1
        ;;
esac