# AgreeProof Frontend

> Modern React frontend for the AgreeProof digital agreement management platform

## 📋 Overview

The AgreeProof frontend is a sophisticated React 19.2.3 application built with TypeScript that provides an intuitive, responsive interface for creating and managing digital agreements. It features a component-based architecture, modern UI design with Tailwind CSS, and seamless integration with the AgreeProof backend API.

## 🚀 Features

### Core Functionality
- **Agreement Creation**: Intuitive form-based agreement creation with real-time validation
- **Agreement Management**: View, track, and manage all agreements in one dashboard
- **Multi-Party Support**: Handle agreements between multiple parties with individual confirmation tracking
- **Secure Sharing**: Generate and share secure links for agreement access
- **Status Tracking**: Real-time monitoring of agreement lifecycle (PENDING, CONFIRMED, EXPIRED)

### User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface using Tailwind CSS and shadcn/ui components
- **Real-time Updates**: Live status updates and notifications
- **Accessibility**: WCAG 2.1 compliant with keyboard navigation and screen reader support
- **Performance**: Fast loading with code splitting and lazy loading

### Developer Experience
- **TypeScript**: Full type safety for better development experience
- **Component Architecture**: Reusable, maintainable component structure
- **State Management**: Efficient state management with Zustand
- **Testing**: Comprehensive test coverage with Jest and React Testing Library
- **Hot Reload**: Fast development with Vite dev server

## 🛠️ Technology Stack

### Core Technologies
- **React**: 19.2.3 with latest features and concurrent rendering
- **TypeScript**: 5.6.3 for type safety and better developer experience
- **Vite**: 6.0.3 for fast builds and development server
- **Tailwind CSS**: 3.4.0 for utility-first styling

### UI & Components
- **shadcn/ui**: Modern, accessible component library
- **Lucide React**: Beautiful, consistent icon library
- **Framer Motion**: Smooth animations and transitions
- **React Hook Form**: Performant forms with validation

### State & Data
- **Zustand**: Lightweight state management
- **React Query**: Server state management and caching
- **Axios**: HTTP client for API communication

### Development & Testing
- **Jest**: Testing framework
- **React Testing Library**: Component testing utilities
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking

### Deployment
- **Vercel**: Production hosting and deployment
- **GitHub Actions**: CI/CD pipelines
- **Docker**: Containerization support

## 📦 Installation

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager
- AgreeProof backend API running (for development)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/agreeproof.git
   cd agreeproof/agreeproof-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Copy the environment template:
   ```bash
   cp .env.production.example .env.local
   ```
   
   Configure your environment variables:
   ```env
   # API Configuration
   VITE_API_BASE_URL=http://localhost:5000
   VITE_API_TIMEOUT=10000
   
   # Application Configuration
   VITE_APP_NAME=AgreeProof
   VITE_APP_VERSION=1.0.0
   VITE_APP_DESCRIPTION=Digital Agreement Management Platform
   
   # Feature Flags
   VITE_ENABLE_ANALYTICS=true
   VITE_ENABLE_NOTIFICATIONS=true
   VITE_ENABLE_DARK_MODE=true
   
   # Third-party Services
   VITE_SENTRY_DSN=your-sentry-dsn
   VITE_GOOGLE_ANALYTICS_ID=your-ga-id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:5173](http://localhost:5173)

## 🏗️ Project Structure

```
agreeproof-frontend/
├── public/
│   ├── index.html           # HTML template
│   ├── favicon.ico          # Favicon
│   ├── manifest.json        # PWA manifest
│   └── robots.txt           # SEO robots file
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Generic components (Button, Input, etc.)
│   │   ├── forms/          # Form-specific components
│   │   ├── layout/         # Layout components (Header, Footer, etc.)
│   │   └── features/       # Feature-specific components
│   ├── pages/              # Page-level components
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   ├── AgreementList.tsx # Agreement listing
│   │   ├── AgreementView.tsx # Agreement details
│   │   ├── CreateAgreement.tsx # Agreement creation
│   │   └── Profile.tsx     # User profile
│   ├── hooks/              # Custom React hooks
│   │   ├── useAgreements.ts # Agreement data hook
│   │   ├── useAuth.ts      # Authentication hook
│   │   └── useNotifications.ts # Notifications hook
│   ├── services/           # API service layer
│   │   └── api.ts          # API client configuration
│   ├── types/              # TypeScript type definitions
│   │   └── agreement.ts    # Agreement types
│   ├── utils/              # Utility functions
│   │   ├── validation.ts   # Form validation
│   │   ├── formatting.ts   # Data formatting
│   │   └── constants.ts    # Application constants
│   ├── store/              # State management
│   │   └── agreementStore.ts # Agreement state
│   ├── styles/             # Global styles
│   │   └── globals.css     # Global CSS
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── vite-env.d.ts       # Vite type definitions
├── tests/                  # Test files
│   ├── components/         # Component tests
│   ├── pages/              # Page tests
│   ├── hooks/              # Hook tests
│   └── utils/              # Utility tests
├── .env.production.example # Environment variable template
├── .gitignore              # Git ignore file
├── eslint.config.js        # ESLint configuration
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── postcss.config.js       # PostCSS configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── vercel.json             # Vercel deployment configuration
└── vite.config.ts          # Vite configuration
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run preview      # Preview production build locally

# Building
npm run build        # Build for production
npm run build:analyze # Analyze bundle size

# Testing
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run test:ui      # Run tests with UI interface

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # Run TypeScript type checking
npm run format       # Format code with Prettier

# Deployment
npm run deploy       # Deploy to production
npm run deploy:staging # Deploy to staging
```

## 🎨 Component Architecture

### Component Hierarchy

```
App
├── Router
├── Layout
│   ├── Header
│   │   ├── Logo
│   │   ├── Navigation
│   │   └── UserMenu
│   ├── Sidebar
│   │   ├── NavigationItems
│   │   └── UserInfo
│   └── Footer
├── Pages
│   ├── Dashboard
│   │   ├── StatsCards
│   │   ├── RecentAgreements
│   │   └── QuickActions
│   ├── AgreementList
│   │   ├── FilterBar
│   │   ├── AgreementTable
│   │   └── Pagination
│   ├── AgreementView
│   │   ├── AgreementHeader
│   │   ├── AgreementContent
│   │   ├── PartyInfo
│   │   └── ActionButtons
│   ├── CreateAgreement
│   │   ├── AgreementForm
│   │   ├── PartyFields
│   │   └── FormActions
│   └── Profile
│       ├── ProfileForm
│       └── SettingsPanel
└── Common
    ├── Loading
    ├── ErrorBoundary
    ├── Notification
    └── Modal
```

### Component Patterns

#### Smart vs Dumb Components
- **Smart Components**: Manage state, handle business logic, connect to APIs
- **Dumb Components**: Receive props, render UI, handle UI events

#### Custom Hooks
```typescript
// Example: useAgreements hook
const useAgreements = () => {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAgreements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getAgreements();
      setAgreements(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgreements();
  }, [fetchAgreements]);

  return { agreements, loading, error, refetch: fetchAgreements };
};
```

## 🌐 API Integration

### API Service Configuration

```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use((config) => {
  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error);
  }
);

export default api;
```

### API Usage Examples

```typescript
// Creating an agreement
const createAgreement = async (data: CreateAgreementData) => {
  try {
    const response = await api.post('/api/agreements', data);
    return response.data;
  } catch (error) {
    throw new Error('Failed to create agreement');
  }
};

// Fetching agreements
const fetchAgreements = async () => {
  try {
    const response = await api.get('/api/agreements');
    return response.data.data.agreements;
  } catch (error) {
    throw new Error('Failed to fetch agreements');
  }
};
```

## 🎯 State Management

### Zustand Store Example

```typescript
// src/store/agreementStore.ts
import { create } from 'zustand';
import { Agreement } from '../types/agreement';

interface AgreementStore {
  agreements: Agreement[];
  currentAgreement: Agreement | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setAgreements: (agreements: Agreement[]) => void;
  setCurrentAgreement: (agreement: Agreement | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Async actions
  fetchAgreements: () => Promise<void>;
  createAgreement: (data: CreateAgreementData) => Promise<void>;
}

const useAgreementStore = create<AgreementStore>((set, get) => ({
  agreements: [],
  currentAgreement: null,
  loading: false,
  error: null,
  
  setAgreements: (agreements) => set({ agreements }),
  setCurrentAgreement: (currentAgreement) => set({ currentAgreement }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  fetchAgreements: async () => {
    set({ loading: true, error: null });
    try {
      const agreements = await api.getAgreements();
      set({ agreements, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  createAgreement: async (data) => {
    set({ loading: true, error: null });
    try {
      const agreement = await api.createAgreement(data);
      set(state => ({ 
        agreements: [...state.agreements, agreement],
        loading: false 
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));

export default useAgreementStore;
```

## 🧪 Testing

### Testing Strategy

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test component interactions and API integration
- **E2E Tests**: Test complete user workflows (planned)
- **Visual Regression**: Test UI consistency (planned)

### Test Examples

```typescript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react';
import { CreateAgreementForm } from '../CreateAgreementForm';

describe('CreateAgreementForm', () => {
  it('renders form fields correctly', () => {
    render(<CreateAgreementForm />);
    
    expect(screen.getByLabelText('Agreement Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Content')).toBeInTheDocument();
    expect(screen.getByLabelText('Party A Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Party A Email')).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const mockSubmit = jest.fn();
    render(<CreateAgreementForm onSubmit={mockSubmit} />);
    
    fireEvent.change(screen.getByLabelText('Agreement Title'), {
      target: { value: 'Test Agreement' }
    });
    
    fireEvent.click(screen.getByText('Create Agreement'));
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        title: 'Test Agreement',
        // ... other form data
      });
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## 🎨 Styling & Design

### Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          50: '#f8fafc',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
```

### Component Styling

```typescript
// Example component with Tailwind
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  ...props 
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2';
  
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-secondary-200 text-secondary-800 hover:bg-secondary-300 focus:ring-secondary-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      {...props}
    >
      {children}
    </button>
  );
};
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**
   - Connect your GitHub repository to Vercel
   - Select the `agreeproof-frontend` directory

2. **Configure Environment Variables**
   - Add all environment variables from `.env.production.example`

3. **Deploy**
   - Automatic deployment on push to `main` branch
   - Preview deployments for pull requests

### Manual Deployment

```bash
# Build for production
npm run build

# Preview locally
npm run preview

# Deploy to hosting service
# Follow your hosting provider's instructions
```

### Environment Configuration

- **Development**: Local development with hot reload
- **Staging**: Preview deployments for testing
- **Production**: Optimized build with CDN

## 📊 Performance Optimization

### Code Splitting

```typescript
// Lazy loading components
const AgreementView = lazy(() => import('./pages/AgreementView'));
const CreateAgreement = lazy(() => import('./pages/CreateAgreement'));

// Route-based code splitting
const router = createBrowserRouter([
  {
    path: '/',
    element: <Dashboard />,
  },
  {
    path: '/agreements/:id',
    element: (
      <Suspense fallback={<Loading />}>
        <AgreementView />
      </Suspense>
    ),
  },
]);
```

### Optimization Techniques

- **Tree Shaking**: Remove unused code
- **Bundle Analysis**: Monitor bundle size
- **Image Optimization**: Optimize images and assets
- **Caching**: Implement proper caching strategies
- **Lazy Loading**: Load components and routes on demand

## 🔒 Security

### Implemented Security Measures

1. **Input Validation**: Form validation on client and server
2. **XSS Protection**: Output encoding and sanitization
3. **CSRF Protection**: Token-based CSRF protection
4. **Content Security Policy**: CSP headers for additional security
5. **Secure Communication**: HTTPS enforcement

### Security Best Practices

- Environment variable protection
- Dependency vulnerability scanning
- Secure API communication
- User input sanitization
- Error message sanitization

## 📱 Responsive Design

### Breakpoints

```css
/* Tailwind CSS breakpoints */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

### Mobile-First Approach

- Design for mobile first, then scale up
- Touch-friendly interface elements
- Optimized performance for mobile devices
- Progressive enhancement for larger screens

## 📚 Documentation

- **API Documentation**: [../API.md](../API.md)
- **Development Guide**: [../DEVELOPMENT.md](../DEVELOPMENT.md)
- **Architecture**: [../ARCHITECTURE.md](../ARCHITECTURE.md)
- **User Guide**: [../USER_GUIDE.md](../USER_GUIDE.md)

## 🤝 Contributing

Please read [../CONTRIBUTING.md](../CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [../LICENSE](../LICENSE) file for details.

## 📞 Support

- **Documentation**: [../README.md](../README.md)
- **Issues**: [GitHub Issues](https://github.com/your-org/agreeproof/issues)
- **Email**: support@agreeproof.com
- **Discord**: [Community Server](https://discord.gg/agreeproof)

---

**AgreeProof Frontend** - Modern, intuitive interface for digital agreement management.
