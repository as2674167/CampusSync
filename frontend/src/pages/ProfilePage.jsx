import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  User,
  Mail,
  Phone,
  Building,
  CreditCard,
  Lock,
  Save
} from 'lucide-react'
import { ButtonSpinner } from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [profileData, setProfileData] = useState({
    name: '',
    department: '',
    phone: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        department: user.department || '',
        phone: user.phone || ''
      })
    }
  }, [user])

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateProfile = () => {
    const newErrors = {}

    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (
      profileData.phone &&
      !/^[\+]?[1-9][\d\s\-\(\)]{8,}$/.test(profileData.phone)
    ) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePassword = () => {
    const newErrors = {}

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters'
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    if (!validateProfile()) return

    setIsUpdating(true)
    try {
      await updateProfile(profileData)
      toast.success('Profile updated')
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (!validatePassword()) return

    setIsUpdating(true)
    try {
      const result = await changePassword(passwordData)
      if (result.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        toast.success('Password changed')
      }
    } finally {
      setIsUpdating(false)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'password', label: 'Change Password', icon: Lock }
  ]

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(129,140,248,0.16),_transparent_35%),linear-gradient(to_bottom,_#f5f7ff,_#edf2ff,_#f8fafc)] py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Account Settings
          </h1>
          <p className="mt-2 text-slate-600">
            Manage your account information and security settings
          </p>
        </div>

        {/* Main card */}
        <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur">
          {/* Tabs */}
          <div className="border-b border-slate-100 bg-white/90">
            <nav className="flex gap-1 px-4 pt-3">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const active = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`mb-1 inline-flex items-center rounded-2xl px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-slate-900 text-white shadow-[0_10px_30px_rgba(15,23,42,0.45)]'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <h3 className="text-lg font-semibold text-slate-900">
                  Profile Information
                </h3>

                {/* Info cards */}
                <div className="grid gap-5 md:grid-cols-2">
                  {/* Avatar / Name card */}
                  <div className="group relative overflow-hidden rounded-[24px] border border-blue-100/80 bg-gradient-to-br from-blue-50 via-white to-violet-100/70 p-[1px] shadow-[0_18px_44px_rgba(59,130,246,0.16)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(79,70,229,0.22)]">
                    <div className="rounded-[23px] bg-white/90 px-5 py-5 backdrop-blur transition-colors duration-300 group-hover:bg-blue-50/70">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 text-white text-xl font-semibold shadow-[0_14px_30px_rgba(79,70,229,0.45)] transition-transform duration-300 group-hover:scale-105">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-500">
                            Profile
                          </p>
                          <p className="truncate text-lg font-semibold text-slate-900">
                            {user.name}
                          </p>
                          <p className="text-sm text-slate-500 capitalize">
                            {user.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email card */}
                  <div className="group relative overflow-hidden rounded-[24px] border border-violet-100/80 bg-gradient-to-br from-violet-50 via-white to-fuchsia-100/60 p-[1px] shadow-[0_18px_44px_rgba(139,92,246,0.14)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(139,92,246,0.22)]">
                    <div className="rounded-[23px] bg-white/90 px-5 py-5 backdrop-blur transition-colors duration-300 group-hover:bg-violet-50/65">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-600 shadow-[0_10px_24px_rgba(139,92,246,0.18)] transition-transform duration-300 group-hover:scale-105">
                          <Mail className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-500">
                            Email
                          </p>
                          <p className="truncate text-base font-semibold text-slate-900">
                            {user.email}
                          </p>
                          <p className="text-xs text-slate-500">
                            Primary account email
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Student ID card */}
                  {user.studentId && (
                    <div className="group relative overflow-hidden rounded-[24px] border border-slate-200 bg-gradient-to-br from-slate-100 via-white to-slate-200/80 p-[1px] shadow-[0_18px_44px_rgba(15,23,42,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.18)] md:col-span-1">
                      <div className="rounded-[23px] bg-white/92 px-5 py-5 backdrop-blur transition-colors duration-300 group-hover:bg-slate-50/90">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-700 text-white shadow-[0_10px_24px_rgba(15,23,42,0.24)] transition-transform duration-300 group-hover:scale-105">
                            <CreditCard className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                              Student ID
                            </p>
                            <p className="truncate text-base font-semibold text-slate-900">
                              {user.studentId}
                            </p>
                            <p className="text-xs text-slate-500">
                              Your registered student identifier
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile form */}
                <form onSubmit={handleProfileSubmit} className="mt-2 space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Name */}
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Full Name
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                          <User className="h-4 w-4" />
                        </span>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          className={`w-full rounded-xl border bg-slate-50/80 pl-10 pr-3 py-2.5 text-sm text-slate-900 shadow-inner shadow-slate-200/60 outline-none transition-all duration-200 hover:bg-white focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_1px_rgba(59,130,246,0.5)] ${
                            errors.name ? 'border-rose-300' : 'border-slate-200'
                          }`}
                          value={profileData.name}
                          onChange={handleProfileChange}
                          disabled={isUpdating}
                        />
                      </div>
                      {errors.name && (
                        <p className="mt-1 text-xs text-rose-600">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Department */}
                    <div>
                      <label
                        htmlFor="department"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Department
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                          <Building className="h-4 w-4" />
                        </span>
                        <input
                          type="text"
                          id="department"
                          name="department"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-3 py-2.5 text-sm text-slate-900 shadow-inner shadow-slate-200/60 outline-none transition-all duration-200 hover:bg-white focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_1px_rgba(59,130,246,0.5)]"
                          value={profileData.department}
                          onChange={handleProfileChange}
                          disabled={isUpdating}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Phone Number (optional)
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Phone className="h-4 w-4" />
                      </span>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className={`w-full rounded-xl border bg-slate-50/80 pl-10 pr-3 py-2.5 text-sm text-slate-900 shadow-inner shadow-slate-200/60 outline-none transition-all duration-200 hover:bg-white focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_1px_rgba(59,130,246,0.5)] ${
                          errors.phone ? 'border-rose-300' : 'border-slate-200'
                        }`}
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        disabled={isUpdating}
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-xs text-rose-600">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(79,70,229,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(79,70,229,0.55)] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isUpdating ? (
                        <>
                          <ButtonSpinner className="mr-2" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  Change Password
                </h3>

                <form
                  onSubmit={handlePasswordSubmit}
                  className="space-y-5 max-w-md"
                >
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      className={`w-full rounded-xl border bg-slate-50/80 px-3 py-2.5 text-sm text-slate-900 shadow-inner shadow-slate-200/60 outline-none transition-all duration-200 hover:bg-white focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_1px_rgba(59,130,246,0.5)] ${
                        errors.currentPassword
                          ? 'border-rose-300'
                          : 'border-slate-200'
                      }`}
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      disabled={isUpdating}
                    />
                    {errors.currentPassword && (
                      <p className="mt-1 text-xs text-rose-600">
                        {errors.currentPassword}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="newPassword"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      className={`w-full rounded-xl border bg-slate-50/80 px-3 py-2.5 text-sm text-slate-900 shadow-inner shadow-slate-200/60 outline-none transition-all duration-200 hover:bg-white focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_1px_rgba(59,130,246,0.5)] ${
                        errors.newPassword
                          ? 'border-rose-300'
                          : 'border-slate-200'
                      }`}
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      disabled={isUpdating}
                    />
                    {errors.newPassword && (
                      <p className="mt-1 text-xs text-rose-600">
                        {errors.newPassword}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className={`w-full rounded-xl border bg-slate-50/80 px-3 py-2.5 text-sm text-slate-900 shadow-inner shadow-slate-200/60 outline-none transition-all duration-200 hover:bg-white focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_1px_rgba(59,130,246,0.5)] ${
                        errors.confirmPassword
                          ? 'border-rose-300'
                          : 'border-slate-200'
                      }`}
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      disabled={isUpdating}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-xs text-rose-600">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(79,70,229,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(79,70,229,0.55)] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isUpdating ? (
                        <>
                          <ButtonSpinner className="mr-2" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Change Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage