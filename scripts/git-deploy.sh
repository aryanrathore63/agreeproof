#!/bin/bash

# AgreeProof Git Deployment Script
# This script handles the deployment workflow for production releases

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Configuration
MAIN_BRANCH="main"
DEVELOP_BRANCH="develop"

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not in a Git repository. Please run git-setup.sh first."
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
print_status "Current branch: $CURRENT_BRANCH"

# Function to check if working directory is clean
check_clean_working_dir() {
    if ! git diff --quiet || ! git diff --cached --quiet; then
        print_error "Working directory is not clean. Please commit or stash changes first."
        exit 1
    fi
}

# Function to run tests locally
run_local_tests() {
    print_status "Running local tests..."
    
    # Frontend tests
    print_status "Running frontend tests..."
    cd agreeproof-frontend
    if ! npm test -- --watchAll=false --coverage=false; then
        print_error "Frontend tests failed"
        exit 1
    fi
    cd ..
    
    # Backend tests
    print_status "Running backend tests..."
    cd agreeproof-backend
    if ! npm test; then
        print_error "Backend tests failed"
        exit 1
    fi
    cd ..
    
    print_success "All tests passed"
}

# Function to build applications
build_applications() {
    print_status "Building applications..."
    
    # Frontend build
    print_status "Building frontend..."
    cd agreeproof-frontend
    if ! npm run build:production; then
        print_error "Frontend build failed"
        exit 1
    fi
    cd ..
    
    # Backend build (Docker)
    print_status "Building backend Docker image..."
    cd agreeproof-backend
    if ! docker build -t agreeproof-backend:local .; then
        print_error "Backend Docker build failed"
        exit 1
    fi
    cd ..
    
    print_success "All builds completed successfully"
}

# Function to create release branch
create_release_branch() {
    local version=$1
    local release_branch="release/v$version"
    
    print_status "Creating release branch: $release_branch"
    git checkout -b "$release_branch"
    
    # Update version numbers
    print_status "Updating version numbers to v$version"
    
    # Update frontend package.json
    cd agreeproof-frontend
    npm version "$version" --no-git-tag-version
    cd ..
    
    # Update backend package.json
    cd agreeproof-backend
    npm version "$version" --no-git-tag-version
    cd ..
    
    # Commit version updates
    git add .
    git commit -m "chore: bump version to v$version"
    
    print_success "Release branch created and version updated"
}

# Function to merge to main
merge_to_main() {
    local version=$1
    local release_branch="release/v$version"
    
    print_status "Merging release branch to main..."
    
    # Switch to main branch
    git checkout "$MAIN_BRANCH"
    git pull origin "$MAIN_BRANCH"
    
    # Merge release branch
    git merge "$release_branch" --no-ff -m "release: merge v$version to main"
    
    # Tag the release
    git tag -a "v$version" -m "Release v$version"
    
    print_success "Release merged to main and tagged"
}

# Function to push to GitHub
push_to_github() {
    local version=$1
    
    print_status "Pushing to GitHub..."
    
    # Push main branch and tags
    git push origin "$MAIN_BRANCH"
    git push origin "v$version"
    
    print_success "Pushed to GitHub"
}

# Function to cleanup
cleanup() {
    local version=$1
    local release_branch="release/v$version"
    
    print_status "Cleaning up..."
    
    # Switch back to develop branch
    git checkout "$DEVELOP_BRANCH" 2>/dev/null || git checkout "$MAIN_BRANCH"
    
    # Delete release branch locally
    git branch -D "$release_branch" 2>/dev/null || true
    
    print_success "Cleanup completed"
}

# Function to show deployment status
show_deployment_status() {
    local version=$1
    
    print_success "Deployment initiated for v$version"
    echo ""
    print_status "Deployment progress can be monitored at:"
    echo "GitHub Actions: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com\///' | sed 's/\.git$//')/actions"
    echo ""
    print_status "After deployment:"
    echo "Frontend will be available at: https://your-vercel-app.vercel.app"
    echo "Backend will be available at: https://your-render-app.onrender.com"
    echo ""
    print_status "Monitor the deployment logs for any issues."
}

# Main deployment function
deploy_production() {
    local version=$1
    
    if [ -z "$version" ]; then
        print_error "Version number is required. Usage: $0 deploy <version>"
        exit 1
    fi
    
    print_status "Starting production deployment for v$version"
    
    # Validate version format (semver)
    if ! [[ $version =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        print_error "Invalid version format. Use semantic versioning (e.g., 1.0.0)"
        exit 1
    fi
    
    # Check prerequisites
    check_clean_working_dir
    run_local_tests
    build_applications
    
    # Create release branch
    create_release_branch "$version"
    
    # Merge to main
    merge_to_main "$version"
    
    # Push to GitHub (this will trigger deployment)
    push_to_github "$version"
    
    # Show status
    show_deployment_status "$version"
    
    # Cleanup
    cleanup "$version"
}

# Function to deploy hotfix
deploy_hotfix() {
    local version=$1
    local hotfix_branch="hotfix/v$version"
    
    print_status "Starting hotfix deployment for v$version"
    
    if [ -z "$version" ]; then
        print_error "Version number is required. Usage: $0 hotfix <version>"
        exit 1
    fi
    
    # Create hotfix branch from main
    git checkout "$MAIN_BRANCH"
    git pull origin "$MAIN_BRANCH"
    git checkout -b "$hotfix_branch"
    
    print_status "Created hotfix branch: $hotfix_branch"
    print_status "Make your changes, then run: $0 deploy-hotfix-complete $version"
}

# Function to complete hotfix deployment
deploy_hotfix_complete() {
    local version=$1
    local hotfix_branch="hotfix/v$version"
    
    print_status "Completing hotfix deployment for v$version"
    
    # Check prerequisites
    check_clean_working_dir
    run_local_tests
    build_applications
    
    # Merge hotfix to main
    merge_to_main "$version"
    
    # Also merge to develop
    git checkout "$DEVELOP_BRANCH" 2>/dev/null || git checkout "$MAIN_BRANCH"
    git pull origin "$DEVELOP_BRANCH" 2>/dev/null || true
    git merge "$hotfix_branch" --no-ff -m "chore: merge hotfix v$version to develop"
    
    # Push to GitHub
    push_to_github "$version"
    
    # Push develop branch if it exists
    if git rev-parse --verify "$DEVELOP_BRANCH" >/dev/null 2>&1; then
        git push origin "$DEVELOP_BRANCH"
    fi
    
    # Show status
    show_deployment_status "$version"
    
    # Cleanup
    cleanup "$version"
}

# Function to rollback
rollback() {
    local version=$1
    
    print_status "Rolling back to v$version"
    
    if [ -z "$version" ]; then
        print_error "Version number is required. Usage: $0 rollback <version>"
        exit 1
    fi
    
    # Check if tag exists
    if ! git rev-parse "v$version" >/dev/null 2>&1; then
        print_error "Tag v$version does not exist"
        exit 1
    fi
    
    # Create rollback branch
    git checkout -b "rollback/v$version" "v$version"
    
    # Force push to main (DANGEROUS - requires confirmation)
    print_warning "This will force push to main branch and overwrite current deployment"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        print_status "Rollback cancelled"
        exit 0
    fi
    
    git push -f origin "rollback/v$version:$MAIN_BRANCH"
    
    print_success "Rollback completed. Deployment will be triggered for v$version"
}

# Show usage
show_usage() {
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  deploy <version>     Deploy to production (creates release branch, merges to main)"
    echo "  hotfix <version>     Start hotfix from main branch"
    echo "  deploy-hotfix-complete <version>  Complete hotfix deployment"
    echo "  rollback <version>   Rollback to previous version"
    echo "  status              Show current deployment status"
    echo "  help                Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy 1.0.0"
    echo "  $0 hotfix 1.0.1"
    echo "  $0 rollback 0.9.0"
}

# Main script logic
case "${1:-help}" in
    deploy)
        deploy_production "$2"
        ;;
    hotfix)
        deploy_hotfix "$2"
        ;;
    deploy-hotfix-complete)
        deploy_hotfix_complete "$2"
        ;;
    rollback)
        rollback "$2"
        ;;
    status)
        print_status "Current branch: $(git branch --show-current)"
        print_status "Latest tag: $(git describe --tags --abbrev=0)"
        print_status "Remote URL: $(git remote get-url origin)"
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