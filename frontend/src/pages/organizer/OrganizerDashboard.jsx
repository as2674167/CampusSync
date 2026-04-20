import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { eventsAPI } from '../../services/api'
import { 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  Plus,
  ArrowRight,
  BarChart3,
  Settings
} from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatDate } from '../../utils/helpers'

const OrganizerDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({})
  const [recentEvents, setRecentEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch user's events
      const eventsResponse = await eventsAPI.getEvents({ organizer: user._id, limit: 5 })
      setRecentEvents(eventsResponse.data.events)

      // Calculate stats
      const events = eventsResponse.data.events
      const statsData = {
        total: events.length,
        approved: events.filter(e => e.status === 'approved').length,
        pending: events.filter(e => e.status === 'pending').length,
        totalRegistrations: events.reduce((sum, e) => sum + (e.registrationCount || 0), 0)
      }
      setStats(statsData)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading your dashboard..." />
      </div>
    )
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your events and track their performance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total || 0}
                </p>
                <p className="text-gray-600">Total Events</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.approved || 0}
                </p>
                <p className="text-gray-600">Approved</p>
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
                  {stats.pending || 0}
                </p>
                <p className="text-gray-600">Pending</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-8 w-8 text-purple-600" />
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Events */}
          <div className="lg:col-span-2 card">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Your Events</h2>
                <Link 
                  to="/organizer/manage-events" 
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="p-6">
              {recentEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">You haven't created any events yet</p>
                  <Link to="/organizer/create-event" className="btn btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Event
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentEvents.map((event) => (
                    <div key={event._id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusIcon(event.status)}
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                              {event.title}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                              {event.status}
                            </span>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4 mt-2">
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Date:</span> {formatDate(event.date)}
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Venue:</span> {event.venue}
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Capacity:</span> {event.capacity}
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Registered:</span> {event.registrationCount || 0}
                            </div>
                          </div>

                          <div className="mt-4">
                          <Link
                             to={`/organizer/events/${event._id}/registrants`}
                            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                             >View registrants<ArrowRight className="ml-1 h-4 w-4" />
                          </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link 
                  to="/organizer/create-event" 
                  className="btn btn-primary w-full flex items-center justify-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Event
                </Link>
                <Link 
                  to="/organizer/manage-events" 
                  className="btn btn-outline w-full flex items-center justify-center"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Events
                </Link>
                <Link 
                  to="/events" 
                  className="btn btn-outline w-full flex items-center justify-center"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Browse All Events
                </Link>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Submit events at least 5 days before the event date for approval</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Include clear descriptions and requirements to attract more participants</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Monitor registrations and communicate with participants before events</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrganizerDashboard