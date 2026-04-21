import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { usersAPI, eventsAPI } from '../../services/api'
import {
  Users,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const AdminDashboard = () => {
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await usersAPI.getSystemStats()
      setStats(response.data.overview)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.10),_transparent_28%),linear-gradient(to_bottom,_#f8fbff,_#eef4ff,_#f6f9ff)]">
        <LoadingSpinner size="large" text="Loading admin dashboard..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.10),_transparent_22%),linear-gradient(to_bottom,_#f8fbff,_#eef4ff,_#f6f9ff)] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 overflow-hidden rounded-[30px] border border-white/60 bg-white/80 backdrop-blur-sm shadow-[0_25px_80px_rgba(15,23,42,0.10)]">
          <div className="relative px-6 py-7 sm:px-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.12),_transparent_38%)]" />
            <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                  Admin Panel
                </span>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                  Admin Dashboard
                </h1>
                <p className="mt-2 text-sm text-slate-600 md:text-base">
                  System overview and management
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                <div className="rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-center shadow-sm">
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                    Status
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    Active
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-center shadow-sm">
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                    Access
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    Admin
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          <div className="group relative overflow-hidden rounded-[26px] border border-blue-100 bg-gradient-to-br from-white via-blue-50/70 to-blue-100/60 px-6 py-5 shadow-[0_18px_50px_rgba(37,99,235,0.10)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:border-blue-300 hover:shadow-[0_30px_80px_rgba(37,99,235,0.28)]">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-indigo-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative flex items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-md ring-1 ring-blue-100 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white">
                <Users className="h-7 w-7" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold tracking-tight text-slate-900">
                  {stats.totalUsers || 0}
                </p>
                <p className="text-sm font-medium text-slate-600">Total Users</p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[26px] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/70 to-emerald-100/60 px-6 py-5 shadow-[0_18px_50px_rgba(16,185,129,0.10)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:border-emerald-300 hover:shadow-[0_30px_80px_rgba(16,185,129,0.28)]">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-green-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative flex items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-md ring-1 ring-emerald-100 transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white">
                <Calendar className="h-7 w-7" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold tracking-tight text-slate-900">
                  {stats.totalEvents || 0}
                </p>
                <p className="text-sm font-medium text-slate-600">Total Events</p>
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
                  {stats.pendingEvents || 0}
                </p>
                <p className="text-sm font-medium text-slate-600">
                  Pending Approvals
                </p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[26px] border border-violet-100 bg-gradient-to-br from-white via-violet-50/70 to-purple-100/70 px-6 py-5 shadow-[0_18px_50px_rgba(139,92,246,0.10)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:border-violet-300 hover:shadow-[0_30px_80px_rgba(139,92,246,0.28)]">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/10 to-fuchsia-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative flex items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-md ring-1 ring-violet-100 transition-all duration-300 group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white">
                <TrendingUp className="h-7 w-7" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold tracking-tight text-slate-900">
                  {stats.totalRegistrations || 0}
                </p>
                <p className="text-sm font-medium text-slate-600">
                  Total Registrations
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="rounded-[30px] border border-white/60 bg-white/90 backdrop-blur-sm shadow-[0_25px_80px_rgba(15,23,42,0.12)] overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200/70 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">
                  Quick Actions
                </h2>
                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  Control Center
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <button
                className="group w-full inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(79,70,229,0.35)] transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_30px_70px_rgba(79,70,229,0.45)]"
                onClick={() => navigate('/admin/events')}
              >
                <Clock className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-6" />
                Review Pending Events
              </button>

              <button
                className="group w-full inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 px-5 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.01] hover:border-blue-200 hover:text-blue-700 hover:shadow-[0_20px_45px_rgba(59,130,246,0.16)]"
                onClick={() => navigate('/admin/users')}
              >
                <Users className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                Manage Users
              </button>

              <button
                className="group w-full inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 px-5 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.01] hover:border-violet-200 hover:text-violet-700 hover:shadow-[0_20px_45px_rgba(139,92,246,0.16)]"
                onClick={() => navigate('/admin/reports')}
              >
                <TrendingUp className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                View Reports
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-[30px] border border-white/60 bg-white/90 backdrop-blur-sm shadow-[0_25px_80px_rgba(15,23,42,0.12)] overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200/70 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">
                  Recent Activity
                </h2>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Live Snapshot
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="group rounded-[22px] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-200 hover:shadow-[0_24px_55px_rgba(245,158,11,0.14)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 transition-all duration-300 group-hover:bg-amber-500 group-hover:text-white">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      5 new events submitted for approval
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Review pending organizer submissions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group rounded-[22px] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-[0_24px_55px_rgba(59,130,246,0.14)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      12 new user registrations today
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      User activity is growing across the platform.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group rounded-[22px] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-200 hover:shadow-[0_24px_55px_rgba(16,185,129,0.14)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 transition-all duration-300 group-hover:bg-emerald-600 group-hover:text-white">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      3 events completed successfully
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Recent completed events performed smoothly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom info cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-[26px] border border-white/60 bg-white/85 p-5 backdrop-blur-sm shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_70px_rgba(59,130,246,0.12)]">
            <p className="text-sm font-medium text-slate-500">User Base</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {stats.totalUsers || 0}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Total users currently on the platform.
            </p>
          </div>

          <div className="rounded-[26px] border border-white/60 bg-white/85 p-5 backdrop-blur-sm shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_70px_rgba(16,185,129,0.12)]">
            <p className="text-sm font-medium text-slate-500">Approvals</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {stats.pendingEvents || 0}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Pending events waiting for admin review.
            </p>
          </div>

          <div className="rounded-[26px] border border-white/60 bg-white/85 p-5 backdrop-blur-sm shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_70px_rgba(139,92,246,0.12)]">
            <p className="text-sm font-medium text-slate-500">Growth</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {stats.totalRegistrations || 0}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Overall registrations across all events.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard