import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { eventsAPI } from '../services/api'
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  ChevronRight
} from 'lucide-react'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatDate, formatTime, getEventStatusColor, getEventStatusText, getEventCategoryIcon } from '../utils/helpers'

const EventsPage = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    fromDate: '',
    toDate: ''
  })
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    totalEvents: 0
  })

  const location = useLocation()

  const categories = ['Academic', 'Cultural', 'Sports', 'Technical', 'Workshop', 'Seminar', 'Competition']

  useEffect(() => {
    fetchEvents()
  }, [searchTerm, filters, pagination.current, location.key])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.current,
        limit: 12,
        ...(searchTerm && { search: searchTerm }),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      }

      const response = await eventsAPI.getEvents(params)
      console.log("API Response:", response.data)

      // Handle both response types: { events: [...] } or just [...]
      const eventsData = Array.isArray(response.data)
        ? response.data
        : response.data.events

      setEvents(eventsData || [])
      setPagination(response.data.pagination || { 
        current: 1, 
        total: 1, 
        totalEvents: eventsData?.length || 0 
      })
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilters({
      category: '',
      status: '',
      fromDate: '',
      toDate: ''
    })
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Events</h1>
          <p className="text-gray-600">Discover and register for exciting campus events</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            {/* Category Filter */}
            <select
              className="input-field"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Date Range */}
            <input
              type="date"
              className="input-field"
              value={filters.fromDate}
              onChange={(e) => handleFilterChange('fromDate', e.target.value)}
              placeholder="From Date"
            />

            <input
              type="date"
              className="input-field"
              value={filters.toDate}
              onChange={(e) => handleFilterChange('toDate', e.target.value)}
              placeholder="To Date"
            />
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {events.length} of {pagination.totalEvents} events
            </p>
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="large" text="Loading events..." />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {events.map((event) => (
              <EventCard key={event._id || event.id} event={event} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.total > 1 && (
          <div className="flex justify-center">
            <nav className="flex space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, current: Math.max(1, prev.current - 1) }))}
                disabled={pagination.current === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {[...Array(pagination.total)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setPagination(prev => ({ ...prev, current: index + 1 }))}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    pagination.current === index + 1
                      ? 'text-white bg-blue-600'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                onClick={() => setPagination(prev => ({ ...prev, current: Math.min(prev.total, prev.current + 1) }))}
                disabled={pagination.current === pagination.total}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  )
}

// Event Card Component
const EventCard = ({ event }) => {
  const statusColor = getEventStatusColor(event.status)
  const statusText = getEventStatusText(event.status)
  const categoryIcon = getEventCategoryIcon(event.category)

  return (
    <Link
      to={`/events/${event._id || event.id}`}
      className="card hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 group"
    >
      <div className="relative">
        <img
          src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop'}
          alt={event.title}
          className="w-full h-48 object-cover rounded-t-xl"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            {statusText}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <span className="text-2xl">{categoryIcon}</span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-600">{event.category}</span>
          <span className="text-sm text-gray-500">{event.organizerName}</span>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
          {event.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            {event.date ? formatDate(event.date) : 'TBA'} at {event.time ? formatTime(event.time) : 'TBA'}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            {event.venue}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            {event.registrationCount || 0} / {event.capacity} registered
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: event.capacity > 0
                  ? `${Math.min(100, ((event.registrationCount || 0) / event.capacity) * 100)}%`
                  : '0%'
              }}
            />
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 ml-2 group-hover:text-blue-600 transition-colors duration-200" />
        </div>
      </div>
    </Link>
  )
}

export default EventsPage
