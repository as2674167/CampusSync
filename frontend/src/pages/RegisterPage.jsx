import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Eye,
  EyeOff,
  Calendar,
  Mail,
  Lock,
  User,
  Phone,
  Building,
  CreditCard
} from 'lucide-react'
import { ButtonSpinner } from '../components/common/LoadingSpinner'

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    studentId: '',
    department: '',
    phone: '',
    adminKey: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const departments = [
    'Computer Science',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Business Administration',
    'Psychology',
    'Biology',
    'Chemistry',
    'Physics',
    'Mathematics',
    'English Literature',
    'History',
    'Other'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (formData.role === 'student' && !formData.studentId.trim()) {
      newErrors.studentId = 'Student ID is required for students'
    } else if (formData.studentId && formData.studentId.length < 5) {
      newErrors.studentId = 'Student ID must be at least 5 characters'
    }

    if (formData.role === 'admin' && !formData.adminKey.trim()) {
      newErrors.adminKey = 'Admin secret key is required'
    }

    if (!formData.department) {
      newErrors.department = 'Department is required'
    }

    if (formData.phone && !/^[\+]?[1-9][\d\s\-\(\)]{8,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      const { confirmPassword, ...registrationData } = formData

      if (registrationData.role !== 'student' || !registrationData.studentId?.trim()) {
        delete registrationData.studentId
      }
      if (!registrationData.phone?.trim()) {
        delete registrationData.phone
      }
      if (!registrationData.department?.trim()) {
        delete registrationData.department
      }

      const result = await register(registrationData)
      if (result.success) {
        navigate('/dashboard', { replace: true })
      }
    } catch (error) {
      console.error('Registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="register-page-shell min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center register-header-block animate-fadeInUp">
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/25 shadow-[0_18px_45px_rgba(15,23,42,0.7)]">
              <Calendar className="h-8 w-8 text-sky-200" />
            </div>
          </div>
          <h2 className="mt-4 text-3xl font-bold text-white tracking-tight">
            Join EventHub
          </h2>
          <p className="mt-2 text-sm text-sky-100">
            Create your account to get started
          </p>
        </div>

        <div className="register-card-main animate-fadeInUp">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <User className="h-5 w-5 text-slate-300" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  className={`register-input pl-10 ${errors.name ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Mail className="h-5 w-5 text-slate-300" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={`register-input pl-10 ${errors.email ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-200 mb-1">
                Role *
              </label>
              <select
                id="role"
                name="role"
                className="register-input"
                value={formData.role}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="student">Student</option>
                <option value="organizer">Event Organizer</option>
                <option value="admin">Admin</option>
              </select>
              <p className="mt-1 text-xs text-slate-300">
                Admin accounts require a secret key
              </p>
            </div>

            {formData.role === 'admin' && (
              <div>
                <label htmlFor="adminKey" className="block text-sm font-medium text-slate-200 mb-1">
                  Admin Secret Key *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Lock className="h-5 w-5 text-slate-300" />
                  </div>
                  <input
                    id="adminKey"
                    name="adminKey"
                    type="password"
                    className={`register-input pl-10 ${errors.adminKey ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="Enter admin secret key"
                    value={formData.adminKey}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                {errors.adminKey && (
                  <p className="mt-1 text-sm text-red-400">{errors.adminKey}</p>
                )}
              </div>
            )}

            {formData.role === 'student' && (
              <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-slate-200 mb-1">
                  Student ID *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <CreditCard className="h-5 w-5 text-slate-300" />
                  </div>
                  <input
                    id="studentId"
                    name="studentId"
                    type="text"
                    className={`register-input pl-10 ${errors.studentId ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="Enter your student ID"
                    value={formData.studentId}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                {errors.studentId && (
                  <p className="mt-1 text-sm text-red-400">{errors.studentId}</p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-slate-200 mb-1">
                Department *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Building className="h-5 w-5 text-slate-300" />
                </div>
                <select
                  id="department"
                  name="department"
                  className={`register-input pl-10 ${errors.department ? 'border-red-300 focus:ring-red-500' : ''}`}
                  value={formData.department}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="">Select your department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              {errors.department && (
                <p className="mt-1 text-sm text-red-400">{errors.department}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-200 mb-1">
                Phone Number (optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Phone className="h-5 w-5 text-slate-300" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className={`register-input pl-10 ${errors.phone ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-1">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Lock className="h-5 w-5 text-slate-300" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`register-input pl-10 pr-10 ${errors.password ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-300 hover:text-sky-200"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-200 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Lock className="h-5 w-5 text-slate-300" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`register-input pl-10 pr-10 ${errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-300 hover:text-sky-200"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 mt-1 rounded border-slate-400 bg-slate-900 text-sky-400 focus:ring-sky-500"
                disabled={isLoading}
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-slate-200">
                I agree to the{' '}
                <Link to="/terms" className="text-sky-300 hover:text-sky-200 font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-sky-300 hover:text-sky-200 font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full flex justify-center items-center"
            >
              {isLoading ? (
                <>
                  <ButtonSpinner className="mr-2" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-300">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-sky-300 hover:text-sky-200 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage