import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { eventsAPI } from '../services/api'
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Users,
  ChevronRight
} from 'lucide-react'
import LoadingSpinner from '../components/common/LoadingSpinner'
import {
  formatDate,
  formatTime,
  getEventStatusColor,
  getEventStatusText,
  getEventCategoryIcon
} from '../utils/helpers'


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

  const categories = [
    'Academic',
    'Cultural',
    'Sports',
    'Technical',
    'Workshop',
    'Seminar',
    'Competition'
  ]

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
    <div className="events-page-shell min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Box */}
        <div className="events-header-box mb-8 animate-fadeInUp">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-sm font-medium mb-4">
            <Filter className="h-4 w-4" />
            Explore campus events
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 tracking-tight">
            Browse Events
          </h1>
          <p className="text-slate-600 text-base">
            Discover and register for exciting campus events
          </p>
        </div>

        {/* Search and Filters Box */}
        <div className="events-toolbar-box p-6 mb-8 animate-fadeInUp">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search events..."
                className="events-input pl-10"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            <select
              className="events-input"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <input
              type="date"
              className="events-input"
              value={filters.fromDate}
              onChange={(e) => handleFilterChange('fromDate', e.target.value)}
            />

            <input
              type="date"
              className="events-input"
              value={filters.toDate}
              onChange={(e) => handleFilterChange('toDate', e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center flex-wrap gap-3">
            <p className="text-sm text-slate-600">
              Showing <span className="font-semibold text-slate-900">{events.length}</span> of{' '}
              <span className="font-semibold text-slate-900">{pagination.totalEvents}</span> events
            </p>
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
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
          <div className="events-empty-box text-center py-12 animate-fadeInUp">
            <Calendar className="mx-auto h-16 w-16 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No events found</h3>
            <p className="text-slate-600">Try adjusting your search criteria or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {events.map((event, index) => (
              <EventCard
                key={event._id || event.id}
                event={event}
                index={index}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.total > 1 && (
          <div className="flex justify-center">
            <nav className="events-pagination-box">
              <button
                onClick={() => setPagination(prev => ({
                  ...prev,
                  current: Math.max(1, prev.current - 1)
                }))}
                disabled={pagination.current === 1}
                className="events-page-btn"
              >
                Previous
              </button>

              {[...Array(pagination.total)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setPagination(prev => ({
                    ...prev,
                    current: index + 1
                  }))}
                  className={`events-page-number ${
                    pagination.current === index + 1 ? 'active' : ''
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                onClick={() => setPagination(prev => ({
                  ...prev,
                  current: Math.min(prev.total, prev.current + 1)
                }))}
                disabled={pagination.current === pagination.total}
                className="events-page-btn"
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

const EventCard = ({ event, index }) => {
  const statusColor = getEventStatusColor(event.status)
  const statusText = getEventStatusText(event.status)
  const categoryIcon = getEventCategoryIcon(event.category)

  const progress =
    event.capacity > 0
      ? `${Math.min(100, ((event.registrationCount || 0) / event.capacity) * 100)}%`
      : '0%'

  return (
    <Link
      to={`/events/${event._id || event.id}`}
      className="event-card-box group animate-fadeInUp"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div className="relative">
        <img
          src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop'}
          alt={event.title}
          className="w-full h-48 object-cover rounded-t-[22px] event-card-image-box"
        />

        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium bg-white/90 shadow-sm ${statusColor}`}>
            {statusText}
          </span>
        </div>

        <div className="absolute top-4 right-4">
          <span className="text-xl bg-white/95 shadow-sm w-10 h-10 rounded-full flex items-center justify-center border border-slate-100">
            {categoryIcon}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-2 gap-3">
          <span className="text-sm font-semibold text-blue-600">
            {event.category}
          </span>
          <span className="text-sm text-slate-500 truncate">
            {event.organizerName}
          </span>
        </div>

        <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors duration-200">
          {event.title}
        </h3>

        <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-6">
          {event.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-slate-600">
            <Calendar className="h-4 w-4 mr-2 text-slate-400" />
            {event.date ? formatDate(event.date) : 'TBA'} at {event.time ? formatTime(event.time) : 'TBA'}
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <MapPin className="h-4 w-4 mr-2 text-slate-400" />
            {event.venue}
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <Users className="h-4 w-4 mr-2 text-slate-400" />
            {event.registrationCount || 0} / {event.capacity} registered
          </div>
        </div>

        <div className="flex justify-between items-center gap-3">
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: progress }}
            />
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200" />
        </div>
      </div>
    </Link>
  )
}

export default EventsPage