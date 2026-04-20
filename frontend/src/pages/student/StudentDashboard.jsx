import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { eventsAPI, registrationsAPI } from '../../services/api'
import { 
  Calendar, 
  Users, 
  Clock, 
  MapPin, 
  Plus, 
  ArrowRight,
  CheckCircle 
} from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatDate, formatTime } from '../../utils/helpers'

const StudentDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({})
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [myRegistrations, setMyRegistrations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch upcoming events
      const eventsResponse = await eventsAPI.getEvents({ 
        limit: 6, 
        fromDate: new Date().toISOString().split('T')[0] 
      })
      setUpcomingEvents(eventsResponse.data.events)

      // Fetch user registrations
      const registrationsResponse = await registrationsAPI.getRegistrations({ limit: 5 })
      setMyRegistrations(registrationsResponse.data.registrations)
      setStats(registrationsResponse.data.stats)

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening in your campus events
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
                  {stats.registered || 0}
                </p>
                <p className="text-gray-600">Registered</p>
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
                  {stats.attended || 0}
                </p>
                <p className="text-gray-600">Attended</p>
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
                  {stats.waitlisted || 0}
                </p>
                <p className="text-gray-600">Waitlisted</p>
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
                  {upcomingEvents.length}
                </p>
                <p className="text-gray-600">Available</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upcoming Events */}
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
                <Link 
                  to="/events" 
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="p-6">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">No upcoming events</p>
                  <Link to="/events" className="btn btn-primary mt-4">
                    Browse Events
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <Link
                      key={event._id}
                      to={`/events/${event._id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {event.title}
                          </h3>
                          <div className="mt-2 flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(event.date)} at {formatTime(event.time)}
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-1" />
                            {event.venue}
                          </div>
                        </div>
                        <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                          {event.category}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* My Registrations */}
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">My Registrations</h2>
                <Link 
                  to="/student/registrations" 
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="p-6">
              {myRegistrations.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">No registrations yet</p>
                  <Link to="/events" className="btn btn-primary mt-4">
                    Register for Events
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {myRegistrations.map((registration) => (
                    <div key={registration._id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/events/${registration.event._id}`}
                            className="text-lg font-medium text-gray-900 hover:text-blue-600"
                          >
                            {registration.event.title}
                          </Link>
                          <div className="mt-2 flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(registration.event.date)}
                          </div>
                        </div>
                        <span className={`ml-4 px-3 py-1 rounded-full text-sm font-medium $${
                          registration.status === 'registered'
                            ? 'bg-green-100 text-green-600'
                            : registration.status === 'waitlisted'
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {registration.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
              <Link to="/events" className="btn btn-primary">
                <Calendar className="h-4 w-4 mr-2" />
                Browse Events
              </Link>
              <Link to="/student/registrations" className="btn btn-outline">
                <Users className="h-4 w-4 mr-2" />
                My Registrations
              </Link>
              <Link to="/profile" className="btn btn-outline">
                <Users className="h-4 w-4 mr-2" />
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard