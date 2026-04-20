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
      const eventsResponse = await eventsAPI.getEvents({
        organizer: user._id,
        limit: 5
      })
      setRecentEvents(eventsResponse.data.events)

      // Calculate stats
      const events = eventsResponse.data.events
      const statsData = {
        total: events.length,
        approved: events.filter((e) => e.status === 'approved').length,
        pending: events.filter((e) => e.status === 'pending').length,
        totalRegistrations: events.reduce(
          (sum, e) => sum + (e.registrationCount || 0),
          0
        )
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
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(129,140,248,0.16),_transparent_35%),linear-gradient(to_bottom,_#f5f7ff,_#edf2ff,_#f8fafc)]">
        <LoadingSpinner size="large" text="Loading your dashboard..." />
      </div>
    )
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
        {/* Welcome Header */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome, {user.name}!
            </h1>
            <p className="mt-1 text-slate-600">
              Manage your events and track their performance
            </p>
          </div>

          <Link
            to="/organizer/create-event"
            className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(79,70,229,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(79,70,229,0.55)]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Event
          </Link>
        </div>

        {/* Stats Cards – stronger hover */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-8">
          {/* Total Events */}
          <div className="group relative overflow-hidden rounded-[26px] bg-gradient-to-br from-blue-50 via-white to-blue-100/80 p-[1px] shadow-[0_18px_48px_rgba(37,99,235,0.22)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_28px_70px_rgba(37,99,235,0.40)] hover:scale-[1.01]">
            <div className="flex items-center justify-between rounded-[24px] bg-white/90 px-5 py-4 backdrop-blur transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-white/95 group-hover:via-blue-50/90 group-hover:to-blue-100/70 group-hover:border-blue-200/70 group-hover:border">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-[0_12px_28px_rgba(37,99,235,0.45)] transition-transform duration-300 group-hover:scale-115">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                    Total Events
                  </p>
                  <p className="text-2xl font-semibold tracking-tight text-slate-900">
                    {stats.total || 0}
                  </p>
                </div>
              </div>
              <BarChart3 className="hidden h-5 w-5 text-blue-400/90 md:block" />
            </div>
          </div>

          {/* Approved */}
          <div className="group relative overflow-hidden rounded-[26px] bg-gradient-to-br from-emerald-50 via-white to-emerald-100/80 p-[1px] shadow-[0_18px_48px_rgba(16,185,129,0.22)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_28px_70px_rgba(16,185,129,0.40)] hover:scale-[1.01]">
            <div className="flex items-center justify-between rounded-[24px] bg-white/90 px-5 py-4 backdrop-blur transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-white/95 group-hover:via-emerald-50/90 group-hover:to-emerald-100/70 group-hover:border-emerald-200/70 group-hover:border">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-[0_12px_28px_rgba(16,185,129,0.45)] transition-transform duration-300 group-hover:scale-115">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                    Approved
                  </p>
                  <p className="text-2xl font-semibold tracking-tight text-emerald-600">
                    {stats.approved || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="group relative overflow-hidden rounded-[26px] bg-gradient-to-br from-amber-50 via-white to-yellow-100/80 p-[1px] shadow-[0_18px_48px_rgba(245,158,11,0.22)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_28px_70px_rgba(245,158,11,0.40)] hover:scale-[1.01]">
            <div className="flex items-center justify-between rounded-[24px] bg-white/90 px-5 py-4 backdrop-blur transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-white/95 group-hover:via-amber-50/90 group-hover:to-yellow-100/70 group-hover:border-amber-200/70 group-hover:border">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-[0_12px_28px_rgba(245,158,11,0.45)] transition-transform duration-300 group-hover:scale-115">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                    Pending
                  </p>
                  <p className="text-2xl font-semibold tracking-tight text-amber-600">
                    {stats.pending || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Total Registrations */}
          <div className="group relative overflow-hidden rounded-[26px] bg-gradient-to-br from-violet-50 via-white to-purple-100/80 p-[1px] shadow-[0_18px_48px_rgba(139,92,246,0.24)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_28px_70px_rgba(139,92,246,0.45)] hover:scale-[1.01]">
            <div className="flex items-center justify-between rounded-[24px] bg-white/90 px-5 py-4 backdrop-blur transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-white/95 group-hover:via-violet-50/90 group-hover:to-purple-100/70 group-hover:border-violet-200/70 group-hover:border">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 shadow-[0_12px_28px_rgba(139,92,246,0.45)] transition-transform duration-300 group-hover:scale-115">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                    Total Registrations
                  </p>
                  <p className="text-2xl font-semibold tracking-tight text-slate-900">
                    {stats.totalRegistrations || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main layout */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Recent Events */}
          <div className="lg:col-span-2 overflow-hidden rounded-[26px] border border-white/70 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.14)] backdrop-blur">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Your Events
              </h2>
              <Link
                to="/organizer/manage-events"
                className="group inline-flex items-center text-sm font-semibold text-blue-600 transition-colors duration-200 hover:text-slate-900"
              >
                View all
                <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="p-6">
              {recentEvents.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                    <Calendar className="h-7 w-7 text-slate-400" />
                  </div>
                  <p className="mb-4 text-sm text-slate-600">
                    You haven&apos;t created any events yet.
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
                <div className="space-y-4">
                  {recentEvents.map((event) => (
                    <div
                      key={event._id}
                      className="group rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_12px_32px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:bg-slate-50/90 hover:shadow-[0_22px_52px_rgba(59,130,246,0.22)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            {getStatusIcon(event.status)}
                            <h3 className="truncate text-lg font-semibold text-slate-900">
                              {event.title}
                            </h3>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${getStatusColor(
                                event.status
                              )}`}
                            >
                              {event.status}
                            </span>
                          </div>

                          <div className="mt-2 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                            <div>
                              <span className="font-medium text-slate-700">
                                Date:
                              </span>{' '}
                              {formatDate(event.date)}
                            </div>
                            <div>
                              <span className="font-medium text-slate-700">
                                Venue:
                              </span>{' '}
                              {event.venue}
                            </div>
                            <div>
                              <span className="font-medium text-slate-700">
                                Capacity:
                              </span>{' '}
                              {event.capacity}
                            </div>
                            <div>
                              <span className="font-medium text-slate-700">
                                Registered:
                              </span>{' '}
                              {event.registrationCount || 0}
                            </div>
                          </div>

                          <div className="mt-4">
                            <Link
                              to={`/organizer/events/${event._id}/registrants`}
                              className="group/link inline-flex items-center text-sm font-medium text-blue-600 transition-colors duration-200 hover:text-blue-700"
                            >
                              View registrants
                              <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-200 group-hover/link:translate-x-1" />
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

          {/* Right column – Quick actions & Tips (same as before) */}
          <div className="space-y-6">
            <div className="overflow-hidden rounded-[24px] border border-white/70 bg-white/95 p-6 shadow-[0_18px_52px_rgba(15,23,42,0.14)] backdrop-blur">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  to="/organizer/create-event"
                  className="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_36px_rgba(79,70,229,0.5)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_52px_rgba(79,70,229,0.6)]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Event
                </Link>
                <Link
                  to="/organizer/manage-events"
                  className="flex w-full items-center justify-center rounded-full border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-white hover:shadow-[0_8px_22px_rgba(15,23,42,0.12)]"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Events
                </Link>
                <Link
                  to="/events"
                  className="flex w-full items-center justify-center rounded-full border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-white hover:shadow-[0_8px_22px_rgba(15,23,42,0.12)]"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Browse All Events
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-[24px] border border-white/70 bg-white/95 p-6 shadow-[0_18px_52px_rgba(15,23,42,0.12)] backdrop-blur">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">
                Tips
              </h3>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-start">
                  <span className="mt-2 mr-3 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                  <p>
                    Submit events at least <span className="font-semibold">5 days</span> before
                    the date for smoother approval.
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="mt-2 mr-3 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500" />
                  <p>
                    Use clear titles and descriptions to{' '}
                    <span className="font-semibold">attract more participants</span>.
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="mt-2 mr-3 h-2 w-2 flex-shrink-0 rounded-full bg-violet-500" />
                  <p>
                    Monitor registrations and communicate with attendees{' '}
                    <span className="font-semibold">before the event</span> for better turnout.
                  </p>
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