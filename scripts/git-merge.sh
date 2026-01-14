#!/bin/bash

# AgreeProof Git Merge Script
# This script handles safe merging workflows for collaborative development

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

# Function to check if working directory is clean
check_clean_working_dir() {
    if ! git diff --quiet || ! git diff --cached --quiet; then
        print_error "Working directory is not clean. Please commit or stash changes first."
        print_status "Uncommitted changes:"
        git status --porcelain
        exit 1
    fi
}

# Function to fetch latest changes
fetch_latest() {
    print_status "Fetching latest changes from remote..."
    git fetch origin
    print_success "Latest changes fetched"
}

# Function to check if branch is up to date
check_branch_up_to_date() {
    local branch=$1
    local local_commit=$(git rev-parse "$branch")
    local remote_commit=$(git rev-parse "origin/$branch")
    
    if [ "$local_commit" != "$remote_commit" ]; then
        print_warning "Branch $branch is not up to date with remote"
        print_status "Local:  $local_commit"
        print_status "Remote: $remote_commit"
        return 1
    fi
    
    return 0
}

# Function to run pre-merge checks
run_pre_merge_checks() {
    local source_branch=$1
    local target_branch=$2
    
    print_status "Running pre-merge checks..."
    
    # Check if source branch exists
    if ! git rev-parse --verify "$source_branch" >/dev/null 2>&1; then
        print_error "Source branch $source_branch does not exist"
        exit 1
    fi
    
    # Check if target branch exists
    if ! git rev-parse --verify "$target_branch" >/dev/null 2>&1; then
        print_error "Target branch $target_branch does not exist"
        exit 1
    fi
    
    # Check for conflicts before merging
    print_status "Checking for potential conflicts..."
    if git merge-tree "$(git merge-base "$target_branch" "$source_branch")" "$target_branch" "$source_branch" | grep -q "^<<<<<<<"; then
        print_error "Potential merge conflicts detected. Please resolve conflicts manually."
        exit 1
    fi
    
    print_success "Pre-merge checks passed"
}

# Function to run tests before merge
run_pre_merge_tests() {
    local source_branch=$1
    local target_branch=$2
    
    print_status "Running pre-merge tests..."
    
    # Save current branch
    local current_branch=$(git branch --show-current)
    
    # Checkout source branch and run tests
    git checkout "$source_branch"
    
    # Frontend tests
    print_status "Running frontend tests..."
    cd agreeproof-frontend
    if ! npm test -- --watchAll=false --coverage=false; then
        print_error "Frontend tests failed on branch $source_branch"
        git checkout "$current_branch"
        exit 1
    fi
    cd ..
    
    # Backend tests
    print_status "Running backend tests..."
    cd agreeproof-backend
    if ! npm test; then
        print_error "Backend tests failed on branch $source_branch"
        git checkout "$current_branch"
        exit 1
    fi
    cd ..
    
    # Return to original branch
    git checkout "$current_branch"
    
    print_success "Pre-merge tests passed"
}

# Function to merge feature to develop
merge_feature_to_develop() {
    local feature_branch=$1
    
    print_status "Merging feature branch $feature_branch to develop..."
    
    # Checkout develop branch
    git checkout "$DEVELOP_BRANCH"
    
    # Update develop branch
    git pull origin "$DEVELOP_BRANCH"
    
    # Merge feature branch
    git merge "$feature_branch" --no-ff -m "feat: merge $feature_branch to develop"
    
    print_success "Feature merged to develop"
}

# Function to merge develop to main
merge_develop_to_main() {
    print_status "Merging develop branch to main..."
    
    # Checkout main branch
    git checkout "$MAIN_BRANCH"
    
    # Update main branch
    git pull origin "$MAIN_BRANCH"
    
    # Merge develop branch
    git merge "$DEVELOP_BRANCH" --no-ff -m "release: merge develop to main"
    
    print_success "Develop merged to main"
}

# Function to create pull request
create_pull_request() {
    local source_branch=$1
    local target_branch=$2
    local title=$3
    local body=$4
    
    print_status "Creating pull request..."
    
    # Check if GitHub CLI is available
    if ! command -v gh &> /dev/null; then
        print_warning "GitHub CLI not found. Please create pull request manually."
        print_status "Visit: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com\///' | sed 's/\.git$//')/compare/$target_branch...$source_branch"
        return
    fi
    
    # Check if authenticated
    if ! gh auth status &> /dev/null; then
        print_warning "GitHub CLI not authenticated. Please run 'gh auth login' first."
        return
    fi
    
    # Create pull request
    gh pr create \
        --base "$target_branch" \
        --head "$source_branch" \
        --title "$title" \
        --body "$body" \
        --label "automated" \
        --assignee "@me" || print_warning "Pull request may already exist"
    
    print_success "Pull request created"
}

# Function to merge pull request safely
merge_pull_request() {
    local pr_number=$1
    
    print_status "Merging pull request #$pr_number..."
    
    # Check if GitHub CLI is available
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI not found. Cannot merge pull request automatically."
        exit 1
    fi
    
    # Check PR status
    local pr_status=$(gh pr view "$pr_number" --json state,mergeable --jq '.state + " " + .mergeable')
    
    if [[ "$pr_status" != *"OPEN"* ]]; then
        print_error "Pull request #$pr_number is not open"
        exit 1
    fi
    
    if [[ "$pr_status" != *"true"* ]]; then
        print_error "Pull request #$pr_number is not mergeable"
        exit 1
    fi
    
    # Check if all checks passed
    local checks=$(gh pr view "$pr_number" --json statusCheckRollup --jq '.statusCheckRollup | map(select(.state != "SUCCESS")) | length')
    
    if [ "$checks" -gt 0 ]; then
        print_error "Not all status checks have passed. Cannot merge."
        exit 1
    fi
    
    # Merge PR
    gh pr merge "$pr_number" --merge --delete-branch
    
    print_success "Pull request #$pr_number merged"
}

# Function to sync branches
sync_branches() {
    local target_branch=$1
    
    print_status "Syncing $target_branch with remote..."
    
    # Checkout target branch
    git checkout "$target_branch"
    
    # Pull latest changes
    git pull origin "$target_branch"
    
    # Push local changes if any
    if ! git diff --quiet origin/"$target_branch" "$target_branch"; then
        git push origin "$target_branch"
        print_success "Branch $target_branch synced with remote"
    else
        print_status "Branch $target_branch is already up to date"
    fi
}

# Function to cleanup merged branches
cleanup_merged_branches() {
    print_status "Cleaning up merged branches..."
    
    # Get list of merged branches (excluding main and develop)
    local merged_branches=$(git branch --merged | grep -v "^\*" | grep -v "$MAIN_BRANCH" | grep -v "$DEVELOP_BRANCH" | sed 's/^[ \t]*//')
    
    if [ -z "$merged_branches" ]; then
        print_status "No merged branches to clean up"
        return
    fi
    
    print_status "Found merged branches:"
    echo "$merged_branches"
    
    read -p "Delete these branches? (yes/no): " confirm
    
    if [ "$confirm" = "yes" ]; then
        echo "$merged_branches" | xargs -I {} git branch -d {}
        print_success "Merged branches deleted locally"
        
        # Delete from remote
        echo "$merged_branches" | xargs -I {} git push origin --delete {} 2>/dev/null || true
        print_success "Merged branches deleted from remote"
    else
        print_status "Cleanup cancelled"
    fi
}

# Function to show branch status
show_branch_status() {
    print_status "Branch Status:"
    echo ""
    
    # Current branch
    local current_branch=$(git branch --show-current)
    echo "Current branch: $current_branch"
    echo ""
    
    # Branch status
    echo "Branch status:"
    git branch -vv
    echo ""
    
    # Recent commits
    echo "Recent commits:"
    git log --oneline -10
    echo ""
    
    # Pull requests (if GitHub CLI is available)
    if command -v gh &> /dev/null && gh auth status &> /dev/null; then
        echo "Open pull requests:"
        gh pr list --limit 5 || echo "No pull requests found"
        echo ""
    fi
}

# Show usage
show_usage() {
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  feature <branch>      Merge feature branch to develop"
    echo "  release               Merge develop to main (for releases)"
    echo "  pr <source> <target>  Create pull request"
    echo "  merge-pr <number>     Merge pull request (after approval)"
    echo "  sync <branch>         Sync branch with remote"
    echo "  cleanup               Clean up merged branches"
    echo "  status                Show branch status"
    echo "  help                  Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 feature feature/user-auth"
    echo "  $0 release"
    echo "  $0 pr feature/user-auth develop"
    echo "  $0 merge-pr 123"
    echo "  $0 sync main"
}

# Main script logic
case "${1:-help}" in
    feature)
        if [ -z "$2" ]; then
            print_error "Feature branch name is required"
            show_usage
            exit 1
        fi
        
        check_clean_working_dir
        fetch_latest
        run_pre_merge_checks "$2" "$DEVELOP_BRANCH"
        run_pre_merge_tests "$2" "$DEVELOP_BRANCH"
        merge_feature_to_develop "$2"
        
        print_status "Pushing changes to remote..."
        git push origin "$DEVELOP_BRANCH"
        
        # Create PR for main merge
        create_pull_request "$DEVELOP_BRANCH" "$MAIN_BRANCH" "Release: Merge develop to main" "This PR contains changes ready for production release."
        ;;
    release)
        check_clean_working_dir
        fetch_latest
        
        if ! check_branch_up_to_date "$DEVELOP_BRANCH"; then
            print_error "Develop branch is not up to date. Please sync first."
            exit 1
        fi
        
        run_pre_merge_checks "$DEVELOP_BRANCH" "$MAIN_BRANCH"
        run_pre_merge_tests "$DEVELOP_BRANCH" "$MAIN_BRANCH"
        merge_develop_to_main
        
        print_status "Pushing changes to remote..."
        git push origin "$MAIN_BRANCH"
        ;;
    pr)
        if [ -z "$2" ] || [ -z "$3" ]; then
            print_error "Source and target branches are required"
            show_usage
            exit 1
        fi
        
        fetch_latest
        create_pull_request "$2" "$3" "Pull Request: $2 → $3" "Automated pull request created by git-merge.sh"
        ;;
    merge-pr)
        if [ -z "$2" ]; then
            print_error "Pull request number is required"
            show_usage
            exit 1
        fi
        
        fetch_latest
        merge_pull_request "$2"
        ;;
    sync)
        if [ -z "$2" ]; then
            print_error "Branch name is required"
            show_usage
            exit 1
        fi
        
        fetch_latest
        sync_branches "$2"
        ;;
    cleanup)
        fetch_latest
        cleanup_merged_branches
        ;;
    status)
        fetch_latest
        show_branch_status
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