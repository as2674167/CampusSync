import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'

const DashboardPage = () => {
  const { user, loading } = useAuth()

  useEffect(() => {
    // This page just redirects to the appropriate role-based dashboard
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading your dashboard..." />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Redirect to role-specific dashboard
  return <Navigate to={`/${user.role}`} replace />
}

export default DashboardPage