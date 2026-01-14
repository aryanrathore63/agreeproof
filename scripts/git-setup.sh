#!/bin/bash

# AgreeProof Git Setup Script
# This script initializes the Git repository and pushes to GitHub

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

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_status "Initializing Git repository..."
    git init
    print_success "Git repository initialized"
else
    print_status "Git repository already exists"
fi

# Configure Git user if not configured
if [ -z "$(git config user.name)" ]; then
    print_status "Configuring Git user..."
    read -p "Enter your name: " GIT_NAME
    git config user.name "$GIT_NAME"
fi

if [ -z "$(git config user.email)" ]; then
    print_status "Configuring Git email..."
    read -p "Enter your email: " GIT_EMAIL
    git config user.email "$GIT_EMAIL"
fi

# Add remote origin if not exists
if ! git remote get-url origin &> /dev/null; then
    print_status "Adding remote origin..."
    read -p "Enter GitHub repository URL: " REPO_URL
    git remote add origin "$REPO_URL"
    print_success "Remote origin added"
else
    print_status "Remote origin already exists"
fi

# Stage all files
print_status "Staging all files..."
git add .

# Check if there are files to commit
if git diff --cached --quiet; then
    print_warning "No files to commit"
else
    # Create initial commit
    print_status "Creating initial commit..."
    git commit -m "feat: initial commit - AgreeProof project setup

- Initialize Git repository with comprehensive .gitignore
- Set up GitHub Actions workflows for CI/CD
- Configure frontend and backend deployment pipelines
- Add pull request validation workflows
- Set up development and production environment templates
- Add comprehensive documentation and guides

This commit includes:
- Frontend: React + TypeScript + Tailwind CSS setup
- Backend: Node.js + Express + MongoDB setup
- Database: MongoDB Atlas configuration and indexes
- Deployment: Vercel (frontend) and Render (backend) configurations
- Testing: Jest and React Testing Library setup
- Security: CORS, rate limiting, and input validation
- Documentation: API docs, deployment guides, and user guides"

    print_success "Initial commit created"
fi

# Push to GitHub
print_status "Pushing to GitHub..."
git push -u origin main
print_success "Code pushed to GitHub"

# Set up branch protection (requires GitHub CLI)
if command -v gh &> /dev/null; then
    print_status "Setting up branch protection rules..."
    
    # Check if authenticated with GitHub CLI
    if gh auth status &> /dev/null; then
        # Enable branch protection for main branch
        gh api repos/:owner/:repo/branches/main/protection \
          --method PUT \
          --field required_status_checks='{"strict":true,"contexts":["CI"]}' \
          --field enforce_admins=true \
          --field required_pull_request_reviews='{"required_approving_review_count":1}' \
          --field restrictions=null || print_warning "Could not set up branch protection (may require admin rights)"
        
        print_success "Branch protection rules configured"
    else
        print_warning "GitHub CLI not authenticated. Skipping branch protection setup."
        print_status "To set up branch protection manually, visit: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com\///' | sed 's/\.git$//')/settings/branches"
    fi
else
    print_warning "GitHub CLI not found. Install it to automate branch protection setup."
    print_status "Install with: curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg"
fi

print_success "Git setup completed successfully!"
echo ""
print_status "Next steps:"
echo "1. Visit your GitHub repository"
echo "2. Configure branch protection rules if not set automatically"
echo "3. Set up required secrets in GitHub Settings > Secrets and variables > Actions"
echo "4. Configure deployment platforms (Vercel and Render)"
echo ""
print_status "Required GitHub secrets:"
echo "- VERCEL_TOKEN"
echo "- RENDER_API_KEY"
echo "- MONGODB_URI"
echo "- JWT_SECRET"
echo "- DOCKER_USERNAME"
echo "- DOCKER_PASSWORD"
echo "- And others as specified in the workflow files"