# College Event Management System - Frontend

A modern, responsive React frontend for managing college events, built with Vite, React, and Tailwind CSS.

## 🚀 Features

- **🎨 Modern UI/UX**: Beautiful, responsive design with smooth animations
- **👤 Role-based Access**: Different dashboards for Students, Organizers, and Admins
- **📱 Mobile-first**: Fully responsive design that works on all devices
- **⚡ Fast Performance**: Built with Vite for lightning-fast development and builds
- **🔐 Secure Authentication**: JWT-based authentication with protected routes
- **🎯 Real-time Updates**: Live notifications and status updates
- **♿ Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation

## 🛠️ Tech Stack

- **Framework**: React 18 with Hooks and Context API
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS for utility-first styling
- **Routing**: React Router DOM for client-side routing
- **HTTP Client**: Axios for API communication
- **Icons**: Lucide React for beautiful, consistent icons
- **Notifications**: React Hot Toast for user feedback
- **Forms**: React Hook Form for form management
- **Charts**: Recharts for data visualization
- **Date Handling**: Date-fns for date formatting

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Common components (Navbar, Footer, etc.)
│   └── ui/              # Base UI components
├── pages/               # Page components
│   ├── admin/           # Admin-specific pages
│   ├── organizer/       # Organizer-specific pages
│   └── student/         # Student-specific pages
├── contexts/            # React contexts for state management
├── services/            # API services and HTTP client
├── utils/               # Utility functions and helpers
├── hooks/               # Custom React hooks
└── assets/              # Static assets (images, fonts, etc.)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- Backend API running on http://localhost:5000

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd college-event-management-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your configuration:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Visit `http://localhost:3000`

## 🎭 User Roles & Features

### 👨‍🎓 **Students**
- Browse and search events
- Register for events with capacity management
- View registration history and status
- Receive notifications and reminders
- Update personal profile

### 👨‍💼 **Event Organizers**
- Create and manage events
- Track registrations and capacity
- View participant lists
- Export registration data
- Monitor event analytics

### 👨‍💻 **Administrators**
- Approve/reject event submissions
- Manage all users and events
- View system-wide analytics
- Generate reports
- System configuration

## 🔐 Authentication

The app uses JWT-based authentication with role-based access control:

### Demo Accounts
- **Admin**: admin@college.edu / admin123
- **Organizer**: john@college.edu / org123  
- **Student**: alice@college.edu / student123

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:
- **Desktop**: Full-featured interface with sidebar navigation
- **Tablet**: Optimized layout with collapsible menus
- **Mobile**: Touch-friendly interface with bottom navigation

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (#667eea to #764ba2)
- **Secondary**: Purple gradient (#f093fb to #f5576c)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)

### Typography
- **Headings**: Poppins (600-800 weight)
- **Body**: Inter (300-500 weight)
- **Code**: JetBrains Mono

### Components
All components follow a consistent design system with:
- Proper spacing using Tailwind's spacing scale
- Consistent border radius (8px for cards, 6px for buttons)
- Smooth transitions and hover effects
- Accessible color contrast ratios

## 🔧 Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Type checking
npm run type-check
```

### Code Style

The project follows these conventions:
- **ESLint**: Code linting with React-specific rules
- **Prettier**: Code formatting (configured in .prettierrc)
- **Component Structure**: Functional components with hooks
- **File Naming**: PascalCase for components, camelCase for utilities
- **Import Order**: Third-party → Internal → Relative imports

### State Management

- **Global State**: React Context API for authentication and theme
- **Local State**: React hooks (useState, useEffect, useReducer)
- **Server State**: Custom hooks with React Query patterns
- **Form State**: React Hook Form for complex forms

## 🚀 Deployment

### Production Build

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Environment Variables

For production deployment:

```env
VITE_API_URL=https://your-api-domain.com/api
VITE_NODE_ENV=production
```

### Deployment Options

**Static Hosting (Recommended):**
- Vercel, Netlify, GitHub Pages
- Simply upload the `dist/` folder

**CDN + Object Storage:**
- AWS S3 + CloudFront
- Google Cloud Storage + CDN
- Azure Blob Storage + CDN

**Traditional Web Server:**
- Apache, Nginx, IIS
- Serve the `dist/` folder as static files

## 📊 Performance

The app is optimized for performance:
- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Responsive images with proper formats
- **Bundle Size**: Optimized with tree shaking and minification
- **Caching**: Proper cache headers for static assets

## ♿ Accessibility

Accessibility features include:
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: WCAG AA compliant color ratios
- **Focus Management**: Visible focus indicators and logical focus order
- **Alternative Text**: Images have descriptive alt text

## 🔒 Security

Security measures implemented:
- **XSS Prevention**: Sanitized user inputs and outputs
- **CSRF Protection**: CSRF tokens for state-changing operations
- **Secure Headers**: Content Security Policy and other security headers
- **Input Validation**: Client-side validation with server-side verification
- **JWT Security**: Secure token storage and automatic refresh

## 📈 Analytics

The app includes:
- **User Analytics**: Track user engagement and behavior
- **Performance Monitoring**: Real User Monitoring (RUM)
- **Error Tracking**: Automatic error reporting and monitoring
- **A/B Testing**: Framework for feature experimentation

## 🐛 Troubleshooting

### Common Issues

**Build fails with memory error:**
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

**API connection issues:**
- Verify backend is running on correct port
- Check CORS configuration on backend
- Verify API_URL in environment variables

**Styling not loading:**
- Ensure Tailwind CSS is properly configured
- Check that CSS imports are in correct order
- Verify PostCSS plugins are installed

## 📚 API Integration

The frontend integrates with the backend API:

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Events Endpoints
- `GET /api/events` - List events with filters
- `POST /api/events` - Create new event
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Registration Endpoints
- `POST /api/registrations/events/:eventId` - Register for event
- `GET /api/registrations` - Get user registrations
- `PUT /api/registrations/:id` - Update registration
- `DELETE /api/registrations/:id` - Cancel registration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Contribution Guidelines
- Follow the existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure accessibility compliance
- Test on multiple browsers and devices

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- 📧 Email: support@eventhub.edu
- 💬 GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- 📖 Documentation: [View docs](https://docs.eventhub.edu)

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Vite team for the blazing-fast build tool
- Lucide for the beautiful icon set
- All contributors who helped make this project better

---

Made with ❤️ for educational institutions worldwide.