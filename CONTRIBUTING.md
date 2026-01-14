# Contributing to AgreeProof

Thank you for your interest in contributing to AgreeProof! This document provides guidelines and information for contributors to help ensure a smooth and effective collaboration process.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Git Workflow](#git-workflow)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)
- [Community Guidelines](#community-guidelines)

## Code of Conduct

### Our Pledge

We are committed to making participation in our project a harassment-free experience for everyone, regardless of level of experience, gender, gender identity and expression, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, religion, or nationality.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- The use of sexualized language or imagery
- Personal attacks or political harassment
- Public or private harassment
- Publishing others' private information without explicit permission
- Any other conduct which could reasonably be considered inappropriate

### Enforcement

Project maintainers have the right and responsibility to remove, edit, or reject comments, commits, code, wiki edits, issues, and other contributions that are not aligned with this Code of Conduct.

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js (v18 or higher)
- npm or yarn package manager
- Git installed and configured
- MongoDB (for local development)
- Basic knowledge of React, TypeScript, Node.js, and Express

### Setup Instructions

1. **Fork the Repository**
   ```bash
   # Fork the repository on GitHub
   # Clone your fork locally
   git clone https://github.com/your-username/agreeproof.git
   cd agreeproof
   ```

2. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/original-owner/agreeproof.git
   ```

3. **Install Dependencies**
   ```bash
   # Backend dependencies
   cd agreeproof-backend
   npm install
   
   # Frontend dependencies
   cd ../agreeproof-frontend
   npm install
   ```

4. **Environment Setup**
   ```bash
   # Copy environment files
   cp agreeproof-backend/.env.example agreeproof-backend/.env
   cp agreeproof-frontend/.env.example agreeproof-frontend/.env
   
   # Configure your environment variables
   ```

5. **Start Development Servers**
   ```bash
   # Backend (in one terminal)
   cd agreeproof-backend
   npm run dev
   
   # Frontend (in another terminal)
   cd agreeproof-frontend
   npm start
   ```

## 🔄 Git Workflow

### Branch Strategy

AgreeProof follows a simplified Git workflow designed for collaborative development:

- **`main`**: Production-ready code (protected branch)
- **`develop`**: Integration branch for features (optional)
- **`feature/*`**: Feature branches for new development
- **`fix/*`**: Bug fix branches
- `hotfix/*`: Emergency fixes for production issues

### Git Setup

```bash
# Initialize repository and push to GitHub
chmod +x scripts/git-setup.sh
./scripts/git-setup.sh

# Add upstream remote (if you forked)
git remote add upstream https://github.com/original-owner/agreeproof.git
```

### Branch Management

```bash
# Sync with latest changes
git fetch upstream
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# After completing work
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

### Deployment Workflow

1. **Development**: Work on feature branches
2. **Testing**: Create pull requests to `main`
3. **Validation**: Automated tests and CI/CD checks run
4. **Deployment**: Automatic deployment to production on merge to `main`

### Git Scripts

Use the provided scripts for common Git operations:

- [`scripts/git-setup.sh`](scripts/git-setup.sh) - Initialize repository and push to GitHub
- [`scripts/git-deploy.sh`](scripts/git-deploy.sh) - Handle deployment workflow
- [`scripts/git-merge.sh`](scripts/git-merge.sh) - Safe merge to production

For detailed Git workflow instructions, see [GITHUB_WORKFLOW.md](GITHUB_WORKFLOW.md).

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
# Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### Branch Naming Convention

- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/documentation-update` - Documentation changes
- `refactor/code-refactoring` - Code refactoring
- `test/test-improvements` - Test improvements
- `chore/maintenance` - Maintenance tasks

### 2. Make Changes

- Follow the coding standards outlined below
- Write tests for new functionality
- Update documentation as needed
- Commit changes with clear messages

### 3. Commit Messages

Use clear and descriptive commit messages following conventional commits:

```
type(scope): brief description

Detailed description (optional)

- bullet point for specific changes
- another bullet point
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Maintenance

**Examples:**
```
feat(auth): add JWT token refresh mechanism

- Implement automatic token refresh
- Add refresh token storage
- Update authentication middleware

fix(api): resolve agreement creation validation error

- Fix email validation regex
- Add proper error handling
- Update test cases
```

### 4. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create pull request on GitHub targeting main branch
```

## Coding Standards

### General Guidelines

- **Write clean, readable, and maintainable code**
- **Follow existing code patterns and conventions**
- **Keep functions small and focused on a single responsibility**
- **Use meaningful variable and function names**
- **Add comments for complex logic**

### Frontend (React + TypeScript)

```typescript
// Use TypeScript interfaces for type definitions
interface Agreement {
  id: string;
  title: string;
  content: string;
  parties: Party[];
  createdAt: Date;
}

// Use functional components with hooks
const AgreementCard: React.FC<AgreementCardProps> = ({ agreement }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Component logic here
  
  return (
    <div className="agreement-card">
      {/* JSX content */}
    </div>
  );
};

// Use proper prop types
interface AgreementCardProps {
  agreement: Agreement;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}
```

### Backend (Node.js + Express)

```javascript
// Use async/await for asynchronous operations
const createAgreement = async (req, res) => {
  try {
    const { title, content, parties } = req.body;
    
    // Validate input
    if (!title || !content) {
      return res.status(400).json({
        error: 'Title and content are required'
      });
    }
    
    // Create agreement
    const agreement = new Agreement({
      title,
      content,
      parties,
      proofHash: generateProofHash(content)
    });
    
    await agreement.save();
    
    res.status(201).json({
      success: true,
      data: agreement
    });
  } catch (error) {
    console.error('Error creating agreement:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};
```

### Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings, double quotes for JSX
- **Semicolons**: Always use semicolons
- **Line Length**: Maximum 100 characters
- **File Naming**: PascalCase for components, camelCase for utilities

### ESLint and Prettier

We use ESLint and Prettier for code formatting:

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## Testing Guidelines

### Test Coverage

- Aim for **80%+ test coverage**
- Write unit tests for all functions and components
- Write integration tests for API endpoints
- Write end-to-end tests for critical user flows

### Frontend Testing

```typescript
// Component testing with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { CreateAgreementForm } from './CreateAgreementForm';

describe('CreateAgreementForm', () => {
  it('should render form fields correctly', () => {
    render(<CreateAgreementForm />);
    
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
  });
  
  it('should submit form with valid data', async () => {
    const mockSubmit = jest.fn();
    render(<CreateAgreementForm onSubmit={mockSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Agreement' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /create/i }));
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        title: 'Test Agreement',
        // ... other fields
      });
    });
  });
});
```

### Backend Testing

```javascript
// API endpoint testing with Jest and Supertest
const request = require('supertest');
const app = require('../src/app');

describe('Agreement API', () => {
  describe('POST /api/agreements', () => {
    it('should create a new agreement', async () => {
      const agreementData = {
        title: 'Test Agreement',
        content: 'This is a test agreement',
        parties: ['Party A', 'Party B']
      };
      
      const response = await request(app)
        .post('/api/agreements')
        .send(agreementData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(agreementData.title);
    });
    
    it('should return 400 for invalid data', async () => {
      const invalidData = {
        title: '',
        content: 'Test content'
      };
      
      const response = await request(app)
        .post('/api/agreements')
        .send(invalidData)
        .expect(400);
      
      expect(response.body.error).toContain('required');
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- Agreement.test.js
```

## Documentation

### Types of Documentation

1. **Code Documentation**
   - Inline comments for complex logic
   - JSDoc for functions and classes
   - TypeScript interfaces for type definitions

2. **API Documentation**
   - Update API.md for endpoint changes
   - Include request/response examples
   - Document error codes and handling

3. **User Documentation**
   - Update USER_GUIDE.md for UI changes
   - Include screenshots for new features
   - Update FAQ section as needed

4. **Technical Documentation**
   - Update ARCHITECTURE.md for structural changes
   - Document new dependencies or services
   - Update deployment instructions

### Documentation Standards

- Use clear, concise language
- Include code examples
- Add screenshots for UI changes
- Keep documentation up-to-date
- Use consistent formatting

## Pull Request Process

### Branch Protection Rules

The `main` branch is protected with the following rules:
- **Required PR reviews**: At least 1 approval required
- **Required status checks**: All CI/CD checks must pass
- **Require up-to-date branches**: Must be up-to-date before merge
- **Include administrators**: Enforce rules on administrators

### Before Submitting

1. **Ensure all tests pass**
   ```bash
   npm test
   npm run lint
   ```

2. **Update documentation**
   - API changes → Update API.md
   - UI changes → Update USER_GUIDE.md
   - Architecture changes → Update ARCHITECTURE.md

3. **Test your changes**
   - Manual testing for UI changes
   - API testing for backend changes
   - Cross-browser testing for frontend changes

4. **Sync with main branch**
   ```bash
   git fetch upstream
   git checkout main
   git pull upstream main
   git checkout feature/your-branch
   git merge main
   ```

### Pull Request Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] All tests pass
- [ ] New tests added
- [ ] Manual testing completed

## Deployment
- [ ] Ready for production deployment
- [ ] Requires database migration
- [ ] Requires environment variable changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Branch is up-to-date with main
```

### Review Process

1. **Automated Checks**
   - CI/CD pipeline runs tests on pull request
   - Code quality checks (ESLint, Prettier)
   - Security scans
   - Build verification

2. **Code Review**
   - At least one maintainer review required
   - Address all review comments
   - Update code as needed
   - Re-run tests if necessary

3. **Approval and Merge**
   - Maintainer approval required
   - All status checks must pass
   - Merge to main branch triggers deployment
   - Feature branch automatically deleted

### Deployment Triggers

- **Production**: Automatic deployment on merge to `main`
- **Staging**: Preview deployments for pull requests
- **Rollback**: Automatic rollback on deployment failure

## Issue Reporting

### Bug Reports

Use the following template for bug reports:

```markdown
**Bug Description**
Clear and concise description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Screenshots**
Add screenshots to help explain your problem.

**Environment**
- OS: [e.g. Windows 10, macOS 11.0]
- Browser: [e.g. Chrome, Firefox]
- Version: [e.g. 1.0.0]

**Additional Context**
Add any other context about the problem here.
```

### Security Issues

For security vulnerabilities, please:
- Do not open a public issue
- Email security@agreeproof.com
- Include detailed information about the vulnerability
- We'll respond within 48 hours

## Feature Requests

### Requesting Features

1. **Check existing issues** - Search for similar requests
2. **Use the feature request template**
3. **Provide detailed requirements**
4. **Explain the use case and benefits**

### Feature Request Template

```markdown
**Feature Description**
Clear and concise description of the feature.

**Problem Statement**
What problem does this feature solve?

**Proposed Solution**
How do you envision this feature working?

**Alternatives Considered**
What other approaches did you consider?

**Additional Context**
Add any other context or screenshots about the feature request here.
```

## Community Guidelines

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Discord**: Real-time chat and community support

### Getting Help

1. **Check documentation** - Review existing docs first
2. **Search issues** - Look for similar problems
3. **Ask questions** - Use GitHub Discussions
4. **Join community** - Participate in Discord

### Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes for significant contributions
- Annual contributor appreciation post

## Development Resources

### Useful Links

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [MongoDB Documentation](https://docs.mongodb.com/)

### Development Tools

- **VS Code Extensions**:
  - ES7+ React/Redux/React-Native snippets
  - TypeScript Importer
  - Prettier - Code formatter
  - ESLint
  - GitLens

- **Browser Extensions**:
  - React Developer Tools
  - Redux DevTools
  - JSON Viewer

## License

By contributing to AgreeProof, you agree that your contributions will be licensed under the MIT License.

## Questions?

If you have questions about contributing, please:
- Check this documentation
- Search existing issues and discussions
- Create a new issue with the "question" label
- Contact the maintainers at dev@agreeproof.com

---

Thank you for contributing to AgreeProof! Your contributions help make this project better for everyone. 🚀