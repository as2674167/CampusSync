import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { galleryAPI, eventsAPI } from '../services/api'
import toast from 'react-hot-toast'
import {
  Upload,
  X,
  Trash2,
  Heart,
  Search,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Tag,
  User,
  Calendar,
  Loader2,
  ArrowLeft,
} from 'lucide-react'

// ── Upload Modal ──────────────────────────────────────────────────────────────
const UploadModal = ({ onClose, onUpload, eventId = null, showEventPicker = false }) => {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [selectedEventId, setSelectedEventId] = useState(eventId || '')
  const [events, setEvents] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef()

  useEffect(() => {
    if (showEventPicker) {
      setLoadingEvents(true)
      eventsAPI
        .getEvents({ status: 'approved', limit: 100 })
        .then((res) => {
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
      toast.error('Please select a valid image file')
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return toast.error('Please select an image')
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
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md">
      {/* CARD: yahi height control kiya hai */}
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[30px] border border-white/70 bg-white/95 shadow-[0_30px_100px_rgba(15,23,42,0.24)]">
        <div className="border-b border-slate-200/70 bg-gradient-to-r from-slate-50 via-white to-blue-50/60 px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 shadow-md ring-1 ring-blue-100">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600/80">
                  Gallery upload
                </p>
                <h2 className="text-xl font-bold text-slate-900">Upload Photo</h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-2xl bg-white/80 p-2.5 text-slate-400 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div
            onDrop={(e) => {
              e.preventDefault()
              handleFile(e.dataTransfer.files[0])
            }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="group relative cursor-pointer overflow-hidden rounded-[26px] border-2 border-dashed border-slate-300 bg-gradient-to-br from-white via-slate-50 to-blue-50/50 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-[0_22px_55px_rgba(59,130,246,0.14)]"
            style={{ minHeight: 180 }}
          >
            {preview ? (
              <>
                <img
                  src={preview}
                  alt="Preview"
                  className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </>
            ) : (
              <div className="flex h-56 flex-col items-center justify-center gap-3 px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-md ring-1 ring-blue-100 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white">
                  <ImageIcon className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Click or drag & drop your photo
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    PNG, JPG, WEBP, GIF — max 10 MB
                  </p>
                </div>
              </div>
            )}

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>

          {showEventPicker && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Event <span className="text-red-500">*</span>
              </label>

              {loadingEvents ? (
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading events…</span>
                </div>
              ) : (
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">— Select an event —</option>
                  {events.map((ev) => (
                    <option key={ev._id} value={ev._id}>
                      {ev.title || ev.eventTitle || ev.name}
                    </option>
                  ))}
                </select>
              )}

              {!loadingEvents && events.length === 0 && (
                <p className="mt-1 text-xs text-red-400">
                  No approved events found. Events must be approved before uploading photos.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Title {showEventPicker && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder={showEventPicker ? 'Give your photo a title' : 'Give your photo a title (optional)'}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={300}
              rows={3}
              placeholder="Optional caption…"
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Tags <span className="text-xs text-slate-400">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. cultural, dance, fest"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(79,70,229,0.28)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_28px_60px_rgba(79,70,229,0.38)] disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload
                </>
              )}
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

  const goPrev = useCallback(() => setActive((i) => Math.max(0, i - 1)), [])
  const goNext = useCallback(() => setActive((i) => Math.min(images.length - 1, i + 1)), [images.length])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
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
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  if (!current) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0d0f14]">
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/20">
            <ImageIcon className="h-4 w-4 text-sky-400" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-white">{current.title}</p>
            <p className="text-xs text-slate-400">
              {active + 1} / {images.length}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-xl bg-white/5 p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
        <img
          key={current._id}
          src={current.imageUrl}
          alt={current.title}
          className="max-h-full max-w-full select-none rounded-xl object-contain shadow-2xl"
          style={{ animation: 'fadeIn 0.2s ease' }}
        />

        {active > 0 && (
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {active < images.length - 1 && (
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-black/50 p-4 text-white backdrop-blur-sm">
          <h3 className="text-sm font-semibold">{current.title}</h3>
          {current.description && (
            <p className="mt-0.5 text-xs text-slate-300">{current.description}</p>
          )}
          <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {current.uploaderName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(current.createdAt).toLocaleDateString('en-IN')}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3 text-red-400" />
              {current.likeCount ?? current.likes?.length ?? 0}
            </span>
          </div>

          {current.tags?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {current.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-0.5 rounded-full bg-white/15 px-2 py-0.5 text-[10px] text-slate-200"
                >
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        ref={thumbsRef}
        className="flex shrink-0 gap-2 overflow-x-auto border-t border-white/10 bg-black/30 px-4 py-3"
        style={{ scrollbarWidth: 'none' }}
      >
        {images.map((img, i) => (
          <button
            key={img._id}
            data-index={i}
            onClick={() => setActive(i)}
            className={`shrink-0 overflow-hidden rounded-lg transition-all duration-200 focus:outline-none ${
              i === active
                ? 'scale-105 opacity-100 ring-2 ring-sky-400 ring-offset-2 ring-offset-black'
                : 'opacity-50 hover:opacity-80'
            }`}
            style={{ width: 72, height: 54 }}
          >
            <img
              src={img.thumbnailUrl || img.imageUrl}
              alt={img.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white/80 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
    <div className="aspect-[4/3] animate-pulse bg-gradient-to-br from-slate-200 via-slate-100 to-blue-100/60" />
    <div className="space-y-2 p-4">
      <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
      <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
    </div>
  </div>
)

// ── Event Album Card ──────────────────────────────────────────────────────────
const EventAlbumCard = ({ group, onClick }) => (
  <div
    onClick={onClick}
    className="group relative cursor-pointer overflow-hidden rounded-[26px] border border-blue-100 bg-gradient-to-br from-white via-blue-50/70 to-indigo-100/70 shadow-[0_18px_50px_rgba(37,99,235,0.10)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:border-blue-300 hover:shadow-[0_30px_80px_rgba(59,130,246,0.22)]"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-violet-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

    <div className="relative aspect-[4/3] overflow-hidden">
      {group.cover ? (
        <img
          src={group.cover}
          alt={group.eventTitle}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-slate-200">
          <ImageIcon className="h-10 w-10 text-slate-400" />
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/35">
        <div className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-800 opacity-0 shadow transition-opacity duration-300 group-hover:opacity-100">
          <ZoomIn className="h-3.5 w-3.5" />
          View {group.photoCount} photo{group.photoCount !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
        {group.photoCount} 📷
      </div>
    </div>

    <div className="bg-white/90 p-4 backdrop-blur-sm">
      <h3 className="truncate text-sm font-bold text-slate-900">{group.eventTitle}</h3>
      <div className="mt-1 flex items-center gap-2">
        {group.eventCategory && (
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium capitalize text-blue-700">
            {group.eventCategory}
          </span>
        )}
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <Calendar className="h-3 w-3" />
          {new Date(group.latestAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
          })}
        </span>
      </div>
    </div>
  </div>
)

// ── Event Photos View ─────────────────────────────────────────────────────────
const EventPhotosView = ({ group, currentUser, canUpload, onBack, onShowUpload }) => {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewer, setViewer] = useState({ open: false, index: 0 })

  useEffect(() => {
    setLoading(true)
    galleryAPI
      .getEventPhotos(group._id)
      .then((res) => setPhotos(res.data.data || []))
      .catch(() => toast.error('Failed to load photos'))
      .finally(() => setLoading(false))
  }, [group._id])

  const handleLike = async (id) => {
    if (!currentUser) return toast.error('Please login to like photos')
    try {
      const res = await galleryAPI.toggleLike(id)
      setPhotos((prev) =>
        prev.map((img) => {
          if (img._id !== id) return img
          const liked = res.data.liked
          const updatedLikes = liked
            ? [...(img.likes || []), { _id: currentUser._id }]
            : (img.likes || []).filter((l) => (l._id || l) !== currentUser._id)
          return { ...img, likes: updatedLikes, likeCount: res.data.likeCount }
        })
      )
    } catch {
      toast.error('Like failed')
    }
  }

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return
    try {
      await galleryAPI.deleteImage(id)
      setPhotos((prev) => prev.filter((p) => p._id !== id))
      toast.success('Deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.10),_transparent_24%),linear-gradient(to_bottom,_#f8fbff,_#eef4ff,_#f6f9ff)]">
      <div className="sticky top-0 z-30 border-b border-white/60 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="rounded-2xl bg-white/90 p-2 text-slate-600 shadow-sm transition-colors hover:bg-slate-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900">{group.eventTitle}</h1>
              <p className="text-xs text-slate-500">
                {photos.length} photo{photos.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {canUpload && (
            <button
              onClick={onShowUpload}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(79,70,229,0.30)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_28px_60px_rgba(79,70,229,0.38)]"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload Photo</span>
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="overflow-hidden rounded-[30px] border border-white/60 bg-white/90 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-white via-slate-50 to-blue-50/50 py-24 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                <ImageIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">No photos yet</h3>
              <p className="mt-1 text-sm text-slate-500">Be the first to upload a photo for this event!</p>

              {canUpload && (
                <button
                  onClick={onShowUpload}
                  className="mt-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(79,70,229,0.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(79,70,229,0.38)]"
                >
                  Upload Photo
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo, i) => {
              const isOwner = currentUser && photo.uploader?._id === currentUser._id
              const isAdmin = currentUser?.role === 'admin'
              const canDelete = isOwner || isAdmin
              const isLiked = currentUser && photo.likes?.some((l) => (l._id || l) === currentUser._id)

              return (
                <div
                  key={photo._id}
                  className="group relative overflow-hidden rounded-[26px] border border-violet-100 bg-gradient-to-br from-white via-violet-50/70 to-purple-100/70 shadow-[0_18px_50px_rgba(139,92,246,0.10)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:border-violet-300 hover:shadow-[0_30px_80px_rgba(139,92,246,0.22)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/10 to-fuchsia-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div
                    className="relative aspect-[4/3] cursor-pointer overflow-hidden"
                    onClick={() => setViewer({ open: true, index: i })}
                  >
                    <img
                      src={photo.thumbnailUrl || photo.imageUrl}
                      alt={photo.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/25">
                      <ZoomIn className="h-8 w-8 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>
                  </div>

                  <div className="bg-white/90 p-3 backdrop-blur-sm">
                    <h3 className="truncate text-sm font-semibold text-slate-900">{photo.title}</h3>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="flex max-w-[60%] items-center gap-1 truncate text-xs text-slate-500">
                        <User className="h-3 w-3 shrink-0" />
                        {photo.uploaderName}
                      </span>

                      <div className="flex items-center gap-2">
                        {currentUser && (
                          <button
                            onClick={() => handleLike(photo._id)}
                            className={`flex items-center gap-1 text-xs transition-colors ${
                              isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'
                            }`}
                          >
                            <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-red-500' : ''}`} />
                            {photo.likeCount ?? photo.likes?.length ?? 0}
                          </button>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => handleDelete(photo._id, photo.title)}
                            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {photo.tags?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {photo.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-0.5 rounded-full bg-violet-50 px-1.5 py-0.5 text-[10px] text-violet-700"
                          >
                            <Tag className="h-2.5 w-2.5" />
                            {tag}
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
        <GalleryViewer
          images={photos}
          startIndex={viewer.index}
          onClose={() => setViewer({ open: false, index: 0 })}
        />
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const GalleryPage = () => {
  const { user, isAuthenticated } = useAuth()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [activeGroup, setActiveGroup] = useState(null)

  const fetchGroups = useCallback(async () => {
    setLoading(true)
    try {
      const res = await galleryAPI.getEventGroups()
      setGroups(res.data.data || [])
    } catch {
      toast.error('Failed to load gallery')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  const handleNewImage = () => {
    fetchGroups()
    if (activeGroup) setActiveGroup((g) => ({ ...g, _refresh: Date.now() }))
  }

  const filtered = groups.filter(
    (g) => !search || g.eventTitle?.toLowerCase().includes(search.toLowerCase())
  )

  const canUpload = isAuthenticated && ['student', 'organizer', 'admin'].includes(user?.role)

  if (activeGroup) {
    return (
      <>
        <EventPhotosView
          key={activeGroup._id + (activeGroup._refresh || '')}
          group={activeGroup}
          currentUser={user}
          canUpload={canUpload}
          onBack={() => {
            setActiveGroup(null)
            fetchGroups()
          }}
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.10),_transparent_24%),linear-gradient(to_bottom,_#f8fbff,_#eef4ff,_#f6f9ff)]">
      <div className="sticky top-0 z-30 border-b border-white/60 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 shadow-md ring-1 ring-blue-100">
                  <ImageIcon className="h-5 w-5" />
                </span>
                Campus Gallery
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {groups.length} event album{groups.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value)
                    setSearch(e.target.value)
                  }}
                  placeholder="Search events…"
                  className="w-full rounded-2xl border border-slate-200 bg-white/90 py-2.5 pl-10 pr-9 text-sm text-slate-800 shadow-sm outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-100 sm:w-64"
                />
                <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />

                {searchInput && (
                  <button
                    onClick={() => {
                      setSearchInput('')
                      setSearch('')
                    }}
                    className="absolute right-3 text-slate-400 transition-colors hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {canUpload && (
                <button
                  onClick={() => setShowUpload(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(79,70,229,0.30)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_28px_60px_rgba(79,70,229,0.38)]"
                >
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Upload Photo</span>
                </button>
              )}

              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white/90 px-5 py-2.5 text-sm font-semibold text-blue-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50"
                >
                  Login to Upload
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="overflow-hidden rounded-[30px] border border-white/60 bg-white/90 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-white via-slate-50 to-blue-50/50 py-24 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                <ImageIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">
                {search ? `No events found for "${search}"` : 'No event albums yet'}
              </h3>
              <p className="mt-1 max-w-xs text-sm text-slate-500">
                Upload a photo and link it to an event to create the first album.
              </p>

              {canUpload && (
                <button
                  onClick={() => setShowUpload(true)}
                  className="mt-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(79,70,229,0.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(79,70,229,0.38)]"
                >
                  Upload Photo
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((group) => (
              <EventAlbumCard
                key={group._id}
                group={group}
                onClick={() => setActiveGroup(group)}
              />
            ))}
          </div>
        )}
      </div>

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