import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  Menu,
  X,
  Calendar,
  User,
  LogOut,
  LayoutDashboard,
  Image as ImageIcon
} from 'lucide-react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
    setUserMenuOpen(false)
  }

  const getDashboardPath = () => {
    if (!user) return '/dashboard'
    return `/${user.role}`
  }

  const navLinks = [
    { name: 'Home',      path: '/'        },
    { name: 'Events',    path: '/events'  },
    { name: 'Gallery',   path: '/gallery' },
    ...(isAuthenticated ? [{ name: 'Dashboard', path: getDashboardPath() }] : []),
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="navbar-shell">
      <div className="nav-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="logo-badge">
                <Calendar className="h-5 w-5" />
              </div>
              <span className="logo-text">CampusSync</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={
                  'nav-pill ' +
                  (isActive(link.path) ? 'nav-pill-active' : 'nav-pill-idle')
                }
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="user-chip"
                >
                  <div className="user-avatar">
                    <span className="text-xs font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left leading-tight">
                    <p className="text-sm font-medium text-slate-100">{user.name}</p>
                    <p className="text-[11px] text-slate-400 capitalize">{user.role}</p>
                  </div>
                </button>

                {/* ── Desktop Dropdown ── */}
                {userMenuOpen && (
                  <div className="user-dropdown">
                    <Link
                      to={getDashboardPath()}
                      className="user-dropdown-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>

                    {/* ✅ GALLERY LINK — desktop dropdown */}
                    <Link
                      to="/gallery"
                      className="user-dropdown-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Gallery
                    </Link>

                    <Link
                      to="/profile"
                      className="user-dropdown-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="user-dropdown-item text-red-300 hover:text-red-200"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="nav-link-ghost">Sign In</Link>
                <Link to="/register" className="btn-nav-primary">Get Started</Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="mobile-menu-toggle"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Navigation Menu ── */}
        {isOpen && (
          <div className="md:hidden mt-2 space-y-2 pb-3">

            {/* Mobile Nav Links */}
            <div className="rounded-2xl bg-slate-900/70 border border-white/5 backdrop-blur-xl px-3 py-2 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={
                    'block rounded-xl px-3 py-2 text-sm font-medium ' +
                    (isActive(link.path)
                      ? 'bg-sky-500/20 text-sky-200'
                      : 'text-slate-200 hover:bg-slate-800/70')
                  }
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Mobile User Section */}
            <div className="rounded-2xl bg-slate-900/70 border border-white/5 backdrop-blur-xl px-3 py-3 space-y-2">
              {isAuthenticated ? (
                <>
                  {/* User Info Header */}
                  <div className="flex items-center px-2 pb-2 border-b border-white/5 mb-1">
                    <div className="user-avatar mr-3">
                      <span className="text-xs font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="leading-tight">
                      <p className="text-sm font-medium text-slate-100">{user.name}</p>
                      <p className="text-[11px] text-slate-400 capitalize">{user.role}</p>
                    </div>
                  </div>

                  {/* ✅ GALLERY LINK — mobile menu */}
                  <Link
                    to="/gallery"
                    className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800/70"
                    onClick={() => setIsOpen(false)}
                  >
                    Gallery
                  </Link>

                  <Link
                    to="/profile"
                    className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800/70"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left rounded-xl px-3 py-2 text-sm font-medium text-red-300 hover:bg-red-500/10"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800/70"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 bg-sky-400 hover:bg-sky-300"
                    onClick={() => setIsOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside overlay to close dropdown */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </nav>
  )
}

export default Navbar