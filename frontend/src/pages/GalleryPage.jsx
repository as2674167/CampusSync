import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { galleryAPI, eventsAPI } from '../services/api'
import toast from 'react-hot-toast'
import {
  Upload, X, Trash2, Heart, Search,
  Image as ImageIcon, ChevronLeft, ChevronRight,
  ZoomIn, Tag, User, Calendar, Loader2, ArrowLeft,
} from 'lucide-react'

// ── Upload Modal ──────────────────────────────────────────────────────────────
const UploadModal = ({ onClose, onUpload, eventId = null, showEventPicker = false }) => {
  const [file, setFile]               = useState(null)
  const [preview, setPreview]         = useState(null)
  const [title, setTitle]             = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags]               = useState('')
  const [selectedEventId, setSelectedEventId] = useState(eventId || '')
  const [events, setEvents]           = useState([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [uploading, setUploading]     = useState(false)
  const inputRef                      = useRef()

  useEffect(() => {
    if (showEventPicker) {
      setLoadingEvents(true)
      eventsAPI.getEvents({ status: 'approved', limit: 100 })
        .then(res => {
          const list =
            res.data.events ||
            res.data.data?.events ||
            res.data.data ||
            []
          setEvents(list)
        })
        .catch(() => toast.error('Could not load events'))
        .finally(() => setLoadingEvents(false))
    }
  }, [showEventPicker])

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) {
      toast.error('Please select a valid image file'); return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file)         return toast.error('Please select an image')
    if (!title.trim() && showEventPicker) return toast.error('Title is required')
    if (showEventPicker && !selectedEventId) return toast.error('Please select an event')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      fd.append('title', title.trim())
      fd.append('description', description.trim())
      fd.append('tags', tags.trim())
      fd.append('eventId', selectedEventId || eventId || '')
      const res = await galleryAPI.uploadImage(fd)
      toast.success('Image uploaded!')
      onUpload(res.data.image)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally { setUploading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Upload className="w-5 h-5 text-sky-500" /> Upload Photo
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Drop zone */}
          <div
            onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-sky-400 transition-colors overflow-hidden"
            style={{ minHeight: 180 }}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center h-48 gap-2 text-slate-400">
                <ImageIcon className="w-10 h-10" />
                <p className="text-sm font-medium">Click or drag & drop your photo</p>
                <p className="text-xs">PNG, JPG, WEBP, GIF — max 10 MB</p>
              </div>
            )}
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => handleFile(e.target.files[0])} />
          </div>

          {/* Event picker */}
          {showEventPicker && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Event <span className="text-red-500">*</span>
              </label>
              {loadingEvents ? (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-400 text-sm bg-white dark:bg-slate-800">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading events…
                </div>
              ) : (
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                >
                  <option value="">— Select an event —</option>
                  {events.map(ev => (
                    <option key={ev._id} value={ev._id}>
                      {ev.title || ev.eventTitle || ev.name}
                    </option>
                  ))}
                </select>
              )}
              {!loadingEvents && events.length === 0 && (
                <p className="text-xs text-red-400 mt-1">No approved events found. Events must be approved before uploading photos.</p>
              )}
            </div>
          )}

          {/* Title */}
          <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
         Title {showEventPicker && <span className="text-red-500">*</span>}
       </label>
       <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
        maxLength={100}
       placeholder={showEventPicker ? "Give your photo a title" : "Give your photo a title (optional)"}
       className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
      </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              maxLength={300} rows={2} placeholder="Optional caption…"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none" />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tags <span className="text-xs text-slate-400">(comma-separated)</span>
            </label>
            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. cultural, dance, fest"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={uploading}
              className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              {uploading
                ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading…</>
                : <><Upload className="w-4 h-4" />Upload</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Full-Screen Viewer ────────────────────────────────────────────────────────
const GalleryViewer = ({ images, startIndex, onClose }) => {
  const [active, setActive] = useState(startIndex)
  const thumbsRef = useRef(null)
  const current = images[active]

  const goPrev = useCallback(() => setActive(i => Math.max(0, i - 1)), [])
  const goNext = useCallback(() => setActive(i => Math.min(images.length - 1, i + 1)), [images.length])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowLeft')  goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose, goPrev, goNext])

  useEffect(() => {
    const el = thumbsRef.current?.querySelector(`[data-index="${active}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [active])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  if (!current) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0d0f14]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">{current.title}</p>
            <p className="text-xs text-slate-400">{active + 1} / {images.length}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main image */}
      <div className="relative flex-1 flex items-center justify-center p-4 overflow-hidden">
        <img
          key={current._id}
          src={current.imageUrl}
          alt={current.title}
          className="max-h-full max-w-full object-contain rounded-xl shadow-2xl select-none"
          style={{ animation: 'fadeIn 0.2s ease' }}
        />
        {active > 0 && (
          <button onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors backdrop-blur-sm">
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {active < images.length - 1 && (
          <button onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors backdrop-blur-sm">
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
        {/* Info overlay */}
        <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/50 backdrop-blur-sm text-white">
          <h3 className="text-sm font-semibold">{current.title}</h3>
          {current.description && (
            <p className="text-xs text-slate-300 mt-0.5">{current.description}</p>
          )}
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
            <span className="flex items-center gap-1"><User className="w-3 h-3" />{current.uploaderName}</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(current.createdAt).toLocaleDateString('en-IN')}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-red-400" />
              {current.likeCount ?? current.likes?.length ?? 0}
            </span>
          </div>
          {current.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {current.tags.map(tag => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-slate-200 flex items-center gap-0.5">
                  <Tag className="w-2.5 h-2.5" />{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail strip */}
      <div
        ref={thumbsRef}
        className="shrink-0 flex gap-2 px-4 py-3 overflow-x-auto border-t border-white/10 bg-black/30"
        style={{ scrollbarWidth: 'none' }}
      >
        {images.map((img, i) => (
          <button
            key={img._id}
            data-index={i}
            onClick={() => setActive(i)}
            className={`shrink-0 rounded-lg overflow-hidden transition-all duration-200 focus:outline-none ${
              i === active
                ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-black scale-105 opacity-100'
                : 'opacity-50 hover:opacity-80'
            }`}
            style={{ width: 72, height: 54 }}
          >
            <img src={img.thumbnailUrl || img.imageUrl} alt={img.title}
              className="w-full h-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:scale(0.97); } to { opacity:1; transform:scale(1); } }
      `}</style>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden shadow-md">
    <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-700 animate-pulse" />
    <div className="p-4 bg-white dark:bg-slate-900 space-y-2">
      <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
    </div>
  </div>
)

// ── Event Album Card ──────────────────────────────────────────────────────────
const EventAlbumCard = ({ group, onClick }) => (
  <div
    onClick={onClick}
    className="group relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
  >
    <div className="relative aspect-[4/3] overflow-hidden">
      {group.cover ? (
        <img
          src={group.cover}
          alt={group.eventTitle}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-700">
          <ImageIcon className="w-10 h-10 text-slate-400" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors duration-300 flex items-center justify-center">
        <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 text-xs font-semibold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow">
          <ZoomIn className="w-3.5 h-3.5" />
          View {group.photoCount} photo{group.photoCount !== 1 ? 's' : ''}
        </div>
      </div>
      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm">
        {group.photoCount} 📷
      </div>
    </div>
    <div className="p-4 bg-white dark:bg-slate-900">
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{group.eventTitle}</h3>
      <div className="flex items-center gap-2 mt-1">
        {group.eventCategory && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 font-medium capitalize">
            {group.eventCategory}
          </span>
        )}
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(group.latestAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </span>
      </div>
    </div>
  </div>
)

// ── Event Photos View ─────────────────────────────────────────────────────────
const EventPhotosView = ({ group, currentUser, canUpload, onBack, onShowUpload }) => {
  const [photos, setPhotos]   = useState([])
  const [loading, setLoading] = useState(true)
  const [viewer, setViewer]   = useState({ open: false, index: 0 })

  useEffect(() => {
    setLoading(true)
    galleryAPI.getEventPhotos(group._id)
      .then(res => setPhotos(res.data.data || []))
      .catch(() => toast.error('Failed to load photos'))
      .finally(() => setLoading(false))
  }, [group._id])

  const handleLike = async (id) => {
    if (!currentUser) return toast.error('Please login to like photos')
    try {
      const res = await galleryAPI.toggleLike(id)
      setPhotos(prev => prev.map(img => {
        if (img._id !== id) return img
        const liked = res.data.liked
        const updatedLikes = liked
          ? [...(img.likes || []), { _id: currentUser._id }]
          : (img.likes || []).filter(l => (l._id || l) !== currentUser._id)
        return { ...img, likes: updatedLikes, likeCount: res.data.likeCount }
      }))
    } catch { toast.error('Like failed') }
  }

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return
    try {
      await galleryAPI.deleteImage(id)
      setPhotos(prev => prev.filter(p => p._id !== id))
      toast.success('Deleted')
    } catch { toast.error('Delete failed') }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Sub-header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">{group.eventTitle}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {photos.length} photo{photos.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          {canUpload && (
            <button onClick={onShowUpload}
              className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload Photo</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center mb-4">
              <ImageIcon className="w-8 h-8 text-sky-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No photos yet</h3>
            <p className="text-sm text-slate-400 mt-1">Be the first to upload a photo for this event!</p>
            {canUpload && (
              <button onClick={onShowUpload}
                className="mt-4 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold rounded-xl transition-colors">
                Upload Photo
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, i) => {
              const isOwner   = currentUser && photo.uploader?._id === currentUser._id
              const isAdmin   = currentUser?.role === 'admin'
              const canDelete = isOwner || isAdmin
              const isLiked   = currentUser && photo.likes?.some(l => (l._id || l) === currentUser._id)
              return (
                <div key={photo._id}
                  className="group relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-md hover:shadow-xl transition-all duration-300">
                  <div className="relative cursor-pointer aspect-[4/3] overflow-hidden"
                    onClick={() => setViewer({ open: true, index: i })}>
                    <img src={photo.thumbnailUrl || photo.imageUrl} alt={photo.title} loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{photo.title}</h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate max-w-[60%]">
                        <User className="w-3 h-3 shrink-0" />{photo.uploaderName}
                      </span>
                      <div className="flex items-center gap-2">
                        {currentUser && (
                          <button onClick={() => handleLike(photo._id)}
                            className={`flex items-center gap-1 text-xs transition-colors ${isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}>
                            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-500' : ''}`} />
                            {photo.likeCount ?? photo.likes?.length ?? 0}
                          </button>
                        )}
                        {canDelete && (
                          <button onClick={() => handleDelete(photo._id, photo.title)}
                            className="text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    {photo.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {photo.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300">
                            <Tag className="w-2.5 h-2.5" />{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {viewer.open && (
        <GalleryViewer images={photos} startIndex={viewer.index}
          onClose={() => setViewer({ open: false, index: 0 })} />
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const GalleryPage = () => {
  const { user, isAuthenticated } = useAuth()
  const [groups, setGroups]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [showUpload, setShowUpload]   = useState(false)
  const [activeGroup, setActiveGroup] = useState(null)

  const fetchGroups = useCallback(async () => {
    setLoading(true)
    try {
      const res = await galleryAPI.getEventGroups()
      setGroups(res.data.data || [])
    } catch { toast.error('Failed to load gallery') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchGroups() }, [fetchGroups])

  const handleNewImage = () => {
    fetchGroups()
    if (activeGroup) setActiveGroup(g => ({ ...g, _refresh: Date.now() }))
  }

  const filtered = groups.filter(g =>
    !search || g.eventTitle?.toLowerCase().includes(search.toLowerCase())
  )

  const canUpload = isAuthenticated && ['student', 'organizer', 'admin'].includes(user?.role)

  // ── Event photos inner view ──
  if (activeGroup) {
    return (
      <>
        <EventPhotosView
          key={activeGroup._id + (activeGroup._refresh || '')}
          group={activeGroup}
          currentUser={user}
          canUpload={canUpload}
          onBack={() => { setActiveGroup(null); fetchGroups() }}
          onShowUpload={() => setShowUpload(true)}
        />
        {showUpload && (
          <UploadModal
            onClose={() => setShowUpload(false)}
            onUpload={handleNewImage}
            eventId={activeGroup._id}
            showEventPicker={false}
          />
        )}
      </>
    )
  }

  // ── Event album cards grid (outer page) ──
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-sky-500" /> Campus Gallery
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {groups.length} event album{groups.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative flex items-center">
                <input type="text" value={searchInput}
                  onChange={(e) => { setSearchInput(e.target.value); setSearch(e.target.value) }}
                  placeholder="Search events…"
                  className="pl-9 pr-8 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 w-44 sm:w-60" />
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                {searchInput && (
                  <button onClick={() => { setSearchInput(''); setSearch('') }}
                    className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Upload button — outer page */}
              {canUpload && (
                <button onClick={() => setShowUpload(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Upload Photo</span>
                </button>
              )}
              {!isAuthenticated && (
                <Link to="/login"
                  className="flex items-center gap-2 px-4 py-2 border border-sky-400 text-sky-500 text-sm font-semibold rounded-xl hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors">
                  Login to Upload
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center mb-4">
              <ImageIcon className="w-8 h-8 text-sky-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
              {search ? `No events found for "${search}"` : 'No event albums yet'}
            </h3>
            <p className="text-sm text-slate-400 mt-1 max-w-xs">
              Upload a photo and link it to an event to create the first album.
            </p>
            {canUpload && (
              <button onClick={() => setShowUpload(true)}
                className="mt-4 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold rounded-xl transition-colors">
                Upload Photo
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(group => (
              <EventAlbumCard
                key={group._id}
                group={group}
                onClick={() => setActiveGroup(group)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upload modal — outer page, shows event picker */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUpload={handleNewImage}
          eventId={null}
          showEventPicker={true}
        />
      )}
    </div>
  )
}

export default GalleryPage