import { useState, useEffect } from 'react'
import { Link ,useLocation } from 'react-router-dom'
import { eventsAPI } from '../../services/api'
import { 
  Calendar, 
  Users, 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatDate, formatTime } from '../../utils/helpers'
import toast from 'react-hot-toast'

const ManageEvents = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [reload, setReload] = useState(false)
  const location = useLocation() 

  const filters = [
    { value: 'all', label: 'All Events' },
    { value: 'approved', label: 'Approved' },
    { value: 'pending', label: 'Pending' },
    { value: 'rejected', label: 'Rejected' }
  ]

useEffect(() => {
  if (location.state?.reload) {
    setReload(prev => !prev)  // triggers re-fetch
  }
}, [location.state])

    useEffect(() => {
    fetchEvents()
  }, [filter, reload])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const params = { 
        ...(filter !== 'all' && { status: filter })
      }
      const response = await eventsAPI.getEvents(params)
      setEvents(response.data.events)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventsAPI.deleteEvent(eventId)
        toast.success('Event deleted successfully')
        fetchEvents()
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to delete event'
        toast.error(message)
      }
    }
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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Events</h1>
            <p className="text-gray-600 mt-2">View and manage your created events</p>
          </div>
          <Link to="/organizer/create-event" className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Link>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {filters.map((filterOption) => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
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

        {/* Events List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="large" text="Loading your events..." />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't created any events yet." 
                : `No ${filter} events found.`}
            </p>
            <Link to="/organizer/create-event" className="btn btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Event
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event._id} className="card p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(event.status)}
                      <h3 className="text-xl font-semibold text-gray-900 truncate">
                        {event.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(event.date)} at {formatTime(event.time)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.venue}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        {event.registrationCount || 0} / {event.capacity}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Category:</span> {event.category}
                      </div>
                    </div>

                    {/* Registration Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, ((event.registrationCount || 0) / event.capacity) * 100)}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="ml-6 flex items-center space-x-2">
                    <Link
                      to={`/events/${event._id}`}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      title="View Event"
                    >
                      <Eye className="h-5 w-5" />
                    </Link>

                    <Link
                       to={`/organizer/events/${event._id}/registrants`}
                       className="p-2 text-indigo-500 hover:text-indigo-700 transition-colors duration-200"
                       title="View Registrants"
            >
                       <Users className="h-5 w-5" />
                    </Link>

                    {event.status !== 'rejected' && new Date(event.date) > new Date() && (
                      <button
                        className="p-2 text-blue-400 hover:text-blue-600 transition-colors duration-200"
                        title="Edit Event"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                    )}

                    {(event.registrationCount || 0) === 0 && (
                      <button
                        onClick={() => handleDeleteEvent(event._id)}
                        className="p-2 text-red-400 hover:text-red-600 transition-colors duration-200"
                        title="Delete Event"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>

                {event.rejectionReason && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      <span className="font-medium">Rejection Reason:</span> {event.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageEvents