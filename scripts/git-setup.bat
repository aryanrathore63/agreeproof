@echo off
echo Setting up Git repository for AgreeProof...

REM Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Git is not installed. Please install Git first.
    pause
    exit /b 1
)

REM Initialize Git repository
echo Initializing Git repository...
git init

REM Add all files
echo Adding all files to Git...
git add .

REM Initial commit
echo Creating initial commit...
git commit -m "feat: initial commit - AgreeProof MVP complete implementation

- Complete backend API with Node.js, Express, and MongoDB
- React frontend with TypeScript and Tailwind CSS v3
- Comprehensive testing suite with Jest and React Testing Library
- Production-ready deployment configuration for Vercel and Render
- Complete documentation and GitHub workflow setup
- Security features including SHA256 hash generation and input validation
- Free-tier optimized for MongoDB Atlas, Vercel, and Render"

REM Add remote origin (user will need to replace with their repo)
echo.
echo Next steps:
echo 1. Create a new repository on GitHub: https://github.com/aryanrathore63
echo 2. Run: git remote add origin https://github.com/aryanrathore63/agreeproof.git
echo 3. Run: git push -u origin main
echo.
echo Repository is ready for GitHub push!

pause