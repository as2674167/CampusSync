import { useEffect, useMemo, useState } from 'react'
import { usersAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import {
  BarChart3,
  Users,
  Calendar,
  Clock3,
  Activity,
  RefreshCw,
  UserCheck,
  Shield,
  Trophy,
  ArrowUpRight
} from 'lucide-react'

const AdminReports = () => {
  const [overview, setOverview] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalRegistrations: 0,
    activeEvents: 0,
    pendingEvents: 0,
    studentsCount: 0,
    organizersCount: 0,
    recentRegistrations: 0,
  })
  const [popularEvents, setPopularEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchReports(true)
  }, [])

  const fetchReports = async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true)
      else setRefreshing(true)

      const response = await usersAPI.getSystemStats()
      setOverview(response.data?.overview || {})
      setPopularEvents(response.data?.popularEvents || [])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load reports')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const growthCards = useMemo(() => {
    const totalUsers = overview.totalUsers || 0
    const studentsCount = overview.studentsCount || 0
    const organizersCount = overview.organizersCount || 0

    const studentShare = totalUsers ? Math.round((studentsCount / totalUsers) * 100) : 0
    const organizerShare = totalUsers ? Math.round((organizersCount / totalUsers) * 100) : 0

    return {
      studentShare,
      organizerShare,
    }
  }, [overview])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.10),_transparent_24%),linear-gradient(to_bottom,_#f8fbff,_#eef4ff,_#f6f9ff)]">
        <LoadingSpinner size="large" text="Loading reports..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.10),_transparent_24%),linear-gradient(to_bottom,_#f8fbff,_#eef4ff,_#f6f9ff)] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 overflow-hidden rounded-[30px] border border-white/60 bg-white/80 backdrop-blur-sm shadow-[0_25px_80px_rgba(15,23,42,0.10)]">
          <div className="relative px-6 py-7 sm:px-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.12),_transparent_38%)]" />
            <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                  Admin Panel
                </span>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                  Reports & Insights
                </h1>
                <p className="mt-2 text-sm text-slate-600 md:text-base">
                  Track platform growth, event activity, and user distribution.
                </p>
              </div>

              <button
                onClick={() => fetchReports(false)}
                disabled={refreshing}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 hover:shadow-md disabled:opacity-60"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Reports
              </button>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[26px] border border-blue-100 bg-gradient-to-br from-white via-blue-50/70 to-blue-100/60 px-6 py-5 shadow-[0_18px_50px_rgba(37,99,235,0.10)]">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-md ring-1 ring-blue-100">
                <Users className="h-7 w-7" />
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight text-slate-900">
                  {overview.totalUsers || 0}
                </p>
                <p className="text-sm font-medium text-slate-600">Total Users</p>
              </div>
            </div>
          </div>

          <div className="rounded-[26px] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/70 to-emerald-100/60 px-6 py-5 shadow-[0_18px_50px_rgba(16,185,129,0.10)]">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-md ring-1 ring-emerald-100">
                <Calendar className="h-7 w-7" />
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight text-slate-900">
                  {overview.totalEvents || 0}
                </p>
                <p className="text-sm font-medium text-slate-600">Total Events</p>
              </div>
            </div>
          </div>

          <div className="rounded-[26px] border border-violet-100 bg-gradient-to-br from-white via-violet-50/70 to-purple-100/70 px-6 py-5 shadow-[0_18px_50px_rgba(139,92,246,0.10)]">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-md ring-1 ring-violet-100">
                <BarChart3 className="h-7 w-7" />
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight text-slate-900">
                  {overview.totalRegistrations || 0}
                </p>
                <p className="text-sm font-medium text-slate-600">Registrations</p>
              </div>
            </div>
          </div>

          <div className="rounded-[26px] border border-amber-100 bg-gradient-to-br from-white via-amber-50/70 to-yellow-100/70 px-6 py-5 shadow-[0_18px_50px_rgba(245,158,11,0.10)]">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-md ring-1 ring-amber-100">
                <Clock3 className="h-7 w-7" />
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight text-slate-900">
                  {overview.pendingEvents || 0}
                </p>
                <p className="text-sm font-medium text-slate-600">Pending Events</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-[30px] border border-white/60 bg-white/90 p-6 backdrop-blur-sm shadow-[0_25px_80px_rgba(15,23,42,0.12)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Students</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {overview.studentsCount || 0}
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <UserCheck className="h-7 w-7" />
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              {growthCards.studentShare}% of active users are students.
            </p>
          </div>

          <div className="rounded-[30px] border border-white/60 bg-white/90 p-6 backdrop-blur-sm shadow-[0_25px_80px_rgba(15,23,42,0.12)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Organizers</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {overview.organizersCount || 0}
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Shield className="h-7 w-7" />
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              {growthCards.organizerShare}% of active users are organizers.
            </p>
          </div>

          <div className="rounded-[30px] border border-white/60 bg-white/90 p-6 backdrop-blur-sm shadow-[0_25px_80px_rgba(15,23,42,0.12)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Recent Registrations</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {overview.recentRegistrations || 0}
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <Activity className="h-7 w-7" />
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              Registrations recorded in the last 7 days.
            </p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[30px] border border-white/60 bg-white/90 backdrop-blur-sm shadow-[0_25px_80px_rgba(15,23,42,0.12)]">
            <div className="border-b border-slate-200/70 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
              <h2 className="text-xl font-semibold text-slate-900">Platform Summary</h2>
              <p className="mt-1 text-sm text-slate-500">
                A quick snapshot of the system right now.
              </p>
            </div>

            <div className="space-y-4 p-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Active Events</span>
                  <span className="text-lg font-bold text-slate-900">
                    {overview.activeEvents || 0}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Pending Review</span>
                  <span className="text-lg font-bold text-slate-900">
                    {overview.pendingEvents || 0}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Registrations</span>
                  <span className="text-lg font-bold text-slate-900">
                    {overview.totalRegistrations || 0}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Total Users</span>
                  <span className="text-lg font-bold text-slate-900">
                    {overview.totalUsers || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[30px] border border-white/60 bg-white/90 backdrop-blur-sm shadow-[0_25px_80px_rgba(15,23,42,0.12)]">
            <div className="border-b border-slate-200/70 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
              <h2 className="text-xl font-semibold text-slate-900">Role Breakdown</h2>
              <p className="mt-1 text-sm text-slate-500">
                Distribution of users by account type.
              </p>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">Students</span>
                  <span className="font-semibold text-slate-900">{growthCards.studentShare}%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div
                    className="h-3 rounded-full bg-emerald-500"
                    style={{ width: `${growthCards.studentShare}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">Organizers</span>
                  <span className="font-semibold text-slate-900">{growthCards.organizerShare}%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div
                    className="h-3 rounded-full bg-blue-500"
                    style={{ width: `${growthCards.organizerShare}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">Others</span>
                  <span className="font-semibold text-slate-900">
                    {Math.max(0, 100 - growthCards.studentShare - growthCards.organizerShare)}%
                  </span>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div
                    className="h-3 rounded-full bg-violet-500"
                    style={{ width: `${Math.max(0, 100 - growthCards.studentShare - growthCards.organizerShare)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[30px] border border-white/60 bg-white/90 backdrop-blur-sm shadow-[0_25px_80px_rgba(15,23,42,0.12)]">
          <div className="border-b border-slate-200/70 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Top Events</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Events with the highest registration activity.
                </p>
              </div>
              <span className="inline-flex w-fit items-center rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm">
                {popularEvents.length} ranked
              </span>
            </div>
          </div>

          {popularEvents.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <Trophy className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-xl font-semibold text-slate-900">No event stats yet</h3>
              <p className="mt-2 text-sm text-slate-500">
                Popular event data will appear here once approved events have registrations.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Event
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Registrations
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Trend
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {popularEvents.map((event) => (
                    <tr key={event._id || event.title} className="hover:bg-slate-50/70">
                      <td className="px-6 py-5">
                        <p className="font-semibold text-slate-900">{event.title}</p>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-700">
                        {event.category || '—'}
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-700">
                        {event.date ? new Date(event.date).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {event.registrationCount || 0}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center text-sm font-semibold text-emerald-600">
                          <ArrowUpRight className="mr-1 h-4 w-4" />
                          High activity
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminReports