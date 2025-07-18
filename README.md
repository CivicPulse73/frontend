# CivicPulse

A modern, mobile-first civic engagement platform built with React TypeScript frontend and Python FastAPI backend. CivicPulse empowers citizens to report issues, track progress, and engage with local representatives through an Instagram-inspired interface.

## 🚀 Quick Start

### Automated Setup (Recommended)

Run the setup script to get both frontend and backend running:

```bash
chmod +x setup.sh
./setup.sh
```

This will:
- Set up the Python backend with FastAPI
- Install frontend dependencies  
- Start both servers concurrently
- Backend: http://localhost:8000
- Frontend: http://localhost:5173

### Manual Setup

#### Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python run.py
```

#### Frontend (React + Vite)
```bash
cd frontend  # or project root
npm install
npm run dev
```

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript and hooks
- **Vite** for fast development and building
- **TailwindCSS** for utility-first styling
- **React Router** for client-side routing
- **Lucide React** for beautiful icons
- **Context API** for state management

### Backend Stack  
- **FastAPI** for high-performance API
- **asyncpg** for PostgreSQL database connections
- **PostgreSQL** for production database
- **SQLite** for development database
- **Pydantic** for data validation
- **JWT** for authentication

## ✨ Features

### 🏠 Civic Feed
- Instagram-style scrollable feed with civic posts
- Issue reports, announcements, news, and accomplishments
- Real-time engagement (upvote, downvote, comment, save, share)
- Infinite scroll with loading states
- Offline support with fallback data

### 📝 Issue Reporting & Tracking
- Easy-to-use forms for reporting civic issues
- Category-based organization (Infrastructure, Public Safety, etc.)
- Area/ward selection for proper routing
- Photo support for visual evidence
- Real-time status tracking (Open → In Progress → Resolved)
- Representative responses and updates

### 📊 Analytics & Insights  
- Community engagement statistics
- Issue resolution metrics
- Area performance comparisons
- Trending categories and topics
- Data visualization with charts

### 👤 User Management
- Secure JWT-based authentication
- Citizen and representative profiles
- Personal post history and saved items
- Profile customization and settings
- Registration and login flows

### 🔔 Notifications System
- Real-time notifications for status updates
- Comment notifications and mentions  
- Representative responses and updates
- Community engagement alerts
- Mark as read/unread functionality

### 🛡️ Developer Experience
- Comprehensive error boundaries
- Loading states throughout the UI
- Network status detection
- Graceful fallback to mock data
- TypeScript for type safety
- Responsive mobile-first design

## 🎨 Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons

### Backend  
- **FastAPI** - High-performance Python web framework
- **asyncpg** - PostgreSQL database adapter for Python
- **PostgreSQL** - Production database
- **SQLite** - Development database
- **Pydantic** - Data validation using Python type hints
- **JWT** - JSON Web Token authentication
- **Uvicorn** - ASGI server for FastAPI

### Design System
- **Mobile-first** responsive design
- **Instagram-inspired** UI patterns
- **Accessibility** compliant components
- **Custom color palette** for civic themes
- **Error boundaries** for graceful error handling
- **Loading states** throughout the application

## 📡 API Integration

The frontend seamlessly integrates with the FastAPI backend through:

### Authentication Service (`/src/services/auth.ts`)
- User registration and login
- JWT token management
- Password reset functionality
- Session persistence

### Posts Service (`/src/services/posts.ts`)
- CRUD operations for civic posts
- Voting and engagement actions
- Post filtering and search
- Infinite scroll pagination

### User Service (`/src/services/users.ts`)
- Profile management
- User settings and preferences
- Representative verification

### Notifications Service (`/src/services/notifications.ts`)
- Real-time notification delivery
- Read/unread status management
- Notification categorization

### Comments Service (`/src/services/comments.ts`)
- Threaded comment system
- Reply functionality
- Comment moderation

### Fallback Service (`/src/services/fallback.ts`)
- Mock data for development
- Offline functionality
- API unavailability handling

## 🚦 Getting Started

### Prerequisites
- **Node.js** (version 16 or later)
- **Python** (version 3.8 or later)
- **npm** or **yarn** package manager
- **Git** for version control

### Development Environment

#### Option 1: Automated Setup (Recommended)
```bash
git clone <repository-url>
cd CivicPulse
chmod +x setup.sh
./setup.sh
```

#### Option 2: Manual Setup

**Backend Setup:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
python run.py
```

**Frontend Setup:**
```bash
# In project root or frontend directory
npm install
npm run dev
```

### Environment Variables

Create a `.env` file in the backend directory:
```env
# Database
DATABASE_URL=sqlite:///./app.db
# For production: postgresql://user:password@localhost/dbname

# JWT
SECRET_KEY=your-super-secret-jwt-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API
API_V1_STR=/api/v1
PROJECT_NAME=CivicPulse

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000"]
```

### Running the Application

1. **Start the backend**: `cd backend && python run.py`
2. **Start the frontend**: `npm run dev`
3. **Access the application**: http://localhost:5173
4. **API documentation**: http://localhost:8000/docs

## 📁 Project Structure

```
CivicPulse/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/               # API route definitions
│   │   │   ├── endpoints/     # Individual route modules
│   │   │   └── deps.py        # Dependencies (auth, db)
│   │   ├── core/              # Core functionality
│   │   │   ├── config.py      # Configuration management
│   │   │   ├── security.py    # JWT and password hashing
│   │   │   └── database.py    # Database connection
│   │   ├── models/            # Pydantic models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   └── main.py           # FastAPI application
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example          # Environment variables template
│   └── run.py                # Development server
├── src/                       # React frontend
│   ├── components/            # Reusable UI components
│   │   ├── Layout.tsx        # Main layout wrapper
│   │   ├── TopNavigation.tsx # Header navigation
│   │   ├── BottomNavigation.tsx # Tab navigation
│   │   ├── FeedCard.tsx      # Post display component
│   │   ├── AuthModal.tsx     # Login/register modal
│   │   └── ErrorBoundary.tsx # Error handling
│   ├── pages/                # Route components
│   │   ├── Home.tsx          # Main feed page
│   │   ├── Post.tsx          # Create new post
│   │   ├── Activity.tsx      # Notifications
│   │   ├── Explore.tsx       # Discover content
│   │   ├── Insights.tsx      # Analytics dashboard
│   │   └── Profile.tsx       # User profile
│   ├── contexts/             # React Context providers
│   │   ├── UserContext.tsx   # User authentication & state
│   │   ├── PostContext.tsx   # Posts and interactions
│   │   └── NotificationContext.tsx # Notifications
│   ├── services/             # API communication
│   │   ├── api.ts           # Base API client
│   │   ├── auth.ts          # Authentication service
│   │   ├── posts.ts         # Posts service
│   │   ├── users.ts         # User management
│   │   ├── comments.ts      # Comments service
│   │   ├── notifications.ts # Notifications service
│   │   └── fallback.ts      # Mock data & offline support
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx              # Main application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles and Tailwind
├── setup.sh                # Automated setup script
├── package.json            # Frontend dependencies
└── README.md              # This file
```

## 🔧 Key Components & Features

### Frontend Components

#### `FeedCard` - Main Post Component
- Displays civic posts with user information and verification badges
- Post content with images, descriptions, and status indicators  
- Engagement actions (upvote, downvote, comment, save, share)
- Comment threads with infinite scroll
- Real-time status updates for issues

#### `AuthModal` - Authentication System
- Login and registration forms
- Form validation and error handling
- JWT token management
- Password strength indicators

#### `ErrorBoundary` - Error Handling
- Graceful error recovery
- Network status monitoring
- Fallback UI for broken components
- Error reporting and logging

#### Navigation Components
- **TopNavigation**: App branding, location info, notifications badge
- **BottomNavigation**: Five-tab navigation (Home, Post, Activity, Insights, Profile)
- Mobile-optimized touch targets
- Active state indicators

### Backend API Endpoints

#### Authentication (`/api/v1/auth/`)
- `POST /register` - User registration
- `POST /login` - User authentication  
- `POST /logout` - Token invalidation
- `GET /me` - Current user info
- `PUT /me` - Update user profile

#### Posts (`/api/v1/posts/`)
- `GET /` - List posts with filtering
- `POST /` - Create new post
- `GET /{id}` - Get specific post
- `PUT /{id}` - Update post (author only)
- `DELETE /{id}` - Delete post (author only)
- `POST /{id}/vote` - Vote on post
- `GET /{id}/comments` - Get post comments

#### Comments (`/api/v1/comments/`)
- `POST /` - Create comment
- `PUT /{id}` - Update comment
- `DELETE /{id}` - Delete comment
- `POST /{id}/vote` - Vote on comment

#### Notifications (`/api/v1/notifications/`)
- `GET /` - List user notifications
- `PUT /{id}/read` - Mark as read
- `PUT /read-all` - Mark all as read
- `DELETE /{id}` - Delete notification

### Context Providers & State Management

#### `UserContext`
- Authentication state management
- User profile data
- Login/logout functionality
- Token persistence
- Loading and error states

#### `PostContext`  
- Posts data with infinite scroll
- Filtering and sorting
- Voting and engagement actions
- Real-time updates
- Fallback to mock data when offline

#### `NotificationContext`
- Real-time notification delivery
- Read/unread status tracking
- Notification categorization
- Mark as read functionality
- Badge count management

## 🎨 Customization & Theming

### Color Palette
The app uses a custom color palette defined in `tailwind.config.js`:
- **Primary**: Blue tones (#3B82F6) for trust and reliability
- **Success**: Green (#10B981) for positive actions and resolved issues
- **Warning**: Yellow (#F59E0B) for alerts and pending items  
- **Danger**: Red (#EF4444) for urgent issues and errors
- **Neutral**: Gray scale for text and backgrounds

### Typography & Spacing
- **Font**: Inter font family for modern readability
- **Responsive typography**: Mobile-first scaling
- **Consistent spacing**: TailwindCSS spacing scale
- **Accessibility**: WCAG compliant contrast ratios

### Component Styling
- **Utility-first approach**: TailwindCSS classes
- **Custom components**: Defined in `src/index.css`
- **Mobile-first design**: Responsive breakpoints
- **Dark mode ready**: CSS variables for theme switching

## 🧪 Development & Testing

### Available Scripts

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

#### Backend
```bash
python run.py                    # Start development server
uvicorn app.main:app --reload   # Alternative start method
pytest                          # Run tests
python -m app.main             # Production start
```

### Building for Production

#### Frontend Build
```bash
npm run build
```
The built files will be in the `dist` directory.

#### Backend Deployment
```bash
# Using Docker
docker build -t civicpulse-backend .
docker run -p 8000:8000 civicpulse-backend

# Using gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Error Handling & Monitoring

- **Frontend**: Error boundaries catch React errors
- **Backend**: Structured error responses with proper HTTP codes
- **Logging**: Console logging in development, structured logging in production
- **Network**: Automatic retry for failed API calls
- **Offline**: Graceful degradation with mock data

## 🤝 Contributing

We welcome contributions to CivicPulse! Please follow these steps:

### Development Workflow
1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**:
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed
4. **Test your changes**:
   ```bash
   # Frontend
   npm run lint
   npm run type-check
   
   # Backend  
   pytest
   ```
5. **Commit your changes**:
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to your branch**:
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Style Guidelines

#### Frontend (React/TypeScript)
- Use functional components with hooks
- Implement proper TypeScript typing
- Follow TailwindCSS utility-first approach
- Use semantic HTML elements
- Maintain consistent naming conventions (camelCase)
- Implement proper error handling with try/catch blocks

#### Backend (Python/FastAPI)
- Follow PEP 8 style guidelines
- Use type hints for all function parameters and returns
- Implement proper error handling with custom exceptions
- Write docstrings for all functions and classes
- Use dependency injection for database sessions
- Follow RESTful API conventions

### Pull Request Guidelines
- **Clear description**: Explain what your PR does and why
- **Small, focused changes**: Keep PRs focused on a single feature/fix
- **Tests included**: Add tests for new functionality
- **Documentation updated**: Update README or docs if needed
- **No merge conflicts**: Rebase your branch before submitting

## 🚀 Deployment

### Frontend Deployment

#### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

#### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### Backend Deployment

#### Heroku
```bash
# Install Heroku CLI
heroku create civicpulse-api
heroku addons:create heroku-postgresql:mini
git subtree push --prefix backend heroku main
```

#### Railway
```bash
# Connect your GitHub repo to Railway
# Set environment variables in Railway dashboard
```

#### Docker
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables for Production

#### Frontend
```env
VITE_API_URL=https://your-backend-url.com/api/v1
VITE_ENVIRONMENT=production
```

#### Backend
```env
DATABASE_URL=postgresql://user:pass@host:port/dbname
SECRET_KEY=your-super-secret-production-key
BACKEND_CORS_ORIGINS=["https://your-frontend-url.com"]
ENVIRONMENT=production
```

## 🗺️ Roadmap & Future Enhancements

### Phase 1: Core Platform (✅ Complete)
- [x] User authentication and profiles
- [x] Post creation and engagement system
- [x] Notification system
- [x] Mobile-responsive design
- [x] Backend API integration
- [x] Error handling and offline support

### Phase 2: Enhanced Features (🚧 In Progress)
- [ ] Real-time notifications with WebSocket
- [ ] Advanced search and filtering
- [ ] Representative response workflows
- [ ] Photo upload and image processing
- [ ] Email notifications
- [ ] Social sharing capabilities

### Phase 3: Community Features (📋 Planned)
- [ ] Community polls and voting
- [ ] Event scheduling and management
- [ ] Discussion forums
- [ ] User reputation system
- [ ] Volunteer opportunity matching
- [ ] Local business integration

### Phase 4: Advanced Analytics (🔮 Future)
- [ ] Budget transparency features
- [ ] Predictive issue analytics
- [ ] Performance dashboards for representatives
- [ ] Geographic heat maps
- [ ] Sentiment analysis
- [ ] AI-powered issue categorization

### Phase 5: Platform Expansion (🌟 Vision)
- [ ] Progressive Web App (PWA) support
- [ ] Native mobile apps (iOS/Android)
- [ ] Multi-language support
- [ ] API for third-party integrations
- [ ] White-label solutions for other cities
- [ ] Machine learning recommendations

## 🛠️ Technical Debt & Improvements

### Performance Optimizations
- [ ] Implement React.memo for expensive components
- [ ] Add service worker for caching
- [ ] Optimize bundle size with code splitting
- [ ] Implement virtual scrolling for large lists
- [ ] Add image lazy loading and optimization
- [ ] Database query optimization and indexing

### Security Enhancements
- [ ] Rate limiting on API endpoints
- [ ] Input sanitization and validation
- [ ] CSRF protection
- [ ] Security headers implementation
- [ ] Audit logging for sensitive operations
- [ ] Two-factor authentication

### DevOps & Monitoring
- [ ] Automated testing pipeline
- [ ] Error tracking (Sentry integration)
- [ ] Performance monitoring
- [ ] Automated deployments
- [ ] Infrastructure as Code
- [ ] Backup and disaster recovery

## 🐛 Known Issues

### Current Limitations
- **Image Upload**: Currently uses mock implementation
- **Real-time Updates**: WebSocket not yet implemented
- **Search**: Basic text search, needs full-text search
- **Notifications**: Email notifications not implemented
- **Mobile**: Native app features limited to PWA

### Browser Support
- **Supported**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Limited**: Internet Explorer (not supported)
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+

## 📞 Support & Community

### Getting Help
- **Documentation**: Check this README and code comments
- **Issues**: Report bugs on [GitHub Issues](link-to-issues)
- **Discussions**: Join our [GitHub Discussions](link-to-discussions)
- **Email**: Contact the development team at dev@civicpulse.app

### Community Guidelines
- Be respectful and constructive
- Follow the code of conduct
- Help others when possible
- Report issues with clear reproduction steps
- Contribute back to the community

### Professional Support
For enterprise deployments or custom development:
- **Consulting**: Available for implementation assistance
- **Training**: Developer onboarding and best practices
- **Custom Features**: Tailored functionality development
- **SLA Support**: Production support with guaranteed response times

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### Third-Party Licenses
- React: MIT License
- FastAPI: MIT License  
- TailwindCSS: MIT License
- All other dependencies: See respective package licenses

## 🙏 Acknowledgments

### Open Source Libraries
- **React Team** for the amazing React framework
- **FastAPI** for the high-performance Python framework
- **TailwindCSS** for the utility-first CSS framework
- **Lucide** for the beautiful icon set
- **All contributors** who help improve CivicPulse

### Inspiration
- **Instagram** for the engagement-focused UI patterns
- **Nextdoor** for community-focused social features
- **311 Apps** for civic issue reporting workflows
- **Modern civic tech** movements worldwide

---

**Built with ❤️ for stronger communities**

*CivicPulse - Empowering citizens, connecting communities, building better cities.*
