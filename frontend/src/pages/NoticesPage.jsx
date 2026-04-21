import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { noticesAPI } from '../services/api'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  BellRing, Plus, Trash2, PenLine, X, CheckCircle,
  AlertTriangle, Info, Calendar, ChevronDown, ChevronUp
} from 'lucide-react'
import { format } from 'date-fns'

const CATEGORY_STYLES = {
  urgent: 'bg-red-50 text-red-700 border-red-200',
  event: 'bg-blue-50 text-blue-700 border-blue-200',
  academic: 'bg-purple-50 text-purple-700 border-purple-200',
  general: 'bg-slate-100 text-slate-600 border-slate-200',
}

const PRIORITY_DOT = {
  high: 'bg-red-500',
  medium: 'bg-amber-400',
  low: 'bg-emerald-500',
}

const PRIORITY_BORDER = {
  high: 'border-l-red-500',
  medium: 'border-l-amber-400',
  low: 'border-l-emerald-500',
}

const NOTICE_CARD_STYLES = {
  urgent:
    'border-red-100 bg-gradient-to-br from-white via-red-50/70 to-rose-100/70 shadow-[0_18px_50px_rgba(239,68,68,0.10)] hover:border-red-300 hover:shadow-[0_30px_80px_rgba(239,68,68,0.20)]',
  event:
    'border-blue-100 bg-gradient-to-br from-white via-blue-50/70 to-sky-100/70 shadow-[0_18px_50px_rgba(37,99,235,0.10)] hover:border-blue-300 hover:shadow-[0_30px_80px_rgba(37,99,235,0.22)]',
  academic:
    'border-violet-100 bg-gradient-to-br from-white via-violet-50/70 to-purple-100/70 shadow-[0_18px_50px_rgba(139,92,246,0.10)] hover:border-violet-300 hover:shadow-[0_30px_80px_rgba(139,92,246,0.22)]',
  general:
    'border-slate-200 bg-gradient-to-br from-white via-slate-50/80 to-slate-100/80 shadow-[0_18px_50px_rgba(15,23,42,0.08)] hover:border-slate-300 hover:shadow-[0_28px_70px_rgba(15,23,42,0.14)]',
}

const NOTICE_OVERLAY_STYLES = {
  urgent: 'from-red-500/0 via-red-500/10 to-rose-500/0',
  event: 'from-blue-500/0 via-blue-500/10 to-cyan-500/0',
  academic: 'from-violet-500/0 via-violet-500/10 to-fuchsia-500/0',
  general: 'from-slate-500/0 via-slate-500/8 to-slate-500/0',
}

export default function NoticesPage() {
  const { user } = useAuth()
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingNotice, setEditingNotice] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [filterCategory, setFilterCategory] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canCreate = user?.role === 'admin' || user?.role === 'organizer'
  const isAdmin = user?.role === 'admin'

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

  useEffect(() => { fetchNotices() }, [filterCategory])

  const fetchNotices = async () => {
    try {
      setLoading(true)
      const params = filterCategory ? { category: filterCategory } : {}
      const res = await noticesAPI.getNotices(params)
      setNotices(res.data?.data || [])
    } catch {
      toast.error('Failed to load notices')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditingNotice(null)
    reset({ title: '', content: '', category: 'general', priority: 'medium', expiresAt: '' })
    setShowForm(true)
  }

  const openEdit = (notice) => {
    setEditingNotice(notice)
    setValue('title', notice.title)
    setValue('content', notice.content)
    setValue('category', notice.category)
    setValue('priority', notice.priority)
    setValue('expiresAt', notice.expiresAt ? notice.expiresAt.slice(0, 10) : '')
    setShowForm(true)
  }

  const onSubmit = async (data) => {
    try {
      setSubmitting(true)
      const payload = {
        ...data,
        expiresAt: data.expiresAt || null,
      }
      if (editingNotice) {
        await noticesAPI.updateNotice(editingNotice._id, payload)
        toast.success('Notice updated!')
      } else {
        await noticesAPI.createNotice(payload)
        toast.success('Notice posted!')
      }
      setShowForm(false)
      fetchNotices()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save notice')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return
    try {
      await noticesAPI.deleteNotice(id)
      toast.success('Notice deleted')
      fetchNotices()
    } catch {
      toast.error('Failed to delete notice')
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.10),_transparent_24%),linear-gradient(to_bottom,_#f8fbff,_#eef4ff,_#f6f9ff)] py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-8 rounded-[30px] border border-white/60 bg-white/90 backdrop-blur-sm shadow-[0_25px_80px_rgba(15,23,42,0.12)] overflow-hidden animate-fadeInUp">
          <div className="px-6 py-6 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 shadow-md ring-1 ring-blue-100">
                  <BellRing className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Notices
                  </h1>
                  <p className="mt-1 text-sm text-slate-600">
                    Campus-wide announcements and updates
                  </p>
                </div>
              </div>

              {canCreate && (
                <button
                  onClick={openCreate}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(79,70,229,0.30)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_28px_60px_rgba(79,70,229,0.38)]"
                >
                  <Plus className="h-4 w-4" /> Post Notice
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="mt-5 flex flex-wrap gap-2">
              {['', 'general', 'event', 'academic', 'urgent'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-semibold capitalize transition-all duration-200
                    ${
                      filterCategory === cat
                        ? 'bg-blue-600 text-white border-blue-600 shadow-[0_10px_25px_rgba(37,99,235,0.20)]'
                        : 'bg-white text-slate-600 border-slate-200 hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50/70 hover:shadow-sm'
                    }`}
                >
                  {cat || 'All'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Create / Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
            <div className="w-full max-w-lg rounded-[28px] border border-white/80 bg-white p-7 shadow-[0_25px_80px_rgba(15,23,42,0.20)]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600/80 mb-1">
                    {editingNotice ? 'Edit notice' : 'Create notice'}
                  </p>
                  <h2 className="text-xl font-bold text-slate-900">
                    {editingNotice ? 'Update Notice' : 'Post New Notice'}
                  </h2>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                  <input
                    {...register('title', { required: 'Title is required' })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    placeholder="Notice headline..."
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Content *</label>
                  <textarea
                    {...register('content', { required: 'Content is required' })}
                    rows={4}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 resize-none"
                    placeholder="Write the notice details..."
                  />
                  {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select
                      {...register('category')}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="general">General</option>
                      <option value="event">Event</option>
                      <option value="academic">Academic</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                    <select
                      {...register('priority')}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Expires On <span className="text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="date"
                    {...register('expiresAt')}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(79,70,229,0.25)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_28px_60px_rgba(79,70,229,0.34)] disabled:opacity-60"
                  >
                    {submitting ? 'Saving...' : editingNotice ? 'Update' : 'Post Notice'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Notices List */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          </div>
        ) : notices.length === 0 ? (
          <div className="rounded-[30px] border border-white/60 bg-white/90 backdrop-blur-sm shadow-[0_25px_80px_rgba(15,23,42,0.12)] overflow-hidden animate-fadeInUp">
            <div className="py-16 text-center bg-gradient-to-br from-white via-slate-50 to-blue-50/50">
              <BellRing className="mx-auto h-14 w-14 text-slate-300 mb-4" />
              <p className="text-lg font-semibold text-slate-900">No notices yet</p>
              <p className="text-sm text-slate-500 mt-1">Check back later for campus announcements</p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {notices.map((notice) => (
              <div
                key={notice._id}
                className={`group relative overflow-hidden rounded-[28px] border-l-4 ${PRIORITY_BORDER[notice.priority]} border transition-all duration-300 hover:-translate-y-2 hover:scale-[1.01] ${NOTICE_CARD_STYLES[notice.category] || NOTICE_CARD_STYLES.general}`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${NOTICE_OVERLAY_STYLES[notice.category] || NOTICE_OVERLAY_STYLES.general} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                />
                <div className="relative px-6 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize shadow-sm ${CATEGORY_STYLES[notice.category]}`}>
                          {notice.category}
                        </span>
                        <span className={`h-2.5 w-2.5 rounded-full shadow-sm ${PRIORITY_DOT[notice.priority]}`} title={`${notice.priority} priority`} />
                        <span className="text-xs text-slate-500 capitalize font-medium">
                          {notice.priority} priority
                        </span>
                      </div>

                      <h3 className="text-lg font-bold tracking-tight text-slate-900 leading-snug transition-colors duration-200 group-hover:text-blue-700">
                        {notice.title}
                      </h3>

                      {expandedId === notice._id && (
                        <p className="mt-3 text-sm text-slate-600 leading-7 whitespace-pre-wrap">
                          {notice.content}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>
                          Posted by <span className="font-semibold text-slate-700 capitalize">{notice.createdBy?.name}</span>{' '}
                          ({notice.createdBy?.role})
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-blue-500" />
                          {format(new Date(notice.createdAt), 'dd MMM yyyy')}
                        </span>
                        {notice.expiresAt && (
                          <>
                            <span>·</span>
                            <span className="text-amber-600 flex items-center gap-1 font-semibold">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              Expires {format(new Date(notice.expiresAt), 'dd MMM yyyy')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {canCreate && (notice.createdBy?._id === user?._id || isAdmin) && (
                        <>
                          <button
                            onClick={() => openEdit(notice)}
                            className="rounded-2xl bg-white/80 p-2.5 text-slate-500 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-600"
                            title="Edit"
                          >
                            <PenLine className="h-4.5 w-4.5" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(notice._id)}
                              className="rounded-2xl bg-white/80 p-2.5 text-slate-500 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-50 hover:text-red-500"
                              title="Delete"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          )}
                        </>
                      )}
                      <button
                        onClick={() => setExpandedId(expandedId === notice._id ? null : notice._id)}
                        className="rounded-2xl bg-white/80 p-2.5 text-slate-500 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 hover:text-slate-700"
                      >
                        {expandedId === notice._id
                          ? <ChevronUp className="h-4.5 w-4.5" />
                          : <ChevronDown className="h-4.5 w-4.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}