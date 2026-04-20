import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { eventsAPI, registrationsAPI, downloadFile } from '../../services/api'
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
  registered: 'bg-green-100 text-green-700',
  waitlisted: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
  attended: 'bg-blue-100 text-blue-700',
  'no-show': 'bg-gray-100 text-gray-700',
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
        eventsAPI.getEventRegistrations(id),
      ])

      setEvent(eventRes.data.event)
      setRegistrations(registrationRes.data.registrations || [])
      setStats(registrationRes.data.stats || {})
    } catch (error) {
      console.error('Error fetching registrants:', error)
      toast.error(error.response?.data?.message || 'Failed to load registrants')
    } finally {
      setLoading(false)
    }
  }

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      const user = reg.user || {}
      const matchesSearch =
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchTerm.toLowerCase())

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
        ),
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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading registrants..." />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Event not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/organizer/manage-events"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Manage Events
          </Link>
        </div>

        <div className="card p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
              <p className="text-gray-600 mt-2 max-w-3xl">{event.description}</p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                  {formatDate(event.date)} at {formatTime(event.time)}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                  {event.venue}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2 text-blue-500" />
                  {stats.total || 0} total responses
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Capacity:</span> {event.capacity}
                </div>
              </div>
            </div>

            <button
              onClick={handleExport}
              disabled={exporting}
              className="btn btn-primary inline-flex items-center justify-center"
            >
              <Download className="h-4 w-4 mr-2" />
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-5">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
                <p className="text-gray-600 text-sm">Total</p>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.registered || 0}</p>
                <p className="text-gray-600 text-sm">Registered</p>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.waitlisted || 0}</p>
                <p className="text-gray-600 text-sm">Waitlisted</p>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.attended || 0}</p>
                <p className="text-gray-600 text-sm">Attended</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-6 p-4">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email, student ID, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="registered">Registered</option>
              <option value="waitlisted">Waitlisted</option>
              <option value="cancelled">Cancelled</option>
              <option value="attended">Attended</option>
              <option value="no-show">No-show</option>
            </select>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Participants</h2>
            <p className="text-sm text-gray-500">
              Showing {filteredRegistrations.length} of {registrations.length}
            </p>
          </div>

          {filteredRegistrations.length === 0 ? (
            <div className="p-10 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No participants found</h3>
              <p className="text-gray-600 mt-1">
                Try changing the search text or status filter.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-sm text-gray-600">
                      <th className="px-6 py-4 font-semibold">Participant</th>
                      <th className="px-6 py-4 font-semibold">Academic Info</th>
                      <th className="px-6 py-4 font-semibold">Contact</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Registered On</th>
                      <th className="px-6 py-4 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredRegistrations.map((reg) => (
                      <tr key={reg._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">{reg.user?.name || 'N/A'}</p>
                            <p className="text-sm text-gray-500">{reg.user?.email || 'N/A'}</p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-800">
                            <span className="font-medium">Student ID:</span> {reg.user?.studentId || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">{reg.user?.department || 'N/A'}</p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-800">{reg.user?.phone || 'N/A'}</p>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusPill[reg.status] || 'bg-gray-100 text-gray-700'}`}>
                            {reg.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(reg.registrationDate).toLocaleString()}
                        </td>

                        <td className="px-6 py-4">
                          {reg.status === 'registered' ? (
                            <button
                              onClick={() => handleCheckIn(reg._id)}
                              disabled={checkInLoading === reg._id}
                              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-60"
                            >
                              {checkInLoading === reg._id ? 'Checking in...' : 'Check in'}
                            </button>
                          ) : reg.status === 'attended' ? (
                            <span className="text-sm font-medium text-green-600">Checked in</span>
                          ) : (
                            <span className="text-sm text-gray-500">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="lg:hidden divide-y divide-gray-100">
                {filteredRegistrations.map((reg) => (
                  <div key={reg._id} className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{reg.user?.name || 'N/A'}</h3>
                        <p className="text-sm text-gray-500 mt-1">{reg.user?.email || 'N/A'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusPill[reg.status] || 'bg-gray-100 text-gray-700'}`}>
                        {reg.status}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center text-gray-700">
                        <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
                        {reg.user?.studentId || 'N/A'}
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Users className="h-4 w-4 mr-2 text-gray-400" />
                        {reg.user?.department || 'N/A'}
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {reg.user?.email || 'N/A'}
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {reg.user?.phone || 'N/A'}
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-4">
                      Registered on {new Date(reg.registrationDate).toLocaleString()}
                    </p>

                    <div className="mt-4">
                      {reg.status === 'registered' ? (
                        <button
                          onClick={() => handleCheckIn(reg._id)}
                          disabled={checkInLoading === reg._id}
                          className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-60"
                        >
                          {checkInLoading === reg._id ? 'Checking in...' : 'Check in participant'}
                        </button>
                      ) : reg.status === 'attended' ? (
                        <div className="text-sm font-medium text-green-600">Already checked in</div>
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