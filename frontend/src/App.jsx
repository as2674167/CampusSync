import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

// Components
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import LoadingSpinner from './components/common/LoadingSpinner'
import ProtectedRoute from './components/common/ProtectedRoute'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import EventsPage from './pages/EventsPage'
import EventDetailPage from './pages/EventDetailPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'
import GalleryPage from './pages/GalleryPage'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminEvents from './pages/admin/AdminEvents'
import AdminReports from './pages/admin/AdminReports'

// Organizer Pages
import OrganizerDashboard from './pages/organizer/OrganizerDashboard'
import CreateEvent from './pages/organizer/CreateEvent'
import ManageEvents from './pages/organizer/ManageEvents'
import EventRegistrantsPage from './pages/organizer/EventRegistrantsPage'

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard'
import MyRegistrations from './pages/student/MyRegistrations'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} 
          />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />

          {/* Student Routes */}
          <Route path="/student" element={
            <ProtectedRoute roles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />

          <Route path="/student/registrations" element={
            <ProtectedRoute roles={['student']}>
              <MyRegistrations />
            </ProtectedRoute>
          } />

          {/* Organizer Routes */}
          <Route path="/organizer" element={
            <ProtectedRoute roles={['organizer']}>
              <OrganizerDashboard />
            </ProtectedRoute>
          } />

          <Route path="/organizer/create-event" element={
            <ProtectedRoute roles={['organizer']}>
              <CreateEvent />
            </ProtectedRoute>
          } />

          <Route path="/organizer/edit-event/:id" element={
          <ProtectedRoute roles={['organizer']}>
           <CreateEvent />
           </ProtectedRoute>
          } />

          <Route path="/organizer/manage-events" element={
            <ProtectedRoute roles={['organizer']}>
              <ManageEvents />
            </ProtectedRoute>
          } />

          <Route path="/organizer/events/:id/registrants" element={
            <ProtectedRoute roles={['organizer']}>
              <EventRegistrantsPage />
               </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin/users" element={
            <ProtectedRoute roles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          } />

          <Route path="/admin/events" element={
            <ProtectedRoute roles={['admin']}>
              <AdminEvents />
            </ProtectedRoute>
          } />

          <Route path="/admin/reports" element={
            <ProtectedRoute roles={['admin']}>
              <AdminReports />
            </ProtectedRoute>
          } />

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App