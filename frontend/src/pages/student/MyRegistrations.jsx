import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { registrationsAPI } from '../../services/api'
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  X,
  CheckCircle,
  Clock3,
  AlertTriangle
} from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatDate, formatTime } from '../../utils/helpers'
import toast from 'react-hot-toast'

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [stats, setStats] = useState({})

  const filters = [
    { value: 'all', label: 'All' },
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
      setRegistrations(response?.data?.registrations || [])
      setStats(response?.data?.stats || {})
    } catch (error) {
      console.error('Error fetching registrations:', error)
      setRegistrations([])
      setStats({})
    } finally {
      setLoading(false)
    }
  }

  const handleCancelRegistration = async (registrationId) => {
    if (window.confirm('Are you sure you want to cancel this registration?')) {
      try {
        await registrationsAPI.updateRegistration(registrationId, {
          status: 'cancelled'
        })
        toast.success('Registration cancelled successfully')
        fetchRegistrations()
      } catch (error) {
        const message =
          error.response?.data?.message || 'Failed to cancel registration'
        toast.error(message)
      }
    }
  }

  const getStatusChipClass = (status) => {
    switch (status) {
      case 'registered':
        return 'bg-slate-900 text-white'
      case 'waitlisted':
        return 'bg-amber-500 text-white'
      case 'attended':
        return 'bg-emerald-500 text-white'
      case 'cancelled':
        return 'bg-rose-500 text-white'
      default:
        return 'bg-slate-500 text-white'
    }
  }

  const getStatusFilterColor = (value) => {
    switch (value) {
      case 'registered':
        return 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
      case 'waitlisted':
        return 'bg-amber-50 text-amber-700 hover:bg-amber-100'
      case 'attended':
        return 'bg-blue-50 text-blue-700 hover:bg-blue-100'
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 hover:bg-rose-100'
      default:
        return 'bg-slate-50 text-slate-700 hover:bg-slate-100'
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(129,140,248,0.16),_transparent_35%),linear-gradient(to_bottom,_#f5f7ff,_#edf2ff,_#f8fafc)] py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            My Registrations
          </h1>
          <p className="mt-2 text-slate-600">
            Here’s everything you’ve signed up for on campus
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-8">
          <div className="group relative overflow-hidden rounded-[26px] bg-gradient-to-br from-blue-50 via-white to-blue-100/70 p-[1px] shadow-[0_12px_40px_rgba(37,99,235,0.25)] transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_70px_rgba(37,99,235,0.40)]">
            <div className="flex items-center justify-between rounded-[24px] bg-white/90 px-5 py-4 backdrop-blur transition-colors duration-300 group-hover:bg-blue-50/80">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-[0_10px_22px_rgba(37,99,235,0.40)] transition-transform duration-300 group-hover:scale-110">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    Confirmed
                  </p>
                  <p className="text-2xl font-semibold tracking-tight text-slate-900">
                    {stats?.registered || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[26px] bg-gradient-to-br from-emerald-50 via-white to-emerald-100/70 p-[1px] shadow-[0_12px_40px_rgba(16,185,129,0.25)] transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_70px_rgba(16,185,129,0.40)]">
            <div className="flex items-center justify-between rounded-[24px] bg-white/90 px-5 py-4 backdrop-blur transition-colors duration-300 group-hover:bg-emerald-50/80">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-[0_10px_22px_rgba(16,185,129,0.40)] transition-transform duration-300 group-hover:scale-110">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    Attended
                  </p>
                  <p className="text-2xl font-semibold tracking-tight text-emerald-600">
                    {stats?.attended || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[26px] bg-gradient-to-br from-amber-50 via-white to-yellow-100/70 p-[1px] shadow-[0_12px_40px_rgba(245,158,11,0.25)] transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_70px_rgba(245,158,11,0.40)]">
            <div className="flex items-center justify-between rounded-[24px] bg-white/90 px-5 py-4 backdrop-blur transition-colors duration-300 group-hover:bg-amber-50/80">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 shadow-[0_10px_22px_rgba(245,158,11,0.40)] transition-transform duration-300 group-hover:scale-110">
                  <Clock3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    Waitlisted
                  </p>
                  <p className="text-2xl font-semibold tracking-tight text-amber-600">
                    {stats?.waitlisted || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[26px] bg-gradient-to-br from-rose-50 via-white to-rose-100/70 p-[1px] shadow-[0_12px_40px_rgba(239,68,68,0.25)] transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_70px_rgba(239,68,68,0.40)]">
            <div className="flex items-center justify-between rounded-[24px] bg-white/90 px-5 py-4 backdrop-blur transition-colors duration-300 group-hover:bg-rose-50/80">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 shadow-[0_10px_22px_rgba(239,68,68,0.40)] transition-transform duration-300 group-hover:scale-110">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    Cancelled
                  </p>
                  <p className="text-2xl font-semibold tracking-tight text-rose-500">
                    {stats?.cancelled || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => {
              const active = filter === f.value
              return (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`rounded-full px-4 py-1.5 text-xs md:text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-slate-900 text-white shadow-[0_10px_30px_rgba(15,23,42,0.55)] scale-[1.03]'
                      : `${getStatusFilterColor(
                          f.value
                        )} border border-transparent hover:border-slate-300 hover:shadow-[0_8px_22px_rgba(15,23,42,0.18)] hover:scale-[1.02]`
                  }`}
                >
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Registrations list */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="large" text="Loading registrations..." />
          </div>
        ) : registrations.length === 0 ? (
          <div className="rounded-3xl border border-white/70 bg-white/95 py-12 px-6 text-center shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
            <Users className="mx-auto mb-4 h-12 w-12 text-slate-400" />
            <h3 className="mb-2 text-lg font-semibold text-slate-900">
              No registrations found
            </h3>
            <p className="mb-6 text-sm text-slate-600">
              {filter === 'all'
                ? "You haven't registered for any events yet."
                : `No ${filter} registrations found.`}
            </p>
            <Link
              to="/events"
              className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(79,70,229,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(79,70,229,0.55)]"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map((registration) => {
              const event = registration?.event

              if (!event) {
                return (
                  <div
                    key={registration?._id}
                    className="group rounded-[26px] border border-dashed border-slate-300 bg-white/95 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="mb-3 flex flex-wrap items-center gap-3">
                          <div className="truncate text-lg md:text-xl font-semibold text-slate-700">
                            Event unavailable
                          </div>
                          <span
                            className={`inline-flex items-center rounded-full px-4 py-1 text-[11px] font-semibold uppercase tracking-wide ${getStatusChipClass(
                              registration?.status
                            )}`}
                          >
                            {registration?.status || 'unknown'}
                          </span>
                        </div>

                        <p className="text-sm text-slate-600">
                          This registration is linked to an event that may have been deleted or is no longer available.
                        </p>

                        <div className="mt-3 text-sm text-slate-600">
                          <span className="font-medium text-slate-700">
                            Registered:
                          </span>
                          <span className="ml-1">
                            {registration?.registrationDate
                              ? formatDate(registration.registrationDate)
                              : 'Unavailable'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <div
                  key={registration?._id}
                  className="group rounded-[26px] border border-white/70 bg-white/95 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.12)] transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-[0_26px_70px_rgba(59,130,246,0.25)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        <Link
                          to={`/events/${event?._id}`}
                          className="truncate text-lg md:text-xl font-semibold text-slate-900 transition-colors duration-200 group-hover:text-blue-700"
                        >
                          {event?.title || 'Untitled Event'}
                        </Link>
                        <span
                          className={`inline-flex items-center rounded-full px-4 py-1 text-[11px] font-semibold uppercase tracking-wide ${getStatusChipClass(
                            registration?.status
                          )} transition-all duration-200 hover:shadow-[0_10px_26px_rgba(15,23,42,0.45)] hover:-translate-y-0.5`}
                        >
                          {registration?.status}
                        </span>
                      </div>

                      <div className="mt-2 grid gap-4 md:grid-cols-2">
                        <div className="space-y-2 text-sm text-slate-600">
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                            <span>
                              {event?.date ? formatDate(event.date) : 'Date unavailable'} at{' '}
                              {event?.time ? formatTime(event.time) : 'Time unavailable'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4 text-pink-500" />
                            <span>{event?.venue || 'Venue unavailable'}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4 text-violet-500" />
                            <span>{event?.category || 'General'}</span>
                          </div>
                        </div>

                        <div className="space-y-1 text-sm text-slate-600">
                          <div>
                            <span className="font-medium text-slate-700">
                              Registered:
                            </span>
                            <span className="ml-1">
                              {registration?.registrationDate
                                ? formatDate(registration.registrationDate)
                                : 'Unavailable'}
                            </span>
                          </div>

                          {registration?.checkInTime && (
                            <div>
                              <span className="font-medium text-slate-700">
                                Checked In:
                              </span>
                              <span className="ml-1">
                                {formatDate(registration.checkInTime)}
                              </span>
                            </div>
                          )}

                          <div>
                            <span className="font-medium text-slate-700">
                              Organizer:
                            </span>
                            <span className="ml-1">
                              {event?.organizer?.name || 'Unavailable'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {event?.description && (
                        <p className="mt-3 text-sm text-slate-600 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>

                    <div className="ml-2 flex-shrink-0">
                      {registration?.status === 'registered' &&
                        event?.date &&
                        new Date(event.date) > new Date() && (
                          <button
                            onClick={() =>
                              handleCancelRegistration(registration._id)
                            }
                            className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 transition-all duration-200 hover:bg-rose-100 hover:border-rose-300 hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(239,68,68,0.35)]"
                          >
                            <X className="mr-1 h-4 w-4" />
                            Cancel
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyRegistrations