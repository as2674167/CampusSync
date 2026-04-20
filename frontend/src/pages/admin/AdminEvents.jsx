import { useEffect, useState } from 'react'
import { eventsAPI } from '../../services/api'
import toast from 'react-hot-toast'

const TABS = ['pending', 'approved', 'rejected']

const statusColors = {
  pending: 'bg-amber-100 text-amber-800 border border-amber-200/70',
  approved: 'bg-emerald-100 text-emerald-800 border border-emerald-200/70',
  rejected: 'bg-red-100 text-red-800 border border-red-200/70',
}

const AdminEvents = () => {
  const [activeTab, setActiveTab] = useState('pending')
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const fetchEvents = async (status) => {
    try {
      setLoading(true)
      const { data } = await eventsAPI.getEvents({ status, limit: 100 })
      setEvents(data.events || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents(activeTab)
  }, [activeTab])

  const handleApprove = async (id) => {
    try {
      await eventsAPI.updateEventStatus(id, 'approved')
      toast.success('Event approved ✅')
      fetchEvents(activeTab)
    } catch (err) {
      toast.error('Failed to approve event')
    }
  }

  const openRejectModal = (event) => {
    setRejectModal(event)
    setRejectReason('')
  }

  const confirmReject = async () => {
    try {
      await eventsAPI.updateEventStatus(rejectModal._id, 'rejected', rejectReason)
      toast.success('Event rejected')
      setRejectModal(null)
      fetchEvents(activeTab)
    } catch (err) {
      toast.error('Failed to reject event')
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.10),_transparent_24%),linear-gradient(to_bottom,_#f8fbff,_#eef4ff,_#f6f9ff)] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 overflow-hidden rounded-[30px] border border-white/60 bg-white/80 backdrop-blur-sm shadow-[0_25px_80px_rgba(15,23,42,0.10)]">
          <div className="relative px-6 py-7 sm:px-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.12),_transparent_38%)]" />
            <div className="relative">
              <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                Admin Panel
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Event Management
              </h1>
              <p className="mt-2 text-sm text-slate-600 md:text-base">
                Review and manage events submitted by organizers
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-3">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold capitalize transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-[0_18px_45px_rgba(79,70,229,0.32)]'
                  : 'border border-white/70 bg-white/80 text-slate-600 shadow-sm hover:-translate-y-0.5 hover:border-blue-200 hover:text-slate-900 hover:shadow-[0_14px_35px_rgba(59,130,246,0.14)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table Card */}
        <div className="overflow-hidden rounded-[30px] border border-white/60 bg-white/90 backdrop-blur-sm shadow-[0_25px_80px_rgba(15,23,42,0.12)]">
          <div className="border-b border-slate-200/70 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 capitalize">
                  {activeTab} Events
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Manage all {activeTab} event submissions from organizers
                </p>
              </div>

              <span className="inline-flex w-fit items-center rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm">
                {events.length} records
              </span>
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 animate-pulse" />
              <p className="text-slate-500">Loading {activeTab} events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                <span className="text-2xl">📭</span>
              </div>
              <p className="text-lg font-semibold text-slate-700">
                No {activeTab} events found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                There are no records to show in this tab right now.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50/80">
                  <tr className="border-b border-slate-200/70">
                    {[
                      'Title',
                      'Organizer',
                      'Date',
                      'Category',
                      'Status',
                      ...(activeTab === 'rejected' ? ['Reason'] : []),
                      ...(activeTab === 'pending' ? ['Actions'] : []),
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {events.map((event) => (
                    <tr
                      key={event._id}
                      className="group transition-all duration-300 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50/40"
                    >
                      <td className="px-5 py-4 align-top">
                        <div className="max-w-xs">
                          <div className="font-semibold tracking-tight text-slate-900 transition-colors duration-200 group-hover:text-blue-700">
                            {event.title}
                          </div>
                          <div className="mt-1 truncate text-xs text-slate-400">
                            {event.venue}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 align-top text-sm text-slate-700">
                        <div className="font-medium text-slate-800">
                          {event.organizer?.name || event.organizerName}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          {event.organizer?.email}
                        </div>
                      </td>

                      <td className="px-5 py-4 align-top text-sm text-slate-700">
                        {new Date(event.date).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4 align-top text-sm text-slate-700">
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {event.category}
                        </span>
                      </td>

                      <td className="px-5 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${statusColors[event.status]}`}
                        >
                          {event.status}
                        </span>
                      </td>

                      {activeTab === 'rejected' && (
                        <td className="px-5 py-4 align-top text-sm text-red-600 max-w-xs">
                          {event.rejectionReason || (
                            <span className="italic text-slate-400">
                              No reason given
                            </span>
                          )}
                        </td>
                      )}

                      <td className="px-5 py-4 align-top text-right">
                        {event.status === 'pending' ? (
                          <div className="flex flex-wrap justify-end gap-2">
                            <button
                              onClick={() => handleApprove(event._id)}
                              className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(16,185,129,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-[0_16px_34px_rgba(16,185,129,0.28)]"
                            >
                              Approve
                            </button>

                            <button
                              onClick={() => openRejectModal(event)}
                              className="rounded-xl bg-red-600 px-3.5 py-2 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(239,68,68,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-[0_16px_34px_rgba(239,68,68,0.28)]"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">No actions</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-white/60 bg-white/90 shadow-[0_30px_90px_rgba(15,23,42,0.22)] backdrop-blur-sm">
            <div className="border-b border-slate-200/70 bg-gradient-to-r from-red-50 to-white px-6 py-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Reject Event
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Rejecting:{' '}
                <span className="font-medium text-slate-800">
                  {rejectModal.title}
                </span>
              </p>
            </div>

            <div className="p-6">
              <textarea
                className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-red-300 focus:ring-4 focus:ring-red-100"
                rows={4}
                placeholder="Reason for rejection (optional, shown to organizer)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />

              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => setRejectModal(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmReject}
                  className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(239,68,68,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-[0_18px_36px_rgba(239,68,68,0.30)]"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminEvents