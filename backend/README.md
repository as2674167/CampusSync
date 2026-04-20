# College Event Management System - Backend

A comprehensive backend API for managing college events, built with Node.js, Express.js, and MongoDB.

## Features

- 🔐 **Authentication & Authorization**: JWT-based auth with role-based access control
- 👥 **User Management**: Admin, Organizer, and Student roles
- 📅 **Event Management**: Create, update, approve, and manage events
- 📝 **Registration System**: Event registration with capacity management and waitlists
- 📧 **Email Notifications**: Automated email notifications for various actions
- 📊 **Analytics & Reports**: Event statistics and user analytics
- 🔍 **Search & Filtering**: Advanced search and filtering capabilities
- 📱 **API Documentation**: RESTful API with comprehensive endpoints

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd college-event-management-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/college_event_management
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

5. Seed the database (optional):
   ```bash
   node scripts/seedData.js
   ```

6. Start the server:
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

The server will start on `http://localhost:5000`.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout user

### Events
- `GET /api/events` - Get all events (with filters)
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create new event (Organizer/Admin)
- `PUT /api/events/:id` - Update event (Owner/Admin)
- `DELETE /api/events/:id` - Delete event (Owner/Admin)
- `PUT /api/events/:id/status` - Approve/reject event (Admin)
- `GET /api/events/:id/registrations` - Get event registrations (Organizer/Admin)

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get single user (Admin/Self)
- `PUT /api/users/:id` - Update user (Admin/Self)
- `DELETE /api/users/:id` - Deactivate user (Admin)
- `GET /api/users/:id/events` - Get user's events
- `GET /api/users/stats/overview` - Get system statistics (Admin)

### Registrations
- `POST /api/registrations/events/:eventId` - Register for event (Student)
- `GET /api/registrations` - Get user's registrations
- `GET /api/registrations/:id` - Get single registration
- `PUT /api/registrations/:id` - Update registration (cancel, etc.)
- `DELETE /api/registrations/:id` - Delete registration
- `POST /api/registrations/:id/checkin` - Check-in user (Organizer/Admin)
- `GET /api/registrations/events/:eventId/export` - Export registrations (Organizer/Admin)

## User Roles

### Admin
- Full system access
- Approve/reject events
- Manage all users and events
- View system analytics

### Organizer
- Create and manage own events
- View registrations for own events
- Update event details

### Student
- Browse and register for approved events
- View own registrations
- Cancel registrations

## Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (student/organizer/admin),
  studentId: String (unique, sparse),
  department: String,
  phone: String,
  avatar: String,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Event Model
```javascript
{
  title: String (required),
  description: String (required),
  date: Date (required),
  time: String (required),
  venue: String (required),
  category: String (required),
  capacity: Number (required),
  image: String,
  organizer: ObjectId (ref: User),
  organizerName: String,
  status: String (pending/approved/rejected/cancelled/completed),
  registrationDeadline: Date (required),
  tags: [String],
  requirements: String,
  contactInfo: { email, phone },
  isPublished: Boolean,
  viewCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Registration Model
```javascript
{
  event: ObjectId (ref: Event),
  user: ObjectId (ref: User),
  status: String (registered/waitlisted/cancelled/attended/no-show),
  registrationDate: Date,
  additionalInfo: {
    dietaryRestrictions: String,
    specialRequirements: String,
    emergencyContact: { name, phone }
  },
  checkInTime: Date,
  feedback: {
    rating: Number,
    comment: String,
    submittedAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS protection
- Helmet for security headers
- MongoDB injection prevention

## Error Handling

The API uses consistent error responses:
```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field-specific error",
      "value": "invalid value"
    }
  ]
}
```

## Email Notifications

The system sends automated emails for:
- Event approval/rejection
- Registration confirmation
- Waitlist notifications
- Event reminders
- Status updates

## Development

### Running Tests
```bash
npm test
```

### Code Style
The project uses ESLint for code formatting. Run:
```bash
npm run lint
```

### Database Seeding
To populate the database with sample data:
```bash
node scripts/seedData.js
```

## Deployment

### Environment Variables
Ensure all production environment variables are set:
- `NODE_ENV=production`
- `MONGODB_URI` (MongoDB Atlas connection string)
- `JWT_SECRET` (strong, unique secret)
- Email configuration for notifications

### Build and Deploy
```bash
# Install production dependencies
npm ci --only=production

# Start production server
npm start
```

## API Testing

You can test the API using the provided sample data:

**Admin Login:**
- Email: `admin@college.edu`
- Password: `admin123`

**Organizer Login:**
- Email: `john.organizer@college.edu`
- Password: `organizer123`

**Student Login:**
- Email: `alice.student@college.edu`
- Password: `student123`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue in the repository or contact the development team.
