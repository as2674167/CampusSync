import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { registrationsAPI } from '../../services/api'
import { Calendar, MapPin, Clock, Users, Filter, X } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatDate, formatTime } from '../../utils/helpers'
import toast from 'react-hot-toast'

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [stats, setStats] = useState({})

  const filters = [
    { value: 'all', label: 'All Registrations' },
    { value: 'registered', label: 'Confirmed' },
    { value: 'waitlisted', label: 'Waitlisted' },
    { value: 'attended', label: 'Attended' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  useEffect(() => {
    fetchRegistrations()
  }, [filter])

  const fetchRegistrations = async () => {
    try {
      setLoading(true)
      const params = filter !== 'all' ? { status: filter } : {}
      const response = await registrationsAPI.getRegistrations(params)
      setRegistrations(response.data.registrations)
      setStats(response.data.stats)
    } catch (error) {
      console.error('Error fetching registrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelRegistration = async (registrationId) => {
    if (window.confirm('Are you sure you want to cancel this registration?')) {
      try {
        await registrationsAPI.updateRegistration(registrationId, { status: 'cancelled' })
        toast.success('Registration cancelled successfully')
        fetchRegistrations()
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to cancel registration'
        toast.error(message)
      }
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      registered: 'bg-green-100 text-green-800',
      waitlisted: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      attended: 'bg-blue-100 text-blue-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Registrations</h1>
          <p className="text-gray-600 mt-2">Track and manage your event registrations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.registered || 0}</div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.waitlisted || 0}</div>
            <div className="text-sm text-gray-600">Waitlisted</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.attended || 0}</div>
            <div className="text-sm text-gray-600">Attended</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-red-600">{stats.cancelled || 0}</div>
            <div className="text-sm text-gray-600">Cancelled</div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {filters.map((filterOption) => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 $${
                  filter === filterOption.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>

        {/* Registrations List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="large" text="Loading registrations..." />
          </div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No registrations found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't registered for any events yet." 
                : `No ${filter} registrations found.`}
            </p>
            <Link to="/events" className="btn btn-primary">
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map((registration) => (
              <div key={registration._id} className="card p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <Link
                        to={`/events/${registration.event._id}`}
                        className="text-xl font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {registration.event.title}
                      </Link>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(registration.status)}`}>
                        {registration.status}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(registration.event.date)} at {formatTime(registration.event.time)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {registration.event.venue}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          {registration.event.category}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Registered:</span>
                          <span className="ml-2 text-gray-600">
                            {formatDate(registration.registrationDate)}
                          </span>
                        </div>
                        {registration.checkInTime && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Checked In:</span>
                            <span className="ml-2 text-gray-600">
                              {formatDate(registration.checkInTime)}
                            </span>
                          </div>
                        )}
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Organizer:</span>
                          <span className="ml-2 text-gray-600">
                            {registration.event.organizer?.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {registration.event.description && (
                      <p className="mt-4 text-sm text-gray-600 line-clamp-2">
                        {registration.event.description}
                      </p>
                    )}
                  </div>

                  <div className="ml-4 flex-shrink-0">
                    {registration.status === 'registered' && new Date(registration.event.date) > new Date() && (
                      <button
                        onClick={() => handleCancelRegistration(registration._id)}
                        className="btn btn-outline text-red-600 border-red-300 hover:bg-red-50 text-sm"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyRegistrations