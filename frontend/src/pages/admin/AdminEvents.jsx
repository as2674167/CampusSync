import { useEffect, useState } from 'react'
import { eventsAPI } from '../../services/api'
import toast from 'react-hot-toast'

const TABS = ['pending', 'approved', 'rejected']

const statusColors = {
  pending:  'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

const AdminEvents = () => {
  const [activeTab, setActiveTab]   = useState('pending')
  const [events, setEvents]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [rejectModal, setRejectModal] = useState(null) // holds event object
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
        <p className="text-gray-600 mt-1">Review and manage events submitted by organizers</p>

        {/* Tabs */}
        <div className="mt-6 flex space-x-1 border-b border-gray-200">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-medium capitalize rounded-t-md transition-colors
                ${activeTab === tab
                  ? 'border-b-2 border-indigo-600 text-indigo-600 bg-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading {activeTab} events...</div>
          ) : events.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-400 text-lg">No {activeTab} events found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Title', 'Organizer', 'Date', 'Category', 'Status', ...(activeTab === 'rejected' ? ['Reason'] : []), ...(activeTab === 'pending' ? ['Actions'] : [])].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {events.map(event => (
                    <tr key={event._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{event.title}</div>
                        <div className="text-xs text-gray-400 truncate max-w-xs">{event.venue}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {event.organizer?.name || event.organizerName}
                        <div className="text-xs text-gray-400">{event.organizer?.email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(event.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{event.category}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[event.status]}`}>
                          {event.status}
                        </span>
                      </td>
                      {activeTab === 'rejected' && (
                        <td className="px-4 py-3 text-sm text-red-600 max-w-xs">
                          {event.rejectionReason || <span className="text-gray-400 italic">No reason given</span>}
                        </td>
                      )}
                      <td className="px-4 py-3 text-right space-x-2">
  {event.status === 'pending' ? (
    <>
      <button
        onClick={() => handleApprove(event._id)}
        className="px-3 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
      >
        Approve
      </button>
      <button
        onClick={() => openRejectModal(event)}
        className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition"
      >
        Reject
      </button>
    </>
  ) : (
    <span className="text-xs text-gray-400">No actions</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900">Reject Event</h2>
            <p className="text-sm text-gray-500 mt-1">
              Rejecting: <span className="font-medium text-gray-800">{rejectModal.title}</span>
            </p>
            <textarea
              className="mt-4 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              rows={3}
              placeholder="Reason for rejection (optional, shown to organizer)"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setRejectModal(null)}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="px-4 py-2 text-sm rounded-md bg-red-600 text-white font-semibold hover:bg-red-700"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminEvents