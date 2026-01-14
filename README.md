# AgreeProof - Digital Agreement Management Platform

![AgreeProof Logo](https://via.placeholder.com/200x80/4F46E5/FFFFFF?text=AgreeProof)

> Secure, verifiable, and immutable digital agreements for the modern world.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-%5E19.2.3-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-%5E9.1.3-green)](https://www.mongodb.com/)

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Quick Start](#-quick-start)
- [Git Workflow](#-git-workflow)
- [Architecture](#-architecture)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

## 🎯 Overview

AgreeProof is a comprehensive digital agreement management platform that enables businesses and individuals to create, manage, and verify agreements with cryptographic proof. Built with modern web technologies, AgreeProof provides a secure, scalable, and user-friendly solution for digital contract management.

### Key Benefits

- **🔒 Security First**: Cryptographic proof hashes ensure agreement integrity
- **⚡ Instant Creation**: Create agreements in seconds, not hours
- **🌐 Cloud Native**: Deployed on modern cloud infrastructure
- **📱 Responsive Design**: Works seamlessly on all devices
- **🔍 Verifiable**: Each agreement has a unique proof hash for verification
- **📊 Real-time Status**: Track agreement status in real-time

## ✨ Features

### Core Features
- **Agreement Creation**: Create digital agreements with custom terms
- **Multi-Party Support**: Support for two-party agreements with email verification
- **Cryptographic Proof**: SHA256 hash generation for agreement verification
- **Status Tracking**: Real-time agreement status (PENDING → CONFIRMED)
- **Immutable Records**: Once confirmed, agreements cannot be modified
- **Share Links**: Generate secure shareable links for agreements

### Technical Features
- **RESTful API**: Clean, well-documented API endpoints
- **TypeScript Support**: Full type safety in the frontend
- **Comprehensive Testing**: Unit and integration tests
- **Security Middleware**: CORS, rate limiting, input validation
- **Error Handling**: Comprehensive error handling and logging
- **Health Monitoring**: Built-in health check endpoints

## 🛠️ Technology Stack

### Frontend
- **React 19.2.3** - Modern UI framework
- **TypeScript 4.9.5** - Type-safe JavaScript
- **Tailwind CSS 3.4.0** - Utility-first CSS framework
- **React Router 7.12.0** - Client-side routing
- **Vercel** - Frontend deployment platform

### Backend
- **Node.js 18+** - JavaScript runtime
- **Express 5.2.1** - Web application framework
- **MongoDB 9.1.3** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Render** - Backend deployment platform

### Development & DevOps
- **Jest** - Testing framework
- **GitHub Actions** - CI/CD pipeline
- **MongoDB Atlas** - Cloud database hosting
- **Docker** - Containerization support

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Git
- MongoDB Atlas account (for production)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/agreeproof.git
   cd agreeproof
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies
   cd agreeproof-frontend
   npm install
   
   # Backend dependencies
   cd ../agreeproof-backend
   npm install
   ```

3. **Set up environment variables**
   
   **Frontend** (`agreeproof-frontend/.env.local`):
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_ENVIRONMENT=development
   ```
   
   **Backend** (`agreeproof-backend/.env`):
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/agreeproof_local
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the development servers**
   ```bash
   # Start backend (in agreeproof-backend directory)
   npm run dev
   
   # Start frontend (in agreeproof-frontend directory)
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api

## 🔄 Git Workflow

### Branch Strategy

AgreeProof follows a simplified Git workflow with the following branches:

- **`main`**: Production-ready code (protected branch)
- **`develop`**: Integration branch for features (optional)
- **`feature/*`**: Feature branches for new development
- **`hotfix/*`**: Emergency fixes for production issues

### Deployment Workflow

1. **Development**: Work on feature branches
2. **Testing**: Create pull requests to `main`
3. **Validation**: Automated tests and CI/CD checks run
4. **Deployment**: Automatic deployment to production on merge to `main`

### Quick Git Setup

```bash
# Initialize repository and push to GitHub
chmod +x scripts/git-setup.sh
./scripts/git-setup.sh

# Create and switch to a feature branch
git checkout -b feature/your-feature-name

# After making changes, stage and commit
git add .
git commit -m "feat: add your feature description"

# Push and create pull request
git push origin feature/your-feature-name
```

### Git Scripts

- [`scripts/git-setup.sh`](scripts/git-setup.sh) - Initialize repository and push to GitHub
- [`scripts/git-deploy.sh`](scripts/git-deploy.sh) - Handle deployment workflow
- [`scripts/git-merge.sh`](scripts/git-merge.sh) - Safe merge to production

For detailed Git workflow instructions, see [GITHUB_WORKFLOW.md](GITHUB_WORKFLOW.md).

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │◄──►│   (Express)     │◄──►│  (MongoDB)      │
│                 │    │                 │    │                 │
│ - UI Components │    │ - REST API      │    │ - Agreements   │
│ - State Mgmt    │    │ - Business Logic│    │ - Indexes      │
│ - Routing       │    │ - Security      │    │ - Backups       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Project Structure

```
agreeproof/
├── agreeproof-frontend/          # React frontend application
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── services/           # API service layer
│   │   ├── types/              # TypeScript type definitions
│   │   └── App.tsx             # Main application component
│   ├── public/                 # Static assets
│   └── package.json
├── agreeproof-backend/           # Node.js backend API
│   ├── src/
│   │   ├── controllers/        # Route controllers
│   │   ├── models/             # Database models
│   │   ├── routes/             # API routes
│   │   ├── middleware/         # Express middleware
│   │   ├── utils/              # Utility functions
│   │   └── server.js           # Server entry point
│   └── package.json
├── database/                     # Database configuration
│   ├── indexes.js              # Database indexes
│   └── MONGODB_ATLAS_SETUP.md  # Database setup guide
├── .github/workflows/            # CI/CD workflows
├── scripts/                      # Deployment and utility scripts
└── docs/                         # Documentation files
```

## 📚 API Documentation

### Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-backend.onrender.com/api`

### Endpoints

#### Agreements
- `POST /api/agreements/create` - Create new agreement
- `GET /api/agreements/:agreementId` - Get agreement by ID
- `POST /api/agreements/:agreementId/confirm` - Confirm agreement
- `GET /api/agreements/:agreementId/status` - Get agreement status

#### System
- `GET /health` - Health check endpoint
- `GET /api` - API documentation

### Example Request

```bash
# Create a new agreement
curl -X POST http://localhost:5000/api/agreements/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Service Agreement",
    "content": "This is a sample service agreement...",
    "partyA": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "partyB": {
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  }'
```

### Example Response

```json
{
  "success": true,
  "message": "Agreement created successfully",
  "data": {
    "agreementId": "AGP-20240114-ABC123",
    "shareLink": "https://agreeproof.com/agreement/AGP-20240114-ABC123",
    "status": "PENDING",
    "createdAt": "2024-01-14T18:25:00.000Z"
  }
}
```

For detailed API documentation, see [API.md](API.md).

## 🚀 Deployment

### Production Deployment

AgreeProof is designed for cloud deployment with the following stack:

- **Frontend**: Vercel (automatic deployments from GitHub)
- **Backend**: Render (Node.js service with MongoDB Atlas)
- **Database**: MongoDB Atlas (M0 free tier)

#### Quick Deploy

1. **Frontend to Vercel**
   ```bash
   cd agreeproof-frontend
   npm install -g vercel
   vercel --prod
   ```

2. **Backend to Render**
   - Connect your GitHub repository to Render
   - Configure environment variables
   - Deploy automatically on push to main branch

#### Environment Variables

**Production Frontend**:
```env
REACT_APP_API_URL=https://your-backend.onrender.com/api
REACT_APP_ENVIRONMENT=production
```

**Production Backend**:
```env
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
FRONTEND_URL=https://your-frontend.vercel.app
```

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Commit your changes using conventional commits:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `test:` for test additions/changes
   - `refactor:` for code refactoring
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request targeting the `main` branch

### Pull Request Process

- All PRs must pass automated tests
- Code review is required for all changes
- PRs should update relevant documentation
- Use clear, descriptive PR titles and descriptions

### Code Style

- Use TypeScript for frontend code
- Follow ESLint configurations
- Write meaningful commit messages (conventional commits)
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 AgreeProof

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 📞 Support

### Getting Help

- **Documentation**: Check our comprehensive documentation in the `/docs` folder
- **Issues**: Report bugs or request features via [GitHub Issues](https://github.com/your-username/agreeproof/issues)
- **Discussions**: Join our [GitHub Discussions](https://github.com/your-username/agreeproof/discussions) for community support

### Contact Information

- **Email**: support@agreeproof.com
- **Website**: https://agreeproof.com
- **Documentation**: https://docs.agreeproof.com

### FAQ

**Q: Is AgreeProof free to use?**
A: Yes, we offer a free tier with basic features. Paid plans are available for advanced features and higher usage limits.

**Q: How secure are the agreements?**
A: All agreements are protected with SHA256 cryptographic hashes and stored securely in MongoDB Atlas with enterprise-grade security.

**Q: Can I integrate AgreeProof with my existing systems?**
A: Yes, we provide a comprehensive REST API that allows integration with any system that can make HTTP requests.

---

## 🎉 Thank You!

Thank you for choosing AgreeProof for your digital agreement management needs. We're committed to providing the best possible experience for our users.

If you find this project useful, please consider giving it a ⭐ on GitHub!

**Built with ❤️ by the AgreeProof Team**