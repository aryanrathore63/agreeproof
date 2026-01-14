# AgreeProof GitHub Workflow Guide

This comprehensive guide covers the complete GitHub workflow setup for the AgreeProof project, including branch strategy, deployment processes, and best practices for collaborative development.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Repository Setup](#repository-setup)
3. [Branch Strategy](#branch-strategy)
4. [Pull Request Process](#pull-request-process)
5. [Deployment Workflow](#deployment-workflow)
6. [GitHub Actions Workflows](#github-actions-workflows)
7. [Environment Configuration](#environment-configuration)
8. [Git Scripts Usage](#git-scripts-usage)
9. [Branch Protection Rules](#branch-protection-rules)
10. [Troubleshooting](#troubleshooting)
11. [Best Practices](#best-practices)

## 🎯 Overview

The AgreeProof project uses a production-ready Git workflow that ensures:
- **Code Quality**: Automated testing and code reviews
- **Security**: Vulnerability scanning and dependency checks
- **Reliability**: Staged deployments with rollback capabilities
- **Collaboration**: Clear branch strategy and PR processes
- **Automation**: CI/CD pipelines for testing and deployment

## 🚀 Repository Setup

### Initial Setup

1. **Clone or initialize the repository**:
   ```bash
   git clone https://github.com/your-org/agreeproof.git
   cd agreeproof
   ```

2. **Run the setup script**:
   ```bash
   chmod +x scripts/git-setup.sh
   ./scripts/git-setup.sh
   ```

3. **Configure GitHub secrets**:
   - Copy `.github/secrets.template.md` for reference
   - Add all required secrets to GitHub repository settings
   - See [Environment Configuration](#environment-configuration)

### Required Tools

- **Git**: Version 2.30 or higher
- **GitHub CLI**: For automated branch protection setup
- **Node.js**: Version 18 or higher
- **Docker**: For local development and testing

## 🌿 Branch Strategy

### Branch Types

```
main                    # Production-ready code
├── develop            # Integration branch for features
├── feature/*          # Feature development branches
├── hotfix/*           # Production hotfixes
├── release/*          # Release preparation branches
└── bugfix/*           # Bug fix branches
```

### Branch Rules

| Branch | Purpose | Protection | Deployment |
|--------|---------|------------|------------|
| `main` | Production code | ✅ Required | ✅ Production |
| `develop` | Integration | ✅ Required | ❌ No deployment |
| `feature/*` | New features | ❌ Optional | ❌ No deployment |
| `hotfix/*` | Production fixes | ❌ Optional | ✅ Production |
| `release/*` | Release prep | ❌ Optional | ✅ Staging |

### Branch Naming Conventions

- **Features**: `feature/description-of-feature`
- **Bug fixes**: `bugfix/description-of-fix`
- **Hotfixes**: `hotfix/version-description`
- **Releases**: `release/vX.Y.Z`

Examples:
- `feature/user-authentication`
- `bugfix/email-validation`
- `hotfix/v1.0.1-security-patch`
- `release/v1.2.0`

## 🔄 Pull Request Process

### PR Creation

1. **Create feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and commit**:
   ```bash
   git add .
   git commit -m "feat: implement user authentication"
   ```

3. **Push and create PR**:
   ```bash
   git push origin feature/your-feature-name
   # Create PR via GitHub UI or CLI
   ```

### PR Template

```markdown
## Description
Brief description of changes and their purpose.

## Changes
- [ ] New feature implementation
- [ ] Bug fixes
- [ ] Documentation updates
- [ ] Test coverage

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing (if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No breaking changes (or documented)

## Screenshots
Add screenshots if UI changes are included.

## Additional Notes
Any additional information for reviewers.
```

### PR Review Process

1. **Automated Checks**:
   - All tests must pass
   - Code quality checks must pass
   - Security scans must pass
   - Build must succeed

2. **Manual Review**:
   - At least one team member approval required
   - Code review for logic and best practices
   - Security review for sensitive changes
   - Performance review for optimization changes

3. **Merge Requirements**:
   - All status checks must pass
   - At least one approval required
   - No merge conflicts
   - Up-to-date with target branch

## 🚀 Deployment Workflow

### Deployment Triggers

Deployments are triggered automatically when code is merged to the `main` branch:

```
Feature Branch → Develop Branch → Main Branch → Production Deployment
```

### Deployment Environments

| Environment | Branch | URL | Purpose |
|-------------|--------|-----|---------|
| Development | `feature/*` | localhost | Local development |
| Staging | `release/*` | staging.agreeproof.com | Pre-production testing |
| Production | `main` | agreeproof.com | Live production |

### Deployment Process

1. **Code merged to main** → Triggers GitHub Actions
2. **Automated tests run** → Validates code quality
3. **Build applications** → Creates production builds
4. **Security scans** → Checks for vulnerabilities
5. **Deploy to production** → Pushes to Vercel/Render
6. **Post-deployment tests** → Validates deployment
7. **Notifications** → Sends success/failure alerts

### Rollback Process

If deployment fails:

1. **Automatic rollback** (if configured)
2. **Manual rollback**:
   ```bash
   ./scripts/git-deploy.sh rollback v1.0.0
   ```
3. **Investigate issues** in deployment logs
4. **Fix and redeploy** with hotfix if needed

## ⚙️ GitHub Actions Workflows

### Workflow Files

| File | Purpose | Triggers |
|------|---------|----------|
| `frontend-deploy.yml` | Frontend CI/CD | Push to main, PR to main |
| `backend-deploy.yml` | Backend CI/CD | Push to main, PR to main |
| `pr-validation.yml` | PR validation | PR creation/update |

### Workflow Jobs

#### Frontend Deployment
- **Test**: Unit tests, integration tests, type checking
- **Build**: Production build with optimization
- **Security**: Vulnerability scanning, dependency audit
- **Deploy**: Deploy to Vercel (production) or preview
- **Performance**: Lighthouse CI for performance testing

#### Backend Deployment
- **Test**: Unit tests, integration tests with MongoDB
- **Security**: Security scanning, npm audit
- **Build**: Docker image creation and push
- **Deploy**: Deploy to Render (production/staging)
- **Performance**: Load testing with Artillery

#### PR Validation
- **Code Quality**: Linting, formatting, style checks
- **Security**: Trivy scanning, dependency checks
- **Testing**: Full test suite execution
- **Build**: Validation that applications build successfully

### Workflow Monitoring

- **GitHub Actions Dashboard**: Monitor workflow runs
- **Slack Notifications**: Real-time deployment alerts
- **Email Notifications**: Critical failure alerts
- **Logs**: Detailed logs for troubleshooting

## 🌍 Environment Configuration

### Environment Files

| File | Purpose | Usage |
|------|---------|-------|
| `.env.development.example` | Development template | Local development |
| `.env.staging.example` | Staging template | Staging environment |
| `.env.production.example` | Production template | Production environment |

### Required Secrets

See `.github/secrets.template.md` for complete list of required GitHub secrets.

### Environment Setup

1. **Development**:
   ```bash
   cp .env.development.example .env.development
   # Edit .env.development with local values
   ```

2. **Staging**:
   - Configure staging secrets in GitHub
   - Use staging environment variables

3. **Production**:
   - Configure production secrets in GitHub
   - Use production environment variables

## 🛠️ Git Scripts Usage

### git-setup.sh

Initial repository setup and GitHub configuration.

```bash
./scripts/git-setup.sh
```

**Features**:
- Initialize Git repository
- Configure Git user settings
- Add remote origin
- Create initial commit
- Set up branch protection (with GitHub CLI)

### git-deploy.sh

Deployment workflow management.

```bash
# Deploy new version
./scripts/git-deploy.sh deploy 1.0.0

# Start hotfix
./scripts/git-deploy.sh hotfix 1.0.1

# Complete hotfix
./scripts/git-deploy.sh deploy-hotfix-complete 1.0.1

# Rollback to previous version
./scripts/git-deploy.sh rollback 0.9.0

# Show status
./scripts/git-deploy.sh status
```

### git-merge.sh

Safe merge workflow management.

```bash
# Merge feature to develop
./scripts/git-merge.sh feature user-authentication

# Merge develop to main (release)
./scripts/git-merge.sh release

# Create pull request
./scripts/git-merge.sh pr feature/user-authentication develop

# Merge pull request
./scripts/git-merge.sh merge-pr 123

# Sync branch with remote
./scripts/git-merge.sh sync main

# Clean up merged branches
./scripts/git-merge.sh cleanup

# Show branch status
./scripts/git-merge.sh status
```

## 🔒 Branch Protection Rules

### Main Branch Protection

**Required Settings**:
- ✅ Require pull request reviews before merging
- ✅ Require approvals from 1 reviewer
- ✅ Dismiss stale PR approvals when new commits are pushed
- ✅ Require review from Code Owners
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Require conversation resolution before merging

**Required Status Checks**:
- `Test Frontend` (from frontend-deploy.yml)
- `Test Backend` (from backend-deploy.yml)
- `Security Scan` (from both workflows)
- `Code Quality` (from pr-validation.yml)
- `Build Validation` (from pr-validation.yml)

### Develop Branch Protection

**Required Settings**:
- ✅ Require pull request reviews before merging
- ✅ Require approvals from 1 reviewer
- ✅ Require status checks to pass before merging

**Required Status Checks**:
- `Test Frontend`
- `Test Backend`
- `Code Quality`

### Configuration Steps

1. **Go to repository settings**
2. **Navigate to Branches**
3. **Add branch protection rule for `main`**
4. **Configure settings as listed above**
5. **Add branch protection rule for `develop`**
6. **Configure settings as listed above**

### Automated Setup

With GitHub CLI:
```bash
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["Test Frontend","Test Backend","Security Scan","Code Quality","Build Validation"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":true}' \
  --field restrictions=null
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Workflow Failures

**Problem**: GitHub Actions workflow fails
**Solution**:
- Check workflow logs for specific error messages
- Verify all required secrets are configured
- Ensure branch protection rules are met
- Check for merge conflicts

#### 2. Deployment Failures

**Problem**: Deployment to Vercel/Render fails
**Solution**:
- Check deployment platform logs
- Verify environment variables
- Ensure build process completes successfully
- Check for API key/authentication issues

#### 3. Merge Conflicts

**Problem**: Pull request has merge conflicts
**Solution**:
```bash
git checkout main
git pull origin main
git checkout feature/your-branch
git merge main
# Resolve conflicts
git add .
git commit -m "resolve merge conflicts"
git push origin feature/your-branch
```

#### 4. Secret Issues

**Problem**: Secrets not accessible in workflows
**Solution**:
- Verify secret names match exactly
- Check secret values are correct
- Ensure GitHub Actions has permissions
- Review audit logs for access issues

### Debug Commands

```bash
# Check Git status
git status

# Check remote configuration
git remote -v

# Check branch protection
gh api repos/:owner/:repo/branches/main/protection

# List workflows
gh workflow list

# Check workflow runs
gh run list

# View specific workflow
gh run view <run-id>

# Re-run failed workflow
gh run rerun <run-id>
```

### Getting Help

1. **Check workflow logs** in GitHub Actions tab
2. **Review this documentation** for common solutions
3. **Create an issue** in the repository
4. **Contact maintainers** for urgent issues
5. **Check GitHub Status** for platform issues

## 📚 Best Practices

### Development Workflow

1. **Create feature branches** from `develop`
2. **Commit frequently** with descriptive messages
3. **Run tests locally** before pushing
4. **Create pull requests** early for feedback
5. **Address review comments** promptly
6. **Keep branches updated** with main/develop

### Commit Message Format

Use conventional commits:
```
type(scope): description

feat(auth): add user authentication
fix(api): resolve email validation bug
docs(readme): update installation instructions
test(auth): add unit tests for login
refactor(db): optimize query performance
```

### Code Quality

1. **Follow linting rules** for consistent code style
2. **Write comprehensive tests** for new features
3. **Document complex logic** with comments
4. **Review security implications** of changes
5. **Consider performance impact** of modifications

### Security Practices

1. **Never commit secrets** to version control
2. **Use environment variables** for configuration
3. **Review dependencies** regularly for vulnerabilities
4. **Implement proper authentication** and authorization
5. **Validate all user inputs** and sanitize data

### Collaboration

1. **Communicate changes** with team members
2. **Review pull requests** thoroughly
3. **Provide constructive feedback**
4. **Help troubleshoot issues** together
5. **Share knowledge** and best practices

## 📞 Support and Resources

### Documentation

- **Project README**: Overview and quick start
- **API Documentation**: Backend API reference
- **Deployment Guide**: Detailed deployment instructions
- **Development Guide**: Local development setup

### Tools and Resources

- **GitHub Documentation**: https://docs.github.com/
- **GitHub Actions Documentation**: https://docs.github.com/en/actions
- **Conventional Commits**: https://www.conventionalcommits.org/
- **Semantic Versioning**: https://semver.org/

### Community

- **GitHub Issues**: Report bugs and request features
- **GitHub Discussions**: Ask questions and share ideas
- **Slack Channel**: Real-time team communication
- **Email Support**: support@agreeproof.com

---

## 🎉 Quick Start Summary

1. **Clone repository** and run `./scripts/git-setup.sh`
2. **Configure GitHub secrets** using `.github/secrets.template.md`
3. **Set up branch protection** rules in repository settings
4. **Create feature branch** and start development
5. **Submit pull request** for code review
6. **Merge to main** for automatic deployment

For detailed instructions, refer to the specific sections in this guide.

**Happy coding! 🚀**