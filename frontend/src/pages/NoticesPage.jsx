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
  urgent:   'bg-red-100 text-red-700 border-red-200',
  event:    'bg-blue-100 text-blue-700 border-blue-200',
  academic: 'bg-purple-100 text-purple-700 border-purple-200',
  general:  'bg-slate-100 text-slate-600 border-slate-200',
}

const PRIORITY_DOT = {
  high:   'bg-red-500',
  medium: 'bg-amber-400',
  low:    'bg-emerald-500',
}

const PRIORITY_BORDER = {
  high:   'border-l-red-500',
  medium: 'border-l-amber-400',
  low:    'border-l-emerald-500',
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-8 rounded-[28px] border border-white/60 bg-white/80 backdrop-blur-sm shadow-xl px-6 py-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                <BellRing className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Notices</h1>
                <p className="text-sm text-slate-500">Campus-wide announcements and updates</p>
              </div>
            </div>
            {canCreate && (
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition-all"
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
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold capitalize transition-all
                  ${filterCategory === cat
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}
              >
                {cat || 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Create / Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="w-full max-w-lg rounded-[28px] bg-white shadow-2xl p-7">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingNotice ? 'Edit Notice' : 'Post New Notice'}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                  <input
                    {...register('title', { required: 'Title is required' })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    placeholder="Notice headline..."
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Content *</label>
                  <textarea
                    {...register('content', { required: 'Content is required' })}
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
                    placeholder="Write the notice details..."
                  />
                  {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select
                      {...register('category')}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400"
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
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400"
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
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
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
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <BellRing className="h-14 w-14 mb-4 opacity-30" />
            <p className="text-lg font-medium">No notices yet</p>
            <p className="text-sm">Check back later for campus announcements</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notices.map((notice) => (
              <div
                key={notice._id}
                className={`rounded-[22px] border-l-4 bg-white/90 shadow-md border border-slate-100 transition-all hover:shadow-lg ${PRIORITY_BORDER[notice.priority]}`}
              >
                <div className="px-6 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${CATEGORY_STYLES[notice.category]}`}>
                          {notice.category}
                        </span>
                        <span className={`h-2 w-2 rounded-full ${PRIORITY_DOT[notice.priority]}`} title={`${notice.priority} priority`} />
                        <span className="text-xs text-slate-400 capitalize">{notice.priority} priority</span>
                      </div>

                      <h3 className="text-base font-semibold text-slate-900 leading-snug">
                        {notice.title}
                      </h3>

                      {expandedId === notice._id && (
                        <p className="mt-3 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                          {notice.content}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span>
                          Posted by <span className="font-medium text-slate-600 capitalize">{notice.createdBy?.name}</span>
                          {' '}({notice.createdBy?.role})
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(notice.createdAt), 'dd MMM yyyy')}
                        </span>
                        {notice.expiresAt && (
                          <>
                            <span>·</span>
                            <span className="text-amber-500 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
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
                            className="rounded-xl p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <PenLine className="h-4 w-4" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(notice._id)}
                              className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                      <button
                        onClick={() => setExpandedId(expandedId === notice._id ? null : notice._id)}
                        className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 transition-colors"
                      >
                        {expandedId === notice._id
                          ? <ChevronUp className="h-4 w-4" />
                          : <ChevronDown className="h-4 w-4" />}
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