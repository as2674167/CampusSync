import { format, formatDistanceToNow, isPast, isFuture } from 'date-fns'

// Date formatting utilities
export const formatDate = (date, formatString = 'MMM dd, yyyy') => {
  if (!date) return ''
  return format(new Date(date), formatString)
}

export const formatDateTime = (date, time) => {
  if (!date) return ''
  const dateStr = format(new Date(date), 'MMM dd, yyyy')
  return time ? `${dateStr} at ${time}` : dateStr
}

export const formatTime = (time) => {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export const getRelativeTime = (date) => {
  if (!date) return ''
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export const isEventPast = (date) => {
  return isPast(new Date(date))
}

export const isEventFuture = (date) => {
  return isFuture(new Date(date))
}

// String utilities
export const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

export const capitalizeFirst = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const formatName = (name) => {
  if (!name) return ''
  return name
    .split(' ')
    .map(word => capitalizeFirst(word))
    .join(' ')
}

// Number utilities
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  return num.toLocaleString()
}

export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0
  return Math.round((value / total) * 100)
}

// Validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password) => {
  return password && password.length >= 6
}

export const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{8,}$/
  return phoneRegex.test(phone)
}

export const validateStudentId = (studentId) => {
  return studentId && studentId.length >= 5
}

// Event utilities
export const getEventStatus = (event) => {
  if (!event) return 'unknown'

  const now = new Date()
  const eventDate = new Date(event.date)
  const registrationDeadline = new Date(event.registrationDeadline)

  if (event.status !== 'approved') {
    return event.status
  }

  if (isPast(eventDate)) {
    return 'completed'
  }

  if (isPast(registrationDeadline)) {
    return 'registration-closed'
  }

  if (event.registrationCount >= event.capacity) {
    return 'full'
  }

  return 'open'
}

export const getEventStatusColor = (status) => {
  const colors = {
    'approved': 'text-green-600 bg-green-100',
    'pending': 'text-yellow-600 bg-yellow-100',
    'rejected': 'text-red-600 bg-red-100',
    'cancelled': 'text-gray-600 bg-gray-100',
    'completed': 'text-blue-600 bg-blue-100',
    'registration-closed': 'text-orange-600 bg-orange-100',
    'full': 'text-purple-600 bg-purple-100',
    'open': 'text-green-600 bg-green-100',
  }
  return colors[status] || 'text-gray-600 bg-gray-100'
}

export const getEventStatusText = (status) => {
  const texts = {
    'approved': 'Approved',
    'pending': 'Pending Approval',
    'rejected': 'Rejected',
    'cancelled': 'Cancelled',
    'completed': 'Completed',
    'registration-closed': 'Registration Closed',
    'full': 'Full',
    'open': 'Open for Registration',
  }
  return texts[status] || 'Unknown'
}

export const getEventCategoryIcon = (category) => {
  const icons = {
    'Academic': '🎓',
    'Cultural': '🎭',
    'Sports': '⚽',
    'Technical': '💻',
    'Workshop': '🔧',
    'Seminar': '📚',
    'Competition': '🏆',
  }
  return icons[category] || '📅'
}

// Role utilities
export const getRoleBadgeColor = (role) => {
  const colors = {
    'admin': 'text-red-600 bg-red-100',
    'organizer': 'text-blue-600 bg-blue-100',
    'student': 'text-green-600 bg-green-100',
  }
  return colors[role] || 'text-gray-600 bg-gray-100'
}

// File utilities
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase()
}

export const isImageFile = (filename) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']
  const extension = getFileExtension(filename)
  return imageExtensions.includes(extension)
}

// Local storage utilities
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error reading from localStorage:`, error)
    return defaultValue
  }
}

export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error writing to localStorage:`, error)
  }
}

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing from localStorage:`, error)
  }
}

// URL utilities
export const getQueryParams = (url = window.location.search) => {
  const params = new URLSearchParams(url)
  const result = {}

  for (const [key, value] of params.entries()) {
    result[key] = value
  }

  return result
}

export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams()

  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      searchParams.append(key, params[key])
    }
  })

  return searchParams.toString()
}

// Error handling utilities
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message
  }

  if (error.response?.data?.errors) {
    const errors = error.response.data.errors
    if (Array.isArray(errors) && errors.length > 0) {
      return errors[0].message || 'Validation error'
    }
  }

  if (error.message) {
    return error.message
  }

  return 'An unexpected error occurred'
}