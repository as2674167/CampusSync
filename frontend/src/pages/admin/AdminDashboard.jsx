import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { usersAPI, eventsAPI } from '../../services/api'
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle,
  AlertCircle,
  TrendingUp 
} from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const AdminDashboard = () => {
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await usersAPI.getSystemStats()
      setStats(response.data.overview)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading admin dashboard..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">System overview and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
               
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalUsers || 0}
                </p>
                <p className="text-gray-600">Total Users</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalEvents || 0}
                </p>
                <p className="text-gray-600">Total Events</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendingApprovals || 0}
                </p>
                <p className="text-gray-600">Pending Approvals</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalRegistrations || 0}
                </p>
                <p className="text-gray-600">Total Registrations</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full btn btn-primary"
                onClick={() => navigate('/admin/events')} >
                <Clock className="h-4 w-4 mr-2" />
                Review Pending Events
              </button>
              <button className="w-full btn btn-outline" onClick={() => navigate('/admin/users')}>
                Manage Users
              </button>
              <button className="w-full btn btn-outline"
                onClick={() => navigate('/admin/reports')} >
                <TrendingUp className="h-4 w-4 mr-2" />
                View Reports
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <p>5 new events submitted for approval</p>
              <p>12 new user registrations today</p>
              <p>3 events completed successfully</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard