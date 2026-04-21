import axios from 'axios'
import toast from 'react-hot-toast'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 👇 ADD THIS - Auto-handle FormData (for file uploads)
    // If the data is FormData, remove Content-Type so axios sets it with correct boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token')
      window.location.href = '/login'
    } else if (error.response?.status === 403) {
      toast.error('Access denied. You do not have permission to perform this action.')
    } else if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.')
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please check your connection.')
    } else if (!error.response) {
      toast.error('Network error. Please check your connection.')
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  logout: () => api.post('/auth/logout'),
}

// Events API
export const eventsAPI = {
  getEvents: (params = {}) => api.get('/events', { params }),
  getEvent: (id) => api.get(`/events/${id}`),
  createEvent: (eventData) => api.post('/events', eventData),
  updateEvent: (id, eventData) => api.put(`/events/${id}`, eventData),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  updateEventStatus: (id, status, rejectionReason) => 
    api.put(`/events/${id}/status`, { status, rejectionReason }),
  getEventRegistrations: (id) => api.get(`/events/${id}/registrations`),
}

// Users API
export const usersAPI = {
  getUsers: (params = {}) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getUserEvents: (id) => api.get(`/users/${id}/events`),
  getSystemStats: () => api.get('/users/stats/overview'),
}

// Registrations API
export const registrationsAPI = {
  registerForEvent: (eventId, additionalInfo = {}) => 
    api.post(`/registrations/events/${eventId}`, { additionalInfo }),
  getRegistrations: (params = {}) => api.get('/registrations', { params }),
  getRegistration: (id) => api.get(`/registrations/${id}`),
  updateRegistration: (id, data) => api.put(`/registrations/${id}`, data),
  deleteRegistration: (id) => api.delete(`/registrations/${id}`),
  checkInUser: (id) => api.post(`/registrations/${id}/checkin`),
  exportRegistrations: (eventId) => api.get(`/registrations/events/${eventId}/export`),
}

// Helper functions
export const uploadImage = async (file) => {
  const formData = new FormData()
  formData.append('image', file)

  try {
    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const downloadFile = async (url, filename) => {
  try {
    const response = await api.get(url, {
      responseType: 'blob',
    })

    const blob = new Blob([response.data])
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = filename
    link.click()

    window.URL.revokeObjectURL(link.href)
  } catch (error) {
    toast.error('Download failed')
    throw error
  }
}

// 👇 ADD THIS - Helper to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null
  if (imagePath.startsWith('http')) return imagePath
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
  return `${baseUrl}${imagePath}`
}

// ── Gallery API ───────────────────────────────────────────────────────────────
export const galleryAPI = {
  getImages:   (params = {}) => api.get('/gallery', { params }),
  uploadImage: (formData)    => api.post('/gallery', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  }),
  deleteImage: (id) => api.delete(`/gallery/${id}`),
  toggleLike:  (id) => api.post(`/gallery/${id}/like`),
}

export default api