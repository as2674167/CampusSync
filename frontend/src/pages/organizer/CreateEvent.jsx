import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { eventsAPI } from '../../services/api'
import { ButtonSpinner } from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const CreateEvent = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    category: '',
    capacity: '',
    registrationDeadline: '',
    requirements: '',
    tags: '',
    contactInfo: {
      email: '',
      phone: ''
    }
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Image state
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const categories = ['Academic', 'Cultural', 'Sports', 'Technical', 'Workshop', 'Seminar', 'Competition']

  const venues = [
    'Main Auditorium',
    'Conference Hall',
    'Computer Lab 1',
    'Computer Lab 2',
    'Sports Complex',
    'Open Ground',
    'Cafeteria',
    'Library Hall',
    'Lecture Hall A',
    'Lecture Hall B'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name.startsWith('contactInfo.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [field]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, image: 'Please upload a valid image (JPEG, PNG, WebP, GIF)' }))
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }))
      return
    }

    setImageFile(file)
    setErrors(prev => ({ ...prev, image: '' }))

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    // Reset file input
    const fileInput = document.getElementById('image')
    if (fileInput) fileInput.value = ''
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Event description is required'
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters'
    }

    if (!formData.date) {
      newErrors.date = 'Event date is required'
    } else {
      const eventDate = new Date(formData.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (eventDate <= today) {
        newErrors.date = 'Event date must be in the future'
      }
    }

    if (!formData.time) {
      newErrors.time = 'Event time is required'
    }

    if (!formData.venue) {
      newErrors.venue = 'Event venue is required'
    }

    if (!formData.category) {
      newErrors.category = 'Event category is required'
    }

    if (!formData.capacity) {
      newErrors.capacity = 'Event capacity is required'
    } else {
      const capacity = parseInt(formData.capacity)
      if (isNaN(capacity) || capacity < 1) {
        newErrors.capacity = 'Capacity must be a positive number'
      } else if (capacity > 10000) {
        newErrors.capacity = 'Capacity cannot exceed 10,000'
      }
    }

    if (!formData.registrationDeadline) {
      newErrors.registrationDeadline = 'Registration deadline is required'
    } else if (formData.date) {
      const deadline = new Date(formData.registrationDeadline)
      const eventDate = new Date(formData.date)
      if (deadline >= eventDate) {
        newErrors.registrationDeadline = 'Registration deadline must be before event date'
      }
      if (deadline <= new Date()) {
        newErrors.registrationDeadline = 'Registration deadline must be in the future'
      }
    }

    if (formData.contactInfo.email && !/\S+@\S+\.\S+/.test(formData.contactInfo.email)) {
      newErrors['contactInfo.email'] = 'Please enter a valid email address'
    }

    if (formData.contactInfo.phone && !/^[\+]?[1-9][\d\s\-\(\)]{8,}$/.test(formData.contactInfo.phone)) {
      newErrors['contactInfo.phone'] = 'Please enter a valid phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      // Use FormData to send file along with other data
      const formDataToSend = new FormData()
      
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('date', formData.date)
      formDataToSend.append('time', formData.time)
      formDataToSend.append('venue', formData.venue)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('capacity', parseInt(formData.capacity))
      formDataToSend.append('registrationDeadline', formData.registrationDeadline)
      formDataToSend.append('requirements', formData.requirements)
      
      const tagsArray = formData.tags 
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) 
        : []
      formDataToSend.append('tags', JSON.stringify(tagsArray))
      
      formDataToSend.append('contactInfo', JSON.stringify(formData.contactInfo))
      
      // Append image if selected
      if (imageFile) {
        formDataToSend.append('image', imageFile)
      }

      await eventsAPI.createEvent(formDataToSend)
      toast.success('Event created successfully! Waiting for admin approval.')
      navigate('/organizer/manage-events', { state: { reload: true } })
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create event'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
          <p className="text-gray-600 mt-2">Fill in the details to create your event</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Image (optional)
              </label>
              
              {!imagePreview ? (
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleImageChange}
                    disabled={isSubmitting}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center">
                    <svg 
                      className="w-12 h-12 text-gray-400 mb-3" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                      />
                    </svg>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, WebP or GIF (MAX. 5MB)</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Event preview" 
                    className="w-full h-64 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    disabled={isSubmitting}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <svg 
                      className="w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M6 18L18 6M6 6l12 12" 
                      />
                    </svg>
                  </button>
                  <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                    <span className="truncate">{imageFile?.name}</span>
                    <span>{(imageFile?.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
              )}
              {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
            </div>

            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className={`input-field ${errors.title ? 'border-red-300' : ''}`}
                  placeholder="Enter event title"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  className={`input-field ${errors.description ? 'border-red-300' : ''}`}
                  placeholder="Describe your event in detail..."
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  className={`input-field ${errors.category ? 'border-red-300' : ''}`}
                  value={formData.category}
                  onChange={handleChange}
                  disabled={isSubmitting}
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
              </div>

              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity *
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  min="1"
                  max="10000"
                  className={`input-field ${errors.capacity ? 'border-red-300' : ''}`}
                  placeholder="Maximum participants"
                  value={formData.capacity}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {errors.capacity && <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>}
              </div>
            </div>

            {/* Date, Time, and Venue */}
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  className={`input-field ${errors.date ? 'border-red-300' : ''}`}
                  value={formData.date}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  className={`input-field ${errors.time ? 'border-red-300' : ''}`}
                  value={formData.time}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time}</p>}
              </div>

              <div>
                <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-2">
                  Venue *
                </label>
                <select
                  id="venue"
                  name="venue"
                  className={`input-field ${errors.venue ? 'border-red-300' : ''}`}
                  value={formData.venue}
                  onChange={handleChange}
                  disabled={isSubmitting}
                >
                  <option value="">Select venue</option>
                  {venues.map(venue => (
                    <option key={venue} value={venue}>{venue}</option>
                  ))}
                </select>
                {errors.venue && <p className="mt-1 text-sm text-red-600">{errors.venue}</p>}
              </div>
            </div>

            {/* Registration Deadline */}
            <div>
              <label htmlFor="registrationDeadline" className="block text-sm font-medium text-gray-700 mb-2">
                Registration Deadline *
              </label>
              <input
                type="date"
                id="registrationDeadline"
                name="registrationDeadline"
                className={`input-field ${errors.registrationDeadline ? 'border-red-300' : ''}`}
                value={formData.registrationDeadline}
                onChange={handleChange}
                disabled={isSubmitting}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.registrationDeadline && <p className="mt-1 text-sm text-red-600">{errors.registrationDeadline}</p>}
            </div>

            {/* Additional Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                  Requirements (optional)
                </label>
                <textarea
                  id="requirements"
                  name="requirements"
                  rows={3}
                  className="input-field"
                  placeholder="Any special requirements or instructions..."
                  value={formData.requirements}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (optional)
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  className="input-field"
                  placeholder="Separate tags with commas"
                  value={formData.tags}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                <p className="mt-1 text-xs text-gray-500">e.g., programming, AI, networking</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information (optional)</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactInfo.email"
                    className={`input-field ${errors['contactInfo.email'] ? 'border-red-300' : ''}`}
                    placeholder="contact@example.com"
                    value={formData.contactInfo.email}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  {errors['contactInfo.email'] && <p className="mt-1 text-sm text-red-600">{errors['contactInfo.email']}</p>}
                </div>

                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    id="contactPhone"
                    name="contactInfo.phone"
                    className={`input-field ${errors['contactInfo.phone'] ? 'border-red-300' : ''}`}
                    placeholder="+1234567890"
                    value={formData.contactInfo.phone}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  {errors['contactInfo.phone'] && <p className="mt-1 text-sm text-red-600">{errors['contactInfo.phone']}</p>}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate('/organizer')}
                className="btn btn-outline"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <ButtonSpinner className="mr-2" />
                    Creating Event...
                  </>
                ) : (
                  'Create Event'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateEvent