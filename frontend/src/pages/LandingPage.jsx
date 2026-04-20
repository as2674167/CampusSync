import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Calendar,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Globe
} from 'lucide-react'

const LandingPage = () => {
  const { isAuthenticated } = useAuth()
  const [stats] = useState({
    totalEvents: 150,
    totalStudents: 2500,
    completedEvents: 120,
    upcomingEvents: 30
  })

  const features = [
    {
      icon: Calendar,
      title: 'Event Management',
      description:
        'Create, manage, and organize college events without juggling spreadsheets and scattered approvals.'
    },
    {
      icon: Users,
      title: 'Community Engagement',
      description:
        'Bring students, faculty, clubs, and organizers into one platform with better visibility and coordination.'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description:
        'Keep everyone informed with instant notifications for approvals, registrations, and schedule changes.'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description:
        'Protect workflows and user data with a system built for trust, control, and consistency.'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Student Council President',
      content:
        'CampusSync made our event planning smoother. Registrations, approvals, and promotion all live in one place.',
      avatar: 'SJ'
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Faculty Coordinator',
      content:
        'The approval flow is simple and transparent. I can review requests quickly without losing control.',
      avatar: 'MC'
    },
    {
      name: 'Alex Rivera',
      role: 'Event Organizer',
      content:
        'Managing registrations and understanding attendance patterns has never been this easy.',
      avatar: 'AR'
    }
  ]

  return (
    <div className="min-h-screen bg-page">
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-section">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-24 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: text */}
            <div className="space-y-6 animate-fadeInUp">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-xs font-medium text-sky-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Campus event operating system
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-50">
                Make campus events
                <span className="block bg-gradient-to-r from-sky-300 via-cyan-200 to-violet-300 bg-clip-text text-transparent">
                  feel organized and alive
                </span>
              </h1>

              <p className="text-lg lg:text-xl text-slate-300 max-w-xl">
                CampusSync helps colleges manage approvals, registrations, communication, and participation in one beautiful, coordinated experience.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn-hero-primary">
                    Go to Dashboard
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn-hero-primary">
                      Get Started
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                    <Link to="/events" className="btn-hero-secondary">
                      Browse Events
                    </Link>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-slate-300 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>Role-based access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>Faster approvals</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>Better participation tracking</span>
                </div>
              </div>
            </div>

            {/* Right: stats / mini dashboard style card */}
            <div className="relative animate-fadeInUp" style={{ animationDelay: '0.15s' }}>
              <div className="hero-card glass-strong p-5 sm:p-6 lg:p-7">
                <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                      Live overview
                    </p>
                    <p className="mt-1 text-sm text-slate-200">
                      A snapshot of your campus events
                    </p>
                  </div>
                  <div className="hero-mini-logo">
                    <Globe className="h-5 w-5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-soft p-4 rounded-2xl">
                    <p className="metric-value">{stats.totalEvents}+</p>
                    <p className="metric-label">Events created</p>
                  </div>
                  <div className="glass-soft p-4 rounded-2xl">
                    <p className="metric-value">
                      {stats.totalStudents.toLocaleString()}+
                    </p>
                    <p className="metric-label">Active students</p>
                  </div>
                  <div className="glass-soft p-4 rounded-2xl">
                    <p className="metric-value">{stats.completedEvents}+</p>
                    <p className="metric-label">Completed events</p>
                  </div>
                  <div className="glass-soft p-4 rounded-2xl">
                    <p className="metric-value">{stats.upcomingEvents}+</p>
                    <p className="metric-label">Upcoming programs</p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-sky-400/20 bg-gradient-to-r from-sky-500/10 via-cyan-500/5 to-violet-500/10 px-5 py-4 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-[0.2em] text-sky-300 mb-1">
                      Campus workflow
                    </p>
                    <p className="text-sm text-slate-100">
                      From idea to approval to attendance – in one coordinated system.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-surface-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[
              { label: 'Total Events', value: `${stats.totalEvents}+` },
              { label: 'Active Students', value: `${stats.totalStudents.toLocaleString()}+` },
              { label: 'Completed Events', value: `${stats.completedEvents}+` },
              { label: 'Upcoming Events', value: `${stats.upcomingEvents}+` }
            ].map((item, idx) => (
              <div key={idx} className="glass-soft p-5 rounded-2xl text-left">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-1">
                  {item.label}
                </p>
                <p className="text-2xl lg:text-3xl font-semibold text-slate-50">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-surface-deep">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="badge-soft">Why CampusSync</span>
            <h2 className="section-title mt-4">
              Built for modern campus operations
            </h2>
            <p className="section-subtitle">
              Instead of a generic portal, give your institution an organized way to plan, approve, and host events with complete visibility.
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="glass-card p-6 flex flex-col h-full">
                <div className="feature-icon">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-50 mt-4 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-300 flex-1">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-surface-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="badge-soft">How it works</span>
            <h2 className="section-title mt-4">
              Simple flow, better coordination
            </h2>
            <p className="section-subtitle">
              Keep the process clear for students, organizers, and faculty from the first click to the last feedback.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                title: 'Sign up & choose your role',
                description:
                  'Students, organizers, and admins get dedicated spaces and tools tailored to their responsibilities.'
              },
              {
                step: 2,
                title: 'Create or discover events',
                description:
                  'Organizers publish events while students browse experiences that match their interests.'
              },
              {
                step: 3,
                title: 'Register, join, and track',
                description:
                  'Participants register quickly, receive updates, and organizers track what works best.'
              }
            ].map((item) => (
              <div key={item.step} className="glass-card p-7 flex flex-col gap-3">
                <div className="step-circle">
                  <span>{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-50">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-300">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-surface-deep">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="badge-soft">What teams say</span>
            <h2 className="section-title mt-4">
              Trusted around the campus
            </h2>
            <p className="section-subtitle">
              Students, organizers, and faculty use CampusSync to keep their events visible, organized, and smooth.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="glass-card p-6 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <div className="testimonial-avatar">
                    <span>{testimonial.avatar}</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-semibold text-slate-50">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-200 italic flex-1">
                  “{testimonial.content}”
                </p>
                <div className="flex mt-4 gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-cta-gradient">
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <span className="badge-soft badge-soft-light">Start now</span>
          <h2 className="mt-5 text-3xl lg:text-5xl font-bold tracking-tight text-slate-50">
            Ready to launch better campus events?
          </h2>
          <p className="mt-4 text-lg text-sky-100 max-w-2xl mx-auto">
            Bring planning, approvals, registrations, and participation into one elegant platform designed for your college.
          </p>

          {!isAuthenticated && (
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-cta-primary">
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/login" className="btn-cta-secondary">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default LandingPage