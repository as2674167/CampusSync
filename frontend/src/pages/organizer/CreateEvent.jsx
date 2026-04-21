import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { eventsAPI } from '../../services/api'
import { ButtonSpinner } from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const CreateEvent = () => {
  const navigate = useNavigate()
  const { id } = useParams()           // defined only on edit route
  const isEditMode = Boolean(id)

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
    contactInfo: { email: '', phone: '' }
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingEvent, setLoadingEvent] = useState(isEditMode)

  // Image state
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [existingImageUrl, setExistingImageUrl] = useState(null)

  const categories = [
    'Academic', 'Cultural', 'Sports', 'Technical',
    'Workshop', 'Seminar', 'Competition'
  ]

  const venues = [
    'Main Auditorium', 'Conference Hall', 'Computer Lab 1',
    'Computer Lab 2', 'Sports Complex', 'Open Ground',
    'Cafeteria', 'Library Hall', 'Lecture Hall A', 'Lecture Hall B'
  ]

  // ── Prefill form when in edit mode ──────────────────────────────────────────
  useEffect(() => {
    if (!isEditMode) return
    const fetchEvent = async () => {
      try {
        const res = await eventsAPI.getEvent(id)
        const e = res.data.event || res.data
        const dateStr = e.date ? new Date(e.date).toISOString().split('T')[0] : ''
        const deadlineStr = e.registrationDeadline
          ? new Date(e.registrationDeadline).toISOString().split('T')[0]
          : ''
        setFormData({
          title: e.title || '',
          description: e.description || '',
          date: dateStr,
          time: e.time || '',
          venue: e.venue || '',
          category: e.category || '',
          capacity: e.capacity?.toString() || '',
          registrationDeadline: deadlineStr,
          requirements: e.requirements || '',
          tags: Array.isArray(e.tags) ? e.tags.join(', ') : (e.tags || ''),
          contactInfo: {
            email: e.contactInfo?.email || '',
            phone: e.contactInfo?.phone || ''
          }
        })
        if (e.image) {
          setExistingImageUrl(e.image)
          setImagePreview(e.image)
        }
      } catch (err) {
        toast.error('Failed to load event details')
        navigate('/organizer/manage-events')
      } finally {
        setLoadingEvent(false)
      }
    }
    fetchEvent()
  }, [id, isEditMode, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('contactInfo.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        contactInfo: { ...prev.contactInfo, [field]: value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, image: 'Please upload a valid image (JPEG, PNG, WebP, GIF)' }))
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }))
      return
    }
    setImageFile(file)
    setExistingImageUrl(null)
    setErrors(prev => ({ ...prev, image: '' }))
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setExistingImageUrl(null)
    const fileInput = document.getElementById('image')
    if (fileInput) fileInput.value = ''
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = 'Event title is required'
    if (!formData.description.trim()) {
      newErrors.description = 'Event description is required'
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters'
    }
    if (!formData.date) {
      newErrors.date = 'Event date is required'
    } else {
      const eventDate = new Date(formData.date)
      const today = new Date(); today.setHours(0, 0, 0, 0)
      if (eventDate <= today) newErrors.date = 'Event date must be in the future'
    }
    if (!formData.time) newErrors.time = 'Event time is required'
    if (!formData.venue) newErrors.venue = 'Event venue is required'
    if (!formData.category) newErrors.category = 'Event category is required'
    if (!formData.capacity) {
      newErrors.capacity = 'Event capacity is required'
    } else {
      const cap = parseInt(formData.capacity)
      if (isNaN(cap) || cap < 1) newErrors.capacity = 'Capacity must be a positive number'
      else if (cap > 10000) newErrors.capacity = 'Capacity cannot exceed 10,000'
    }
    if (!formData.registrationDeadline) {
      newErrors.registrationDeadline = 'Registration deadline is required'
    } else if (formData.date) {
      const deadline = new Date(formData.registrationDeadline)
      const eventDate = new Date(formData.date)
      if (deadline >= eventDate) newErrors.registrationDeadline = 'Registration deadline must be before event date'
      if (deadline <= new Date()) newErrors.registrationDeadline = 'Registration deadline must be in the future'
    }
    if (formData.contactInfo.email && !/\S+@\S+\.\S+/.test(formData.contactInfo.email))
      newErrors['contactInfo.email'] = 'Please enter a valid email address'
    if (formData.contactInfo.phone && !/^[\+]?[1-9][\d\s\-\(\)]{8,}$/.test(formData.contactInfo.phone))
      newErrors['contactInfo.phone'] = 'Please enter a valid phone number'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)
    try {
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
        ? formData.tags.split(',').map(t => t.trim()).filter(t => t)
        : []
      formDataToSend.append('tags', JSON.stringify(tagsArray))
      formDataToSend.append('contactInfo', JSON.stringify(formData.contactInfo))
      if (imageFile) formDataToSend.append('image', imageFile)

      if (isEditMode) {
        await eventsAPI.updateEvent(id, formDataToSend)
        toast.success('Event updated successfully!')
      } else {
        await eventsAPI.createEvent(formDataToSend)
        toast.success('Event created successfully! Waiting for admin approval.')
      }
      navigate('/organizer/manage-events', { state: { reload: true } })
    } catch (error) {
      const message = error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} event`
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputBase =
    'w-full rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm text-slate-800 shadow-[0_10px_30px_rgba(15,23,42,0.08)] outline-none transition-all duration-300 placeholder:text-slate-400 hover:-translate-y-0.5 hover:border-sky-400/80 hover:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-200/80'
  const inputError = 'border-red-300 focus:border-red-500 focus:ring-red-200/80'
  const labelClass = 'mb-2 block text-sm font-semibold tracking-wide text-slate-800'
  const sectionClass =
    'group relative overflow-hidden rounded-[24px] border border-white/80 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.10)] backdrop-blur transition-all duration-400 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(37,99,235,0.18)] sm:p-6'

  if (loadingEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500 text-sm">Loading event details...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),transparent_45%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.14),transparent_45%),linear-gradient(to_bottom,#f9fafb,#eef2ff,#f8fafc)] py-8 sm:py-10">
      <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
        <div className="h-full w-full bg-[linear-gradient(to_right,rgba(148,163,184,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.35)_1px,transparent_1px)] bg-[size:46px_46px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header card */}
        <div className="mb-8 overflow-hidden rounded-[26px] border border-white/80 bg-white/90 shadow-[0_22px_70px_rgba(15,23,42,0.18)] backdrop-blur">
          <div className="relative p-6 md:p-7">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.20),transparent_45%)]" />
            <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
                  Organizer Panel
                </span>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                  {isEditMode ? 'Edit Event' : 'Create New Event'}
                </h1>
                <p className="mt-2 max-w-xl text-sm text-slate-600 md:text-base">
                  {isEditMode
                    ? 'Update the details below and save your changes.'
                    : 'Fill in the details, add a cover, and publish a polished event page for students.'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                <div className="rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-center shadow-sm">
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">Style</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">Modern</p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-center shadow-sm">
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">Upload</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">5MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main glass card */}
        <div className="overflow-hidden rounded-[30px] border border-white/80 bg-white/90 shadow-[0_26px_90px_rgba(15,23,42,0.20)] backdrop-blur">
          <form onSubmit={handleSubmit} className="space-y-7 p-5 sm:p-7 md:p-8">

            {/* Image upload */}
            <section className={sectionClass}>
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400/60 via-indigo-400/60 to-sky-400/60 opacity-80" />
              <div className="relative mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold tracking-tight text-slate-900">Event Image</h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600">A nice banner instantly makes your event look attractive.</p>
                </div>
                <span className="rounded-full bg-slate-900 text-xs font-semibold text-white px-3 py-1 shadow-sm">Optional</span>
              </div>

              {!imagePreview ? (
                <label htmlFor="image" className="block relative overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-sky-400 hover:bg-white hover:shadow-[0_20px_55px_rgba(56,189,248,0.25)] sm:p-10">
                  <input type="file" id="image" name="image" accept="image/jpeg,image/jpg,image/png,image/webp,image/gif" onChange={handleImageChange} disabled={isSubmitting} className="hidden" />
                  <div className="flex flex-col items-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 via-indigo-100 to-sky-100 text-sky-600 shadow-lg">
                      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-700"><span className="font-semibold text-sky-600">Click to upload</span> or drag and drop</p>
                    <p className="mt-1 text-xs text-slate-500">PNG, JPG, WebP or GIF (MAX. 5MB)</p>
                  </div>
                </label>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-lg">
                  <div className="relative overflow-hidden rounded-xl">
                    <img src={imagePreview} alt="Event preview" className="h-64 w-full object-cover" />
                    <button type="button" onClick={removeImage} disabled={isSubmitting} className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600">✕</button>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                    <span className="truncate font-medium">{imageFile ? imageFile.name : 'Current image'}</span>
                    {imageFile && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{(imageFile.size / 1024 / 1024).toFixed(2)} MB</span>}
                  </div>
                </div>
              )}
              {errors.image && <p className="mt-2 text-sm font-medium text-red-600">{errors.image}</p>}
            </section>

            {/* Basic Info */}
            <section className={sectionClass}>
              <div className="relative mb-4">
                <h2 className="text-base font-semibold tracking-tight text-slate-900">Basic Information</h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">Core details that appear at the top of your event page.</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label htmlFor="title" className={labelClass}>Event Title *</label>
                  <input type="text" id="title" name="title" className={`${inputBase} ${errors.title ? inputError : ''}`} placeholder="Enter event title" value={formData.title} onChange={handleChange} disabled={isSubmitting} />
                  {errors.title && <p className="mt-2 text-sm font-medium text-red-600">{errors.title}</p>}
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="description" className={labelClass}>Description *</label>
                  <textarea id="description" name="description" rows={4} className={`${inputBase} resize-none ${errors.description ? inputError : ''}`} placeholder="Describe your event in detail..." value={formData.description} onChange={handleChange} disabled={isSubmitting} />
                  {errors.description && <p className="mt-2 text-sm font-medium text-red-600">{errors.description}</p>}
                </div>
                <div>
                  <label htmlFor="category" className={labelClass}>Category *</label>
                  <select id="category" name="category" className={`${inputBase} appearance-none ${errors.category ? inputError : ''}`} value={formData.category} onChange={handleChange} disabled={isSubmitting}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <p className="mt-2 text-sm font-medium text-red-600">{errors.category}</p>}
                </div>
                <div>
                  <label htmlFor="capacity" className={labelClass}>Capacity *</label>
                  <input type="number" id="capacity" name="capacity" min="1" max="10000" className={`${inputBase} ${errors.capacity ? inputError : ''}`} placeholder="Maximum participants" value={formData.capacity} onChange={handleChange} disabled={isSubmitting} />
                  {errors.capacity && <p className="mt-2 text-sm font-medium text-red-600">{errors.capacity}</p>}
                </div>
              </div>
            </section>

            {/* Date / Time / Venue */}
            <section className={sectionClass}>
              <div className="relative mb-4">
                <h2 className="text-base font-semibold tracking-tight text-slate-900">Schedule & Venue</h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">Select when and where the event will take place.</p>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <label htmlFor="date" className={labelClass}>Event Date *</label>
                  <input type="date" id="date" name="date" className={`${inputBase} ${errors.date ? inputError : ''}`} value={formData.date} onChange={handleChange} disabled={isSubmitting} min={new Date().toISOString().split('T')[0]} />
                  {errors.date && <p className="mt-2 text-sm font-medium text-red-600">{errors.date}</p>}
                </div>
                <div>
                  <label htmlFor="time" className={labelClass}>Start Time *</label>
                  <input type="time" id="time" name="time" className={`${inputBase} ${errors.time ? inputError : ''}`} value={formData.time} onChange={handleChange} disabled={isSubmitting} />
                  {errors.time && <p className="mt-2 text-sm font-medium text-red-600">{errors.time}</p>}
                </div>
                <div>
                  <label htmlFor="venue" className={labelClass}>Venue *</label>
                  <select id="venue" name="venue" className={`${inputBase} appearance-none ${errors.venue ? inputError : ''}`} value={formData.venue} onChange={handleChange} disabled={isSubmitting}>
                    <option value="">Select venue</option>
                    {venues.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  {errors.venue && <p className="mt-2 text-sm font-medium text-red-600">{errors.venue}</p>}
                </div>
              </div>
            </section>

            {/* Registration deadline */}
            <section className={sectionClass}>
              <div className="relative mb-4">
                <h2 className="text-base font-semibold tracking-tight text-slate-900">Registration Window</h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">Set the last date students can register.</p>
              </div>
              <div>
                <label htmlFor="registrationDeadline" className={labelClass}>Registration Deadline *</label>
                <input type="date" id="registrationDeadline" name="registrationDeadline" className={`${inputBase} ${errors.registrationDeadline ? inputError : ''}`} value={formData.registrationDeadline} onChange={handleChange} disabled={isSubmitting} min={new Date().toISOString().split('T')[0]} />
                {errors.registrationDeadline && <p className="mt-2 text-sm font-medium text-red-600">{errors.registrationDeadline}</p>}
              </div>
            </section>

            {/* Additional details */}
            <section className={sectionClass}>
              <div className="relative mb-4">
                <h2 className="text-base font-semibold tracking-tight text-slate-900">Additional Details</h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">Add extra instructions and tags to help discovery.</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="requirements" className={labelClass}>Requirements (optional)</label>
                  <textarea id="requirements" name="requirements" rows={3} className={`${inputBase} resize-none`} placeholder="Any special requirements or instructions..." value={formData.requirements} onChange={handleChange} disabled={isSubmitting} />
                </div>
                <div>
                  <label htmlFor="tags" className={labelClass}>Tags (optional)</label>
                  <input type="text" id="tags" name="tags" className={inputBase} placeholder="Separate tags with commas" value={formData.tags} onChange={handleChange} disabled={isSubmitting} />
                  <p className="mt-2 text-xs font-medium text-slate-500">e.g., programming, AI, networking</p>
                </div>
              </div>
            </section>

            {/* Contact info */}
            <section className={sectionClass}>
              <div className="relative mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold tracking-tight text-slate-900">Contact Information</h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600">Let students reach out if they have questions.</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Optional</span>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="contactEmail" className={labelClass}>Contact Email</label>
                  <input type="email" id="contactEmail" name="contactInfo.email" className={`${inputBase} ${errors['contactInfo.email'] ? inputError : ''}`} placeholder="contact@example.com" value={formData.contactInfo.email} onChange={handleChange} disabled={isSubmitting} />
                  {errors['contactInfo.email'] && <p className="mt-2 text-sm font-medium text-red-600">{errors['contactInfo.email']}</p>}
                </div>
                <div>
                  <label htmlFor="contactPhone" className={labelClass}>Contact Phone</label>
                  <input type="tel" id="contactPhone" name="contactInfo.phone" className={`${inputBase} ${errors['contactInfo.phone'] ? inputError : ''}`} placeholder="+1234567890" value={formData.contactInfo.phone} onChange={handleChange} disabled={isSubmitting} />
                  {errors['contactInfo.phone'] && <p className="mt-2 text-sm font-medium text-red-600">{errors['contactInfo.phone']}</p>}
                </div>
              </div>
            </section>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => navigate('/organizer/manage-events')} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-[0_10px_26px_rgba(15,23,42,0.10)] transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50" disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_20px_45px_rgba(56,189,248,0.55)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_65px_rgba(79,70,229,0.55)] disabled:cursor-not-allowed disabled:opacity-70">
                {isSubmitting ? (
                  <><ButtonSpinner className="mr-2" />{isEditMode ? 'Saving...' : 'Creating Event...'}</>
                ) : (
                  isEditMode ? 'Save Changes' : 'Create Event'
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