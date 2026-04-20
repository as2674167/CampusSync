import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { eventsAPI, registrationsAPI } from '../../services/api'
import {
  Calendar,
  Users,
  Clock,
  MapPin,
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

      const eventsResponse = await eventsAPI.getEvents({
        limit: 6,
        fromDate: new Date().toISOString().split('T')[0]
      })

      setUpcomingEvents(eventsResponse?.data?.events || [])

      const registrationsResponse = await registrationsAPI.getRegistrations({
        limit: 5
      })

      setMyRegistrations(registrationsResponse?.data?.registrations || [])
      setStats(registrationsResponse?.data?.stats || {})
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setUpcomingEvents([])
      setMyRegistrations([])
      setStats({})
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef4ff]">
        <LoadingSpinner size="large" text="Loading your dashboard..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.10),_transparent_24%),linear-gradient(to_bottom,_#f8fbff,_#eef4ff,_#f6f9ff)] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="mt-2 text-slate-600">
            Here's what's happening in your campus events
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          <div className="group relative overflow-hidden rounded-[26px] border border-blue-100 bg-gradient-to-br from-white via-blue-50/70 to-blue-100/60 px-6 py-5 shadow-[0_18px_50px_rgba(37,99,235,0.10)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:border-blue-300 hover:shadow-[0_30px_80px_rgba(37,99,235,0.28)]">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-indigo-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative flex items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-md ring-1 ring-blue-100 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white">
                <Calendar className="h-7 w-7" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold tracking-tight text-slate-900">
                  {stats?.registered || 0}
                </p>
                <p className="text-sm font-medium text-slate-600">Registered</p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[26px] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/70 to-emerald-100/60 px-6 py-5 shadow-[0_18px_50px_rgba(16,185,129,0.10)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:border-emerald-300 hover:shadow-[0_30px_80px_rgba(16,185,129,0.28)]">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-green-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative flex items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-md ring-1 ring-emerald-100 transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white">
                <CheckCircle className="h-7 w-7" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold tracking-tight text-slate-900">
                  {stats?.attended || 0}
                </p>
                <p className="text-sm font-medium text-slate-600">Attended</p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[26px] border border-amber-100 bg-gradient-to-br from-white via-amber-50/70 to-yellow-100/70 px-6 py-5 shadow-[0_18px_50px_rgba(245,158,11,0.10)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:border-amber-300 hover:shadow-[0_30px_80px_rgba(245,158,11,0.26)]">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-yellow-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative flex items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-md ring-1 ring-amber-100 transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white">
                <Clock className="h-7 w-7" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold tracking-tight text-slate-900">
                  {stats?.waitlisted || 0}
                </p>
                <p className="text-sm font-medium text-slate-600">Waitlisted</p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[26px] border border-violet-100 bg-gradient-to-br from-white via-violet-50/70 to-purple-100/70 px-6 py-5 shadow-[0_18px_50px_rgba(139,92,246,0.10)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:border-violet-300 hover:shadow-[0_30px_80px_rgba(139,92,246,0.28)]">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/10 to-fuchsia-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative flex items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-md ring-1 ring-violet-100 transition-all duration-300 group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white">
                <Users className="h-7 w-7" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold tracking-tight text-slate-900">
                  {upcomingEvents?.length || 0}
                </p>
                <p className="text-sm font-medium text-slate-600">Available</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upcoming Events */}
          <div className="rounded-[30px] border border-white/60 bg-white/90 backdrop-blur-sm shadow-[0_25px_80px_rgba(15,23,42,0.12)] overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200/70 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">
                  Upcoming Events
                </h2>
                <Link
                  to="/events"
                  className="inline-flex items-center text-sm font-semibold text-blue-600 transition-all duration-200 hover:text-slate-900 hover:translate-x-1"
                >
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="p-6">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                  <p className="text-slate-600">No upcoming events</p>
                  <Link to="/events" className="btn btn-primary mt-4">
                    Browse Events
                  </Link>
                </div>
              ) : (
                <div className="space-y-5">
                  {upcomingEvents.map((event) => (
                    <Link
                      key={event?._id}
                      to={`/events/${event?._id}`}
                      className="group block rounded-[24px] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.01] hover:border-blue-200 hover:shadow-[0_28px_70px_rgba(59,130,246,0.18)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="truncate text-lg md:text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-700">
                            {event?.title || 'Untitled Event'}
                          </h3>
                          <div className="mt-3 flex items-center text-sm text-slate-600">
                            <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                            {event?.date ? formatDate(event.date) : 'Date unavailable'} at{' '}
                            {event?.time ? formatTime(event.time) : 'Time unavailable'}
                          </div>
                          <div className="mt-2 flex items-center text-sm text-slate-600">
                            <MapPin className="mr-2 h-4 w-4 text-pink-500" />
                            {event?.venue || 'Venue unavailable'}
                          </div>
                        </div>
                        <span className="ml-4 inline-flex items-center rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-300 group-hover:bg-blue-600 group-hover:shadow-[0_10px_25px_rgba(37,99,235,0.30)]">
                          {event?.category || 'General'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* My Registrations */}
          <div className="rounded-[30px] border border-white/60 bg-white/90 backdrop-blur-sm shadow-[0_25px_80px_rgba(15,23,42,0.12)] overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200/70 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">
                  My Registrations
                </h2>
                <Link
                  to="/student/registrations"
                  className="inline-flex items-center text-sm font-semibold text-blue-600 transition-all duration-200 hover:text-slate-900 hover:translate-x-1"
                >
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="p-6">
              {myRegistrations.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                  <p className="text-slate-600">No registrations yet</p>
                  <Link to="/events" className="btn btn-primary mt-4">
                    Register for Events
                  </Link>
                </div>
              ) : (
                <div className="space-y-5">
                  {myRegistrations.map((registration) => {
                    const event = registration?.event

                    if (!event) {
                      return (
                        <div
                          key={registration?._id}
                          className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-800">
                                Event unavailable
                              </p>
                              <p className="mt-1 text-slate-500">
                                This registration is linked to an event that may
                                have been deleted or is no longer available.
                              </p>
                            </div>
                            <span
                              className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-sm ${
                                registration?.status === 'registered'
                                  ? 'bg-emerald-500 text-white'
                                  : registration?.status === 'waitlisted'
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-slate-900 text-white'
                              }`}
                            >
                              {registration?.status || 'unknown'}
                            </span>
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div
                        key={registration?._id}
                        className="group rounded-[24px] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.01] hover:border-violet-200 hover:shadow-[0_28px_70px_rgba(139,92,246,0.18)]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/events/${event?._id}`}
                              className="text-lg font-bold tracking-tight text-slate-900 transition-colors duration-200 group-hover:text-violet-700"
                            >
                              {event?.title || 'Untitled Event'}
                            </Link>
                            <div className="mt-3 flex items-center text-sm text-slate-600">
                              <Calendar className="mr-2 h-4 w-4 text-violet-500" />
                              {event?.date ? formatDate(event.date) : 'Date unavailable'}
                            </div>
                          </div>
                          <span
                            className={`ml-4 inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-all duration-300 ${
                              registration?.status === 'registered'
                                ? 'bg-emerald-500 text-white group-hover:shadow-[0_10px_25px_rgba(16,185,129,0.28)]'
                                : registration?.status === 'waitlisted'
                                ? 'bg-amber-500 text-white group-hover:shadow-[0_10px_25px_rgba(245,158,11,0.28)]'
                                : 'bg-slate-900 text-white group-hover:shadow-[0_10px_25px_rgba(15,23,42,0.24)]'
                            }`}
                          >
                            {registration?.status || 'unknown'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-10">
          <div className="rounded-[30px] border border-white/60 bg-white/90 p-6 backdrop-blur-sm shadow-[0_25px_80px_rgba(15,23,42,0.12)]">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/events"
                className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(79,70,229,0.35)] transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-[0_30px_70px_rgba(79,70,229,0.45)]"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Browse Events
              </Link>

              <Link
                to="/student/registrations"
                className="inline-flex items-center rounded-full border border-slate-200 bg-gradient-to-r from-white to-slate-50 px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02] hover:border-blue-200 hover:text-blue-700 hover:shadow-[0_20px_45px_rgba(59,130,246,0.16)]"
              >
                <Users className="mr-2 h-4 w-4" />
                My Registrations
              </Link>

              <Link
                to="/profile"
                className="inline-flex items-center rounded-full border border-slate-200 bg-gradient-to-r from-white to-slate-50 px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02] hover:border-violet-200 hover:text-violet-700 hover:shadow-[0_20px_45px_rgba(139,92,246,0.16)]"
              >
                <Users className="mr-2 h-4 w-4" />
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