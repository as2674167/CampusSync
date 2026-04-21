import { useEffect, useMemo, useState } from 'react'
import { usersAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import {
  Search,
  Users,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react'

const emptyFilters = {
  search: '',
  role: '',
  department: '',
  isActive: '',
}

const badgeClass = {
  admin: 'border-violet-200 bg-violet-50 text-violet-700',
  organizer: 'border-blue-200 bg-blue-50 text-blue-700',
  student: 'border-emerald-200 bg-emerald-50 text-emerald-700',
}

const statusClass = {
  active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  inactive: 'border-rose-200 bg-rose-50 text-rose-700',
}

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    count: 0,
    totalUsers: 0,
  })
  const [filters, setFilters] = useState(emptyFilters)
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [selectedUser, setSelectedUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    role: 'student',
    department: '',
    phone: '',
    studentId: '',
    isActive: true,
  })

  useEffect(() => {
    fetchUsers(1, appliedFilters, true)
  }, [])

  const fetchUsers = async (page = 1, currentFilters = appliedFilters, showLoader = false) => {
    try {
      if (showLoader) setLoading(true)
      else setRefreshing(true)

      const params = {
        page,
        limit: 10,
      }

      if (currentFilters.search) params.search = currentFilters.search
      if (currentFilters.role) params.role = currentFilters.role
      if (currentFilters.department) params.department = currentFilters.department
      if (currentFilters.isActive !== '') params.isActive = currentFilters.isActive

      const response = await usersAPI.getUsers(params)

      setUsers(response.data?.users || [])
      setPagination(
        response.data?.pagination || {
          current: 1,
          total: 1,
          count: 0,
          totalUsers: 0,
        }
      )
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleApplyFilters = () => {
    setAppliedFilters(filters)
    fetchUsers(1, filters, true)
  }

  const handleResetFilters = () => {
    setFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
    fetchUsers(1, emptyFilters, true)
  }

  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.total) return
    fetchUsers(page, appliedFilters, false)
  }

  const handleRefresh = () => {
    fetchUsers(pagination.current || 1, appliedFilters, false)
  }

  const openModal = (user) => {
    setSelectedUser(user)
    setFormData({
      name: user.name || '',
      role: user.role || 'student',
      department: user.department || '',
      phone: user.phone || '',
      studentId: user.studentId || '',
      isActive: user.isActive ?? true,
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    if (isSaving || isDeleting) return
    setSelectedUser(null)
    setIsModalOpen(false)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!selectedUser) return

    try {
      setIsSaving(true)

      const payload = {
        name: formData.name,
        role: formData.role,
        department: formData.department,
        phone: formData.phone,
        studentId: formData.studentId,
        isActive: formData.isActive,
      }

      await usersAPI.updateUser(selectedUser._id, payload)
      toast.success('User updated successfully')
      closeModal()
      fetchUsers(pagination.current || 1, appliedFilters, false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeactivate = async () => {
    if (!selectedUser) return

    const confirmDelete = window.confirm(`Deactivate ${selectedUser.name}?`)
    if (!confirmDelete) return

    try {
      setIsDeleting(true)
      const response = await usersAPI.deleteUser(selectedUser._id)
      toast.success(response.data?.message || 'User deactivated successfully')
      closeModal()
      fetchUsers(pagination.current || 1, appliedFilters, false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to deactivate user')
    } finally {
      setIsDeleting(false)
    }
  }

  const stats = useMemo(() => {
    return {
      totalShown: users.length,
      active: users.filter((u) => u.isActive).length,
      organizers: users.filter((u) => u.role === 'organizer').length,
      students: users.filter((u) => u.role === 'student').length,
    }
  }, [users])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.10),_transparent_24%),linear-gradient(to_bottom,_#f8fbff,_#eef4ff,_#f6f9ff)]">
        <LoadingSpinner size="large" text="Loading users..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.10),_transparent_24%),linear-gradient(to_bottom,_#f8fbff,_#eef4ff,_#f6f9ff)] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 overflow-hidden rounded-[30px] border border-white/60 bg-white/80 backdrop-blur-sm shadow-[0_25px_80px_rgba(15,23,42,0.10)]">
          <div className="relative px-6 py-7 sm:px-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.12),_transparent_38%)]" />
            <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                  Admin Panel
                </span>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                  Manage Users
                </h1>
                <p className="mt-2 text-sm text-slate-600 md:text-base">
                  View, search, update roles, and deactivate accounts.
                </p>
              </div>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 hover:shadow-md disabled:opacity-60"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded-[26px] border border-blue-100 bg-white/90 px-6 py-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Shown Users</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{stats.totalShown}</p>
          </div>
          <div className="rounded-[26px] border border-emerald-100 bg-white/90 px-6 py-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Active</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{stats.active}</p>
          </div>
          <div className="rounded-[26px] border border-sky-100 bg-white/90 px-6 py-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Organizers</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{stats.organizers}</p>
          </div>
          <div className="rounded-[26px] border border-violet-100 bg-white/90 px-6 py-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Students</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{stats.students}</p>
          </div>
        </div>

        <div className="mb-8 overflow-hidden rounded-[30px] border border-white/60 bg-white/90 backdrop-blur-sm shadow-[0_25px_80px_rgba(15,23,42,0.12)]">
          <div className="border-b border-slate-200/70 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
            <h2 className="text-xl font-semibold text-slate-900">Filters</h2>
            <p className="mt-1 text-sm text-slate-500">
              Narrow the user list with search and status filters.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 px-6 py-6 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Search</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  placeholder="Name, email or student ID"
                  className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm outline-none transition-all duration-300 placeholder:text-slate-400 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Role</label>
              <select
                value={filters.role}
                onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all duration-300 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">All roles</option>
                <option value="admin">Admin</option>
                <option value="organizer">Organizer</option>
                <option value="student">Student</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Department</label>
              <input
                type="text"
                value={filters.department}
                onChange={(e) => setFilters((prev) => ({ ...prev, department: e.target.value }))}
                placeholder="Department"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all duration-300 placeholder:text-slate-400 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Status</label>
              <select
                value={filters.isActive}
                onChange={(e) => setFilters((prev) => ({ ...prev, isActive: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all duration-300 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">All users</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 px-6 pb-6">
            <button
              onClick={handleApplyFilters}
              className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Apply Filters
            </button>
            <button
              onClick={handleResetFilters}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-[30px] border border-white/60 bg-white/90 backdrop-blur-sm shadow-[0_25px_80px_rgba(15,23,42,0.12)]">
          <div className="border-b border-slate-200/70 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Users Directory</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Page {pagination.current} of {pagination.total} • {pagination.totalUsers} total users
                </p>
              </div>
            </div>
          </div>

          {users.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <Users className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-xl font-semibold text-slate-900">No users found</h3>
              <p className="mt-2 text-sm text-slate-500">Try changing filters and search.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">User</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Department</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Student ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50/70">
                        <td className="px-6 py-5">
                          <div>
                            <p className="font-semibold text-slate-900">{user.name}</p>
                            <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${badgeClass[user.role] || 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-700">{user.department || '—'}</td>
                        <td className="px-6 py-5 text-sm text-slate-700">{user.studentId || '—'}</td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${user.isActive ? statusClass.active : statusClass.inactive}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <button
                            onClick={() => openModal(user)}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-4 border-t border-slate-200/70 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Showing {pagination.count} users on this page
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePageChange(pagination.current - 1)}
                    disabled={pagination.current === 1}
                    className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm disabled:opacity-50"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Prev
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.current + 1)}
                    disabled={pagination.current === pagination.total}
                    className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-[30px] border border-white/60 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.26)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Edit User</h2>
                <p className="mt-1 text-sm text-slate-500">Update role, profile, and status.</p>
              </div>
              <button
                onClick={closeModal}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5 px-6 py-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                <input
                  type="text"
                  value={selectedUser.email}
                  disabled
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="student">Student</option>
                    <option value="organizer">Organizer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Student ID</label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800">Active account</p>
                  <p className="text-xs text-slate-500">Disable to restrict user access.</p>
                </div>
              </label>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={handleDeactivate}
                  disabled={isDeleting}
                  className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 disabled:opacity-60"
                >
                  {isDeleting ? 'Deactivating...' : 'Deactivate User'}
                </button>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers