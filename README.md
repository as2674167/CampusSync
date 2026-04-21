# CampusSync – College Event Management Platform

CampusSync is a full‑stack web application for managing college events end‑to‑end — from organizer creation and admin approvals to student discovery, registration, attendance, and post‑event insights.

It is structured as a monorepo with separate `backend` (REST API) and `frontend` (React SPA) projects.

---

## ✨ Features

- **Role‑based access**
  - Admin: approve/reject events, manage users, view reports and system stats
  - Organizer: create & edit events, manage registrations, view event‑level analytics
  - Student: browse events, register, view tickets/registrations, and track participation

- **Event lifecycle**
  - Event creation by organizers with rich details (cover image, capacity, requirements, tags)
  - Admin approval workflow (pending/approved/rejected with reasons)
  - Upcoming / ongoing / past event views

- **Smart registrations**
  - Student registration for approved events
  - Capacity enforcement and registration deadlines
  - Check‑in / attendance tracking
  - Export registrations (CSV) for offline use

- **📧 Email Notifications (via Nodemailer)**
  - Organizer receives an email when their event is **approved or rejected** by admin (with rejection reason included)
  - Student receives a **confirmation email** on successful event registration
  - Student receives a **cancellation email** when their registration is cancelled
  - Organizer gets notified when a **new student registers** for their event
  - **Welcome email** sent when a new user signs up
  - All emails are sent via SMTP — fully configurable via `.env`

- **Media & gallery**
  - Image upload for events and gallery using Cloudinary / ImageKit
  - Like / engagement support for gallery images

- **Admin insights & reports**
  - System overview: total users, events, registrations, pending approvals
  - Role breakdown (students vs organizers vs admins)
  - Popular events ranked by registrations
  - Recent activity snapshots (last 7 days)

- **Production‑ready UX**
  - Modern glassmorphism UI with Tailwind CSS
  - Fully responsive for desktop and mobile
  - Toast notifications and loading/skeleton states
  - Form validation and friendly error messages

---

## 🧱 Tech Stack

### Frontend

| Tech | Purpose |
|---|---|
| React 18 (Vite) | UI framework & build tool |
| React Router DOM | Client‑side routing |
| Tailwind CSS | Styling & layout |
| Axios | API client |
| React Hook Form | Form management & validation |
| React Hot Toast | Toast notifications |
| Lucide React | Icon library |
| Recharts | Charts & admin analytics |

### Backend

| Tech | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & data modeling |
| JWT (jsonwebtoken) | Auth tokens |
| bcryptjs | Password hashing |
| Nodemailer | Transactional emails |
| Multer | File upload handling |
| Cloudinary / ImageKit | Cloud image storage |
| helmet, cors, express‑rate‑limit | Security middleware |
| morgan | HTTP request logging |

---

## 📁 Project Structure

```bash
CampusSync/
├── backend/                  # Node/Express REST API + MongoDB
│   ├── config/               # DB + third‑party service config
│   ├── middleware/           # Auth, validation, rate limiting, error handling
│   ├── models/               # Mongoose schemas (User, Event, Registration, etc.)
│   ├── routes/               # API routes (auth, users, events, registrations, gallery)
│   ├── utils/                # Helpers (email sender, tokens, image helpers)
│   ├── scripts/              # Utility scripts (seed data, migrations)
│   ├── healthcheck.js        # Health check endpoint for Render/hosting
│   ├── server.js             # Express app entry point
│   └── README.md             # Backend‑specific docs
│
├── frontend/                 # React SPA (Vite + Tailwind)
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route‑level pages (auth, admin, organizer, student)
│   │   ├── services/         # API layer (axios instance + API modules)
│   │   └── App.jsx           # Root app + routes
│   └── README.md             # Frontend‑specific docs
│
└── package-lock.json
```

For lower‑level details, see [`backend/README.md`](backend/README.md) and [`frontend/README.md`](frontend/README.md).

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js** (LTS recommended)
- **npm**
- **MongoDB** instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- Cloudinary or ImageKit account for image storage
- SMTP credentials for email (Gmail, SendGrid, Brevo, etc.)

---

### 1. Clone the repository

```bash
git clone https://github.com/as2674167/CampusSync.git
cd CampusSync
```

---

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# ImageKit
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
FROM_EMAIL=no-reply@campussync.com
FROM_NAME=CampusSync
```

Start the backend:

```bash
npm run dev     # Development (nodemon)
npm start       # Production
```

The API runs at `http://localhost:5000/api` by default.

---

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

---

## 🚀 Deployment

### Backend → Render (or any Node host)

- **Root directory:** `backend`
- **Build command:** `npm install`
- **Start command:** `npm start`
- Set all environment variables from the `.env` above in your Render dashboard
- The `healthcheck.js` file is already included for Render health checks

### Frontend → Vercel / Netlify / Render Static

```bash
cd frontend
npm run build
```

Deploy the `frontend/dist` folder. Set the environment variable at build time:

```env
VITE_API_URL=https://your-backend.onrender.com/api
```

> ⚠️ **Important for Render free tier:** The backend spins down after 15 minutes of inactivity. The first request after idle may take 30–60 seconds. Consider using a keep‑alive ping service or upgrading to a paid plan for production.

---

## 🔐 Authentication & Authorization

- JWT‑based authentication with tokens passed as `Authorization: Bearer <token>`
- Backend middleware:
  - `authenticate` — validates the token and attaches `req.user`
  - `authorize(roles)` — restricts routes to specific roles (`admin`, `organizer`, `student`)
- Frontend protected routes using role‑aware route guards
- Passwords hashed with `bcryptjs` before storage

---

## 📧 Email Notifications

CampusSync uses **Nodemailer** for all transactional emails via SMTP.

| Trigger | Recipient | Email sent |
|---|---|---|
| New user signs up | Student / Organizer | Welcome & getting started email |
| Event submitted for review | Admin | New event pending approval |
| Event approved | Organizer | Approval confirmation with event link |
| Event rejected | Organizer | Rejection notice with reason |
| Student registers for event | Student | Registration confirmation with details |
| Student registration cancelled | Student | Cancellation notice |
| New registration on their event | Organizer | New attendee notification |

Configure SMTP credentials in `backend/.env` to enable emails. Works with Gmail (App Password), SendGrid, Brevo, Mailgun, etc.

---

## 📊 Key Modules

- **Auth & Users** — Login, registration, profile fetch & update, change password, role management, activate/deactivate users (admin)
- **Events** — Full CRUD for organizers, status flow (pending → approved/rejected) managed by admin, registration windows, capacity, deadlines
- **Registrations** — Student register/cancel, organizer check‑in (attendance), CSV export
- **Gallery** — Cloud image uploads, like/toggle
- **Admin Reports** — System stats, role breakdown, popular events, recent activity

---

## 🧪 Linting

```bash
# Frontend
cd frontend
npm run lint
```

ESLint with React, React Hooks, and React Refresh plugins configured.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "feat: add your feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a Pull Request

---

## 💡 Future Enhancements

- QR code based check‑in and attendance scanning
- WhatsApp / SMS notifications alongside email
- Advanced analytics (cohort analysis, event retention trends)
- Multi‑campus support with a super‑admin layer
- Public shareable event landing pages
- Mobile app (React Native)

---

## 📄 License

ISC License — see `backend/package.json` for details.

---

<p align="center">Made with ❤️ using the MERN stack</p>
