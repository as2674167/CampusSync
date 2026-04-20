import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { eventsAPI, registrationsAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatDate, formatTime } from '../../utils/helpers'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Users,
  Search,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  UserCheck,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  MapPin
} from 'lucide-react'

const statusPill = {
  registered: 'bg-emerald-50 text-emerald-700',
  waitlisted: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-rose-50 text-rose-700',
  attended: 'bg-blue-50 text-blue-700',
  'no-show': 'bg-slate-100 text-slate-700'
}

const EventRegistrantsPage = () => {
  const { id } = useParams()

  const [event, setEvent] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [checkInLoading, setCheckInLoading] = useState(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      setLoading(true)

      const [eventRes, registrationRes] = await Promise.all([
        eventsAPI.getEvent(id),
        eventsAPI.getEventRegistrations(id)
      ])

      setEvent(eventRes.data.event)
      setRegistrations(registrationRes.data.registrations || [])
      setStats(registrationRes.data.stats || {})
    } catch (error) {
      console.error('Error fetching registrants:', error)
      toast.error(
        error.response?.data?.message || 'Failed to load registrants'
      )
    } finally {
      setLoading(false)
    }
  }

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      const user = reg.user || {}
      const term = searchTerm.toLowerCase()

      const matchesSearch =
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.studentId?.toLowerCase().includes(term) ||
        user.department?.toLowerCase().includes(term)

      const matchesStatus =
        statusFilter === 'all' ? true : reg.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [registrations, searchTerm, statusFilter])

  const handleCheckIn = async (registrationId) => {
    try {
      setCheckInLoading(registrationId)
      await registrationsAPI.checkInUser(registrationId)
      toast.success('Participant checked in successfully')
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-in failed')
    } finally {
      setCheckInLoading(null)
    }
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const response = await registrationsAPI.exportRegistrations(id)

      const csvRows = response.data.registrations || []
      if (!csvRows.length) {
        toast.error('No registrations available to export')
        return
      }

      const headers = Object.keys(csvRows[0])
      const csvContent = [
        headers.join(','),
        ...csvRows.map((row) =>
          headers
            .map((header) => {
              const value = row[header] ?? ''
              const safeValue = String(value).replace(/"/g, '""')
              return `"${safeValue}"`
            })
            .join(',')
        )
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${event?.title || 'event'}-registrations.csv`
      link.click()
      window.URL.revokeObjectURL(url)

      toast.success('Registrations exported successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(129,140,248,0.16),_transparent_35%),linear-gradient(to_bottom,_#f5f7ff,_#edf2ff,_#f8fafc)]">
        <LoadingSpinner size="large" text="Loading registrants..." />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Event not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(129,140,248,0.16),_transparent_35%),linear-gradient(to_bottom,_#f5f7ff,_#edf2ff,_#f8fafc)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <div className="mb-6">
          <Link
            to="/organizer/manage-events"
            className="inline-flex items-center text-sm font-semibold text-blue-600 transition-colors duration-200 hover:text-slate-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Manage Events
          </Link>
        </div>

        {/* Event header card */}
        <div className="mb-8 overflow-hidden rounded-[26px] border border-white/80 bg-white/95 p-6 shadow-[0_22px_70px_rgba(15,23,42,0.14)] backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                {event.title}
              </h1>
              {event.description && (
                <p className="mt-2 max-w-3xl text-sm md:text-base text-slate-600">
                  {event.description}
                </p>
              )}

              <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
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
                  <span>{stats.total || 0} total responses</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-1 font-medium text-slate-700">
                    Capacity:
                  </span>
                  <span>{event.capacity}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(79,70,229,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(79,70,229,0.55)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Download className="mr-2 h-4 w-4" />
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>

        {/* Stat tiles */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Total */}
          <div className="group relative overflow-hidden rounded-[20px] border border-slate-100 bg-white/95 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-[0_24px_70px_rgba(59,130,246,0.20)]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-[0_8px_20px_rgba(59,130,246,0.30)] transition-transform duration-300 group-hover:scale-110">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                  Total
                </p>
                <p className="text-2xl font-semibold tracking-tight text-slate-900">
                  {stats.total || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Registered */}
          <div className="group relative overflow-hidden rounded-[20px] border border-slate-100 bg-white/95 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-200 hover:shadow-[0_24px_70px_rgba(16,185,129,0.20)]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-[0_8px_20px_rgba(16,185,129,0.30)] transition-transform duration-300 group-hover:scale-110">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                  Registered
                </p>
                <p className="text-2xl font-semibold tracking-tight text-slate-900">
                  {stats.registered || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Waitlisted */}
          <div className="group relative overflow-hidden rounded-[20px] border border-slate-100 bg-white/95 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-200 hover:shadow-[0_24px_70px_rgba(245,158,11,0.20)]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-[0_8px_20px_rgba(245,158,11,0.30)] transition-transform duration-300 group-hover:scale-110">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                  Waitlisted
                </p>
                <p className="text-2xl font-semibold tracking-tight text-slate-900">
                  {stats.waitlisted || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Attended */}
          <div className="group relative overflow-hidden rounded-[20px] border border-slate-100 bg-white/95 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-violet-200 hover:shadow-[0_24px_70px_rgba(129,140,248,0.22)]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 shadow-[0_8px_20px_rgba(129,140,248,0.30)] transition-transform duration-300 group-hover:scale-110">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                  Attended
                </p>
                <p className="text-2xl font-semibold tracking-tight text-slate-900">
                  {stats.attended || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

               {/* Search + filter bar */}
        <div className="mb-6 overflow-hidden rounded-[20px] border border-slate-100 bg-white/95 p-4 shadow-[0_18px_55px_rgba(15,23,42,0.10)] backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Search pill */}
            <div className="relative w-full md:max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name, email, student ID, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-full border border-slate-800/70 bg-slate-900/95 pl-11 pr-4 py-2.5 text-sm text-slate-50 shadow-[0_14px_40px_rgba(15,23,42,0.70)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-slate-900"
              />
            </div>

            {/* Status dropdown pill */}
            <div className="w-full md:w-auto">
              <div className="relative inline-flex w-full md:w-auto items-center">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full md:w-auto appearance-none rounded-full border border-slate-900/80 bg-slate-900/95 px-4 pr-9 py-2.5 text-sm font-medium text-slate-50 shadow-[0_14px_40px_rgba(15,23,42,0.70)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-slate-50"
                >
                  <option value="all">All Statuses</option>
                  <option value="registered">Registered</option>
                  <option value="waitlisted">Waitlisted</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="attended">Attended</option>
                  <option value="no-show">No-show</option>
                </select>

                {/* custom arrow so select still rounded */}
                <span className="pointer-events-none absolute right-4 inline-flex h-4 w-4 items-center justify-center text-slate-300">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 8L10 12L14 8"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Participants table/card */}
        <div className="overflow-hidden rounded-[26px] border border-slate-100 bg-white/95 shadow-[0_22px_70px_rgba(15,23,42,0.14)] backdrop-blur">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="text-lg md:text-xl font-semibold tracking-tight text-slate-900">
              Participants
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              Showing {filteredRegistrations.length} of {registrations.length}
            </p>
          </div>

          {filteredRegistrations.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <Users className="h-7 w-7 text-slate-400" />
              </div>
              <h3 className="text-base md:text-lg font-medium text-slate-900">
                No participants found
              </h3>
              <p className="mt-1 text-xs md:text-sm text-slate-600">
                Try changing the search text or status filter.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50/80">
                    <tr className="text-left text-slate-600">
                      <th className="px-6 py-3 font-semibold">Participant</th>
                      <th className="px-6 py-3 font-semibold">Academic Info</th>
                      <th className="px-6 py-3 font-semibold">Contact</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                      <th className="px-6 py-3 font-semibold">
                        Registered On
                      </th>
                      <th className="px-6 py-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRegistrations.map((reg) => (
                      <tr
                        key={reg._id}
                        className="transition-colors duration-200 hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {reg.user?.name || 'N/A'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {reg.user?.email || 'N/A'}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-xs text-slate-800">
                            <span className="font-medium">Student ID:</span>{' '}
                            {reg.user?.studentId || 'N/A'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {reg.user?.department || 'N/A'}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-xs text-slate-800">
                            {reg.user?.phone || 'N/A'}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold capitalize ${
                              statusPill[reg.status] ||
                              'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {reg.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-600">
                          {new Date(reg.registrationDate).toLocaleString()}
                        </td>

                        <td className="px-6 py-4">
                          {reg.status === 'registered' ? (
                            <button
                              onClick={() => handleCheckIn(reg._id)}
                              disabled={checkInLoading === reg._id}
                              className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {checkInLoading === reg._id
                                ? 'Checking in...'
                                : 'Check in'}
                            </button>
                          ) : reg.status === 'attended' ? (
                            <span className="text-xs font-semibold text-emerald-600">
                              Checked in
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="lg:hidden divide-y divide-slate-100">
                {filteredRegistrations.map((reg) => (
                  <div key={reg._id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          {reg.user?.name || 'N/A'}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {reg.user?.email || 'N/A'}
                        </p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold capitalize ${
                          statusPill[reg.status] ||
                          'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {reg.status}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-slate-700 sm:grid-cols-2">
                      <div className="flex items-center">
                        <GraduationCap className="mr-2 h-4 w-4 text-slate-400" />
                        {reg.user?.studentId || 'N/A'}
                      </div>
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4 text-slate-400" />
                        {reg.user?.department || 'N/A'}
                      </div>
                      <div className="flex items-center">
                        <Mail className="mr-2 h-4 w-4 text-slate-400" />
                        {reg.user?.email || 'N/A'}
                      </div>
                      <div className="flex items-center">
                        <Phone className="mr-2 h-4 w-4 text-slate-400" />
                        {reg.user?.phone || 'N/A'}
                      </div>
                    </div>

                    <p className="mt-3 text-[11px] text-slate-500">
                      Registered on{' '}
                      {new Date(reg.registrationDate).toLocaleString()}
                    </p>

                    <div className="mt-4">
                      {reg.status === 'registered' ? (
                        <button
                          onClick={() => handleCheckIn(reg._id)}
                          disabled={checkInLoading === reg._id}
                          className="w-full rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {checkInLoading === reg._id
                            ? 'Checking in...'
                            : 'Check in participant'}
                        </button>
                      ) : reg.status === 'attended' ? (
                        <div className="text-xs font-semibold text-emerald-600">
                          Already checked in
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventRegistrantsPage