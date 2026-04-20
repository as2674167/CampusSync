import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { eventsAPI, registrationsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
  ArrowLeft
} from 'lucide-react'

const EventDetailPage = () => {
  const { id } = useParams()
  const { user, isAuthenticated } = useAuth()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)

  useEffect(() => {
    fetchEvent()
  }, [id])

  const fetchEvent = async () => {
    try {
      const response = await eventsAPI.getEvent(id)
      setEvent(response.data.event)
    } catch (error) {
      console.error('Error fetching event:', error)
      toast.error('Event not found')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to register for events')
      return
    }

    try {
      setRegistering(true)
      await registrationsAPI.registerForEvent(id)
      toast.success('Successfully registered for event!')
      fetchEvent()
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
    } finally {
      setRegistering(false)
    }
  }

  // LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(129,140,248,0.16),_transparent_35%),linear-gradient(to_bottom,_#f5f7ff,_#edf2ff,_#f8fafc)]">
        <LoadingSpinner size="large" text="Loading event details..." />
      </div>
    )
  }

  // NOT FOUND STATE
  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(129,140,248,0.16),_transparent_35%),linear-gradient(to_bottom,_#f5f7ff,_#edf2ff,_#f8fafc)] px-4">
        <div className="rounded-[26px] border border-white/70 bg-white/95 p-10 text-center shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur">
          <h1 className="mb-4 text-2xl font-semibold text-slate-900">
            Event not found
          </h1>
          <Link
            to="/events"
            className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_45px_rgba(79,70,229,0.40)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_65px_rgba(79,70,229,0.50)]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Link>
        </div>
      </div>
    )
  }

  // NORMAL PAGE
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(129,140,248,0.16),_transparent_35%),linear-gradient(to_bottom,_#f5f7ff,_#edf2ff,_#f8fafc)] py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <nav className="mb-6">
          <Link
            to="/events"
            className="inline-flex items-center text-sm font-medium text-blue-600 transition-all duration-200 hover:text-slate-900 hover:-translate-x-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Link>
        </nav>

        {/* Main wrapper card */}
        <div className="overflow-hidden rounded-[30px] border border-white/70 bg-white/95 shadow-[0_28px_80px_rgba(15,23,42,0.20)] backdrop-blur">
          {/* Image */}
          <div className="relative">
            <img
              src={
                event.image ||
                'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=500&fit=crop'
              }
              alt={event.title}
              className="h-64 w-full object-cover md:h-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-slate-900/10 to-transparent" />
          </div>

          <div className="p-6 md:p-8 lg:p-9">
            {/* Header row */}
            <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                    {event.category}
                  </span>
                  <span className="text-sm text-slate-500">
                    by {event.organizerName}
                  </span>
                </div>

                <h1 className="text-[22px] md:text-[28px] font-semibold tracking-tight text-slate-900">
                  {event.title}
                </h1>
              </div>

              {isAuthenticated && user?.role === 'student' && (
                <button
                  onClick={handleRegister}
                  disabled={registering || event.userRegistration}
                  className={`inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold text-white transition-all duration-300 ${
                    event.userRegistration
                      ? 'cursor-not-allowed bg-slate-400 shadow-[0_10px_26px_rgba(100,116,139,0.35)]'
                      : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 shadow-[0_18px_45px_rgba(79,70,229,0.45)] hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_26px_70px_rgba(79,70,229,0.55)]'
                  }`}
                >
                  {registering
                    ? 'Registering...'
                    : event.userRegistration
                    ? 'Already Registered'
                    : 'Register Now'}
                </button>
              )}
            </div>

            {/* Content */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* LEFT: Description */}
              <div className="lg:col-span-2">
                <div className="rounded-[22px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100/60 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.12)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(59,130,246,0.22)]">
                  <h2 className="mb-3 text-lg font-semibold text-slate-900">
                    About This Event
                  </h2>
                  <p className="text-[14px] leading-7 text-slate-600">
                    {event.description}
                  </p>
                </div>
              </div>

              {/* RIGHT: Details column */}
              <div className="space-y-5">
                {/* Event Details big box */}
                <div className="rounded-[22px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100/50 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.12)] transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-[0_26px_65px_rgba(59,130,246,0.22)]">
                  <h3 className="mb-4 text-base font-semibold text-slate-900">
                    Event Details
                  </h3>

                  <div className="space-y-3">
                    {/* DATE */}
                    <div className="flex items-start gap-3 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100/90 p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(59,130,246,0.25)]">
                      <div className="mt-0.5 rounded-xl bg-white p-2 text-blue-600 shadow-sm">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Date
                        </p>
                        <p className="text-sm text-slate-800">
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* TIME */}
                    <div className="flex items-start gap-3 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-100/90 p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(129,140,248,0.25)]">
                      <div className="mt-0.5 rounded-xl bg-white p-2 text-violet-600 shadow-sm">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Time
                        </p>
                        <p className="text-sm text-slate-800">{event.time}</p>
                      </div>
                    </div>

                    {/* VENUE */}
                    <div className="flex items-start gap-3 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-100/90 p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(244,114,182,0.25)]">
                      <div className="mt-0.5 rounded-xl bg-white p-2 text-pink-600 shadow-sm">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Venue
                        </p>
                        <p className="text-sm text-slate-800">
                          {event.venue}
                        </p>
                      </div>
                    </div>

                    {/* CAPACITY */}
                    <div className="flex items-start gap-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-green-100/90 p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(34,197,94,0.25)]">
                      <div className="mt-0.5 rounded-xl bg-white p-2 text-emerald-600 shadow-sm">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Capacity
                        </p>
                        <p className="text-sm text-slate-800">
                          {event.capacity} people
                        </p>
                      </div>
                    </div>

                    {/* REGISTERED */}
                    <div className="flex items-start gap-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-100/90 p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(245,158,11,0.25)]">
                      <div className="mt-0.5 rounded-xl bg-white p-2 text-amber-500 shadow-sm">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Registered
                        </p>
                        <p className="text-sm text-slate-800">
                          {event.registrationCount || 0} people
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                {event.requirements && (
                  <div className="rounded-[22px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100/50 p-5 shadow-[0_14px_36px_rgba(15,23,42,0.10)] transition-all duration-300 hover:-translate-y-1.5 hover:border-violet-200 hover:shadow-[0_22px_60px_rgba(139,92,246,0.20)]">
                    <h3 className="mb-2 text-sm font-semibold text-slate-900">
                      Requirements
                    </h3>
                    <p className="text-sm leading-7 text-slate-600">
                      {event.requirements}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div className="rounded-[22px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100/50 p-5 shadow-[0_14px_36px_rgba(15,23,42,0.10)] transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-[0_22px_60px_rgba(59,130,246,0.20)]">
                    <h3 className="mb-3 flex items-center text-sm font-semibold text-slate-900">
                      <Tag className="mr-2 h-4 w-4 text-blue-600" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetailPage