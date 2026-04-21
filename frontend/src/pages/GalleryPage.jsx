import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { galleryAPI } from '../services/api'
import toast from 'react-hot-toast'
import {
  Upload, X, Trash2, Heart, Search,
  Image as ImageIcon, ChevronLeft, ChevronRight,
  ZoomIn, Tag, User, Calendar, Loader2,
} from 'lucide-react'

// ── Upload Modal ──────────────────────────────────────────────────────────────
const UploadModal = ({ onClose, onUpload }) => {
  const [file, setFile]               = useState(null)
  const [preview, setPreview]         = useState(null)
  const [title, setTitle]             = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags]               = useState('')
  const [uploading, setUploading]     = useState(false)
  const inputRef                      = useRef()

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) {
      toast.error('Please select a valid image file'); return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file)        return toast.error('Please select an image')
    if (!title.trim()) return toast.error('Title is required')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      fd.append('title', title.trim())
      fd.append('description', description.trim())
      fd.append('tags', tags.trim())
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
            <Upload className="w-5 h-5 text-sky-500" /> Upload to Gallery
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

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              maxLength={100} placeholder="Give your photo a title"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              maxLength={300} rows={2} placeholder="Optional caption…"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none" />
          </div>

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
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading…</> : <><Upload className="w-4 h-4" />Upload</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
const Lightbox = ({ images, currentIndex, onClose, onPrev, onNext }) => {
  const image = images[currentIndex]

  const handleKey = useCallback((e) => {
    if (e.key === 'Escape')     onClose()
    if (e.key === 'ArrowLeft')  onPrev()
    if (e.key === 'ArrowRight') onNext()
  }, [onClose, onPrev, onNext])

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [handleKey])

  if (!image) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/92" onClick={onClose}>
      <img src={image.imageUrl} alt={image.title}
        className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()} />

      <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors">
        <X className="w-5 h-5" />
      </button>
      {currentIndex > 0 && (
        <button onClick={(e) => { e.stopPropagation(); onPrev() }}
          className="absolute left-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {currentIndex < images.length - 1 && (
        <button onClick={(e) => { e.stopPropagation(); onNext() }}
          className="absolute right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors">
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white"
        onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-semibold">{image.title}</h3>
        {image.description && <p className="text-sm text-slate-300 mt-0.5">{image.description}</p>}
        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
          <span className="flex items-center gap-1"><User className="w-3 h-3" />{image.uploaderName}</span>
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(image.createdAt).toLocaleDateString('en-IN')}</span>
        </div>
        {image.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {image.tags.map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-slate-200">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Gallery Card ──────────────────────────────────────────────────────────────
const GalleryCard = ({ image, currentUser, onDelete, onLike, onOpen }) => {
  const isOwner   = currentUser && image.uploader?._id === currentUser._id
  const isAdmin   = currentUser?.role === 'admin'
  const canDelete = isOwner || isAdmin
  const isLiked   = currentUser && image.likes?.some(l => (l._id || l) === currentUser._id)

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-md hover:shadow-xl transition-all duration-300">
      <div className="relative cursor-pointer aspect-[4/3] overflow-hidden" onClick={() => onOpen(image)}>
        <img src={image.thumbnailUrl || image.imageUrl} alt={image.title} loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-center justify-center">
          <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>

      <div className="p-3 bg-white dark:bg-slate-900">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{image.title}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate max-w-[60%]">
            <User className="w-3 h-3 shrink-0" />{image.uploaderName}
          </span>
          <div className="flex items-center gap-2">
            {currentUser && (
              <button onClick={() => onLike(image._id)}
                className={`flex items-center gap-1 text-xs transition-colors ${isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}>
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-500' : ''}`} />
                {image.likeCount ?? image.likes?.length ?? 0}
              </button>
            )}
            {canDelete && (
              <button onClick={() => onDelete(image._id, image.title)}
                className="text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        {image.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {image.tags.slice(0, 3).map(tag => (
              <span key={tag} className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300">
                <Tag className="w-2.5 h-2.5" />{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden">
    <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-700 animate-pulse" />
    <div className="p-3 bg-white dark:bg-slate-900 space-y-2">
      <div className="h-3.5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
    </div>
  </div>
)

// ── Main Page ─────────────────────────────────────────────────────────────────
const GalleryPage = () => {
  const { user, isAuthenticated }     = useAuth()
  const [images, setImages]           = useState([])
  const [pagination, setPagination]   = useState({ page: 1, pages: 1, total: 0 })
  const [loading, setLoading]         = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [search, setSearch]           = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [showUpload, setShowUpload]   = useState(false)
  const [lightbox, setLightbox]       = useState({ open: false, index: 0 })

  const fetchImages = useCallback(async (page = 1, q = search, append = false) => {
    if (page === 1) setLoading(true); else setLoadingMore(true)
    try {
      const params = { page, limit: 12 }
      if (q) params.search = q
      const res = await galleryAPI.getImages(params)
      setImages(prev => append ? [...prev, ...res.data.images] : res.data.images)
      setPagination(res.data.pagination)
    } catch { toast.error('Failed to load gallery') }
    finally { setLoading(false); setLoadingMore(false) }
  }, [search])

  useEffect(() => { fetchImages(1, search, false) }, [search])

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput) }
  const clearSearch  = ()  => { setSearchInput(''); setSearch('') }

  const handleNewImage = (img) => {
    setImages(prev => [img, ...prev])
    setPagination(prev => ({ ...prev, total: prev.total + 1 }))
  }

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    try {
      await galleryAPI.deleteImage(id)
      setImages(prev => prev.filter(img => img._id !== id))
      setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }))
      toast.success('Image deleted')
    } catch (err) { toast.error(err.response?.data?.message || 'Deletion failed') }
  }

  const handleLike = async (id) => {
    if (!isAuthenticated) return toast.error('Please login to like images')
    try {
      const res = await galleryAPI.toggleLike(id)
      setImages(prev => prev.map(img => {
        if (img._id !== id) return img
        const liked = res.data.liked
        const updatedLikes = liked
          ? [...(img.likes || []), { _id: user._id }]
          : (img.likes || []).filter(l => (l._id || l) !== user._id)
        return { ...img, likes: updatedLikes, likeCount: res.data.likeCount }
      }))
    } catch { toast.error('Like action failed') }
  }

  const openLightbox  = (img) => setLightbox({ open: true, index: images.findIndex(i => i._id === img._id) })
  const closeLightbox = ()    => setLightbox({ open: false, index: 0 })
  const prevImage     = ()    => setLightbox(p => ({ ...p, index: Math.max(0, p.index - 1) }))
  const nextImage     = ()    => setLightbox(p => ({ ...p, index: Math.min(images.length - 1, p.index + 1) }))

  const canUpload = isAuthenticated && ['student', 'organizer', 'admin'].includes(user?.role)

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
                {pagination.total} photos shared by students &amp; organizers
              </p>
            </div>

            <div className="flex items-center gap-3">
              <form onSubmit={handleSearch} className="relative flex items-center">
                <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search photos…"
                  className="pl-9 pr-8 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 w-44 sm:w-60" />
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                {searchInput && (
                  <button type="button" onClick={clearSearch} className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>

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
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center mb-4">
              <ImageIcon className="w-8 h-8 text-sky-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
              {search ? `No photos found for "${search}"` : 'No photos yet'}
            </h3>
            <p className="text-sm text-slate-400 mt-1 max-w-xs">
              {canUpload ? 'Be the first to share a campus moment!' : 'Login to upload photos.'}
            </p>
            {search && <button onClick={clearSearch} className="mt-3 text-sm text-sky-500 hover:underline">Clear search</button>}
            {canUpload && !search && (
              <button onClick={() => setShowUpload(true)}
                className="mt-4 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold rounded-xl transition-colors">
                Upload Photo
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map(image => (
                <GalleryCard key={image._id} image={image} currentUser={user}
                  onDelete={handleDelete} onLike={handleLike} onOpen={openLightbox} />
              ))}
            </div>
            {pagination.page < pagination.pages && (
              <div className="flex justify-center mt-10">
                <button onClick={() => fetchImages(pagination.page + 1, search, true)} disabled={loadingMore}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-60">
                  {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                  Load More Photos
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUpload={handleNewImage} />}
      {lightbox.open && (
        <Lightbox images={images} currentIndex={lightbox.index}
          onClose={closeLightbox} onPrev={prevImage} onNext={nextImage} />
      )}
    </div>
  )
}

export default GalleryPage