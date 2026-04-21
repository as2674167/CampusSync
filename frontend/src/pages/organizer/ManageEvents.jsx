import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
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
      setReload((prev) => !prev) // triggers re-fetch
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
        const message =
          error.response?.data?.message || 'Failed to delete event'
        toast.error(message)
      }
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-rose-500" />
      default:
        return <Clock className="h-5 w-5 text-amber-500" />
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      approved: 'bg-emerald-50 text-emerald-700',
      pending: 'bg-amber-50 text-amber-700',
      rejected: 'bg-rose-50 text-rose-700'
    }
    return colors[status] || 'bg-slate-50 text-slate-700'
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(129,140,248,0.16),_transparent_35%),linear-gradient(to_bottom,_#f5f7ff,_#edf2ff,_#f8fafc)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Manage Events
            </h1>
            <p className="mt-2 text-slate-600">
              View and manage all the events you&apos;ve created
            </p>
          </div>
          <Link
            to="/organizer/create-event"
            className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(79,70,229,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(79,70,229,0.55)]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6">
          <div className="inline-flex flex-wrap gap-2 rounded-full bg-white/60 p-1 shadow-[0_10px_35px_rgba(15,23,42,0.12)] backdrop-blur">
            {filters.map((filterOption) => {
              const active = filter === filterOption.value
              return (
                <button
                  key={filterOption.value}
                  onClick={() => setFilter(filterOption.value)}
                  className={`rounded-full px-4 py-1.5 text-xs md:text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-slate-900 text-white shadow-[0_10px_30px_rgba(15,23,42,0.45)] scale-[1.03]'
                      : 'bg-transparent text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {filterOption.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="large" text="Loading your events..." />
          </div>
        ) : events.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-[26px] border border-white/70 bg-white/95 px-6 py-12 text-center shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100">
              <Calendar className="h-9 w-9 text-slate-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900">
              No events found
            </h3>
            <p className="mb-6 text-sm text-slate-600">
              {filter === 'all'
                ? "You haven't created any events yet."
                : `No ${filter} events found.`}
            </p>
            <Link
              to="/organizer/create-event"
              className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(79,70,229,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(79,70,229,0.55)]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Event
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {events.map((event) => (
              <div
                key={event._id}
                className="group overflow-hidden rounded-[24px] border border-white/80 bg-white/95 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.10)] backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:bg-gradient-to-b hover:from-white/98 hover:via-slate-50/95 hover:to-blue-50/80 hover:shadow-[0_28px_75px_rgba(59,130,246,0.22)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {/* Title + status */}
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      {getStatusIcon(event.status)}
                      <h3 className="truncate text-lg md:text-xl font-semibold text-slate-900">
                        {event.title}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold capitalize ${getStatusColor(
                          event.status
                        )}`}
                      >
                        {event.status}
                      </span>
                    </div>

                    {/* Description */}
                    {event.description && (
                      <p className="mb-3 text-sm text-slate-600 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    {/* Event meta grid */}
                    <div className="mb-4 grid gap-4 text-sm text-slate-600 md:grid-cols-2 lg:grid-cols-4">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                        <span>
                          {formatDate(event.date)} at {formatTime(event.time)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-pink-500" />
                        <span>{event.venue}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4 text-violet-500" />
                        <span>
                          {event.registrationCount || 0} / {event.capacity}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">
                          Category:
                        </span>{' '}
                        {event.category}
                      </div>
                    </div>

                    {/* Registration Progress Bar */}
                    <div className="mb-2 w-full rounded-full bg-slate-200/70">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            ((event.registrationCount || 0) / event.capacity) *
                              100
                          ).toFixed(0)}%`
                        }}
                      />
                    </div>
                    <div className="text-right text-[11px] font-medium text-slate-500">
                      {Math.min(
                        100,
                        ((event.registrationCount || 0) / event.capacity) * 100
                      ).toFixed(0)}
                      % filled
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="ml-4 flex flex-shrink-0 flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/events/${event._id}`}
                        className="rounded-full p-2 text-slate-400 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 hover:text-slate-700"
                        title="View Event"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>

                      <Link
                        to={`/organizer/events/${event._id}/registrants`}
                        className="rounded-full p-2 text-indigo-500 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-50 hover:text-indigo-700"
                        title="View Registrants"
                      >
                        <Users className="h-4 w-4" />
                      </Link>

                      {event.status !== 'rejected' &&
                      new Date(event.date) > new Date() && (
                      <Link
                      to={`/organizer/edit-event/${event._id}`}
                       className="rounded-full p-2 text-blue-400 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-600"
                      title="Edit Event"
                     >
                      <Edit className="h-4 w-4" />
                       </Link>
                      )}

                      {(event.registrationCount || 0) === 0 && (
                        <button
                          onClick={() => handleDeleteEvent(event._id)}
                          className="rounded-full p-2 text-rose-400 transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-50 hover:text-rose-600"
                          title="Delete Event"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rejection reason */}
                {event.rejectionReason && (
                  <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3">
                    <p className="text-xs text-rose-700">
                      <span className="font-semibold">Rejection Reason:</span>{' '}
                      {event.rejectionReason}
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