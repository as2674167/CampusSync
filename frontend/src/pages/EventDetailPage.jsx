import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { eventsAPI, registrationsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

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
      fetchEvent() // Refresh event data
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
    } finally {
      setRegistering(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading event details..." />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event not found</h1>
          <Link to="/events" className="btn btn-primary">
            Back to Events
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link to="/events" className="text-blue-600 hover:text-blue-700">
            ← Back to Events
          </Link>
        </nav>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Event Image */}
          <img
            src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop'}
            alt={event.title}
            className="w-full h-64 object-cover"
          />

          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                    {event.category}
                  </span>
                  <span className="text-gray-500">by {event.organizerName}</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {event.title}
                </h1>
              </div>

              {isAuthenticated && user?.role === 'student' && (
                <button
                  onClick={handleRegister}
                  disabled={registering || event.userRegistration}
                  className="btn btn-primary"
                >
                  {registering ? 'Registering...' : 
                   event.userRegistration ? 'Already Registered' : 'Register Now'}
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="prose max-w-none">
                  <h3>About This Event</h3>
                  <p>{event.description}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="card p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Event Details</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">Date:</span>
                      <span className="ml-2">{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="font-medium">Time:</span>
                      <span className="ml-2">{event.time}</span>
                    </div>
                    <div>
                      <span className="font-medium">Venue:</span>
                      <span className="ml-2">{event.venue}</span>
                    </div>
                    <div>
                      <span className="font-medium">Capacity:</span>
                      <span className="ml-2">{event.capacity} people</span>
                    </div>
                    <div>
                      <span className="font-medium">Registered:</span>
                      <span className="ml-2">{event.registrationCount || 0} people</span>
                    </div>
                  </div>
                </div>

                {event.requirements && (
                  <div className="card p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Requirements</h3>
                    <p className="text-sm text-gray-600">{event.requirements}</p>
                  </div>
                )}

                {event.tags && event.tags.length > 0 && (
                  <div className="card p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
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