import { useState, useEffect } from 'react'
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
  const [stats, setStats] = useState({
    totalEvents: 150,
    totalStudents: 2500,
    completedEvents: 120,
    upcomingEvents: 30
  })

  const features = [
    {
      icon: Calendar,
      title: 'Event Management',
      description: 'Create, manage, and organize college events with ease. From workshops to cultural festivals.'
    },
    {
      icon: Users,
      title: 'Community Engagement',
      description: 'Connect students, faculty, and organizers in one unified platform for better collaboration.'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Get instant notifications about event approvals, registrations, and important updates.'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Built with security in mind. Your data is protected with enterprise-grade security measures.'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Student Council President',
      content: 'EventHub has revolutionized how we organize campus events. The streamlined process saves us hours of work.',
      avatar: 'SJ'
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Faculty Coordinator',
      content: 'The approval system is fantastic. I can review and approve events quickly while maintaining quality control.',
      avatar: 'MC'
    },
    {
      name: 'Alex Rivera',
      role: 'Event Organizer',
      content: 'Managing registrations has never been easier. The analytics help me understand attendance patterns.',
      avatar: 'AR'
    }
  ]

  useEffect(() => {
    // Animate counters
    const animateValue = (obj, start, end, duration) => {
      let startTimestamp = null
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp
        const progress = Math.min((timestamp - startTimestamp) / duration, 1)
        obj.innerHTML = Math.floor(progress * (end - start) + start)
        if (progress < 1) {
          window.requestAnimationFrame(step)
        }
      }
      window.requestAnimationFrame(step)
    }

    // This would be used with actual DOM elements in a real implementation
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 animate-fadeInUp">
              Streamline Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                College Events
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              A comprehensive event management platform designed for colleges and universities. 
              Organize, manage, and participate in campus events effortlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="btn btn-primary text-lg px-8 py-4"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn btn-primary text-lg px-8 py-4"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/events"
                    className="btn btn-outline text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-blue-900"
                  >
                    Browse Events
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400 rounded-full opacity-10 animate-bounce-slow"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-purple-400 rounded-full opacity-10 animate-pulse-slow"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">
                {stats.totalEvents}+
              </div>
              <div className="text-gray-600">Total Events</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-2">
                {stats.totalStudents.toLocaleString()}+
              </div>
              <div className="text-gray-600">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-purple-600 mb-2">
                {stats.completedEvents}+
              </div>
              <div className="text-gray-600">Completed Events</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-orange-600 mb-2">
                {stats.upcomingEvents}+
              </div>
              <div className="text-gray-600">Upcoming Events</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose EventHub?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built specifically for educational institutions, our platform offers 
              everything you need to manage campus events successfully.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-6 text-center animate-fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to get started with event management
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Sign Up & Choose Role
              </h3>
              <p className="text-gray-600">
                Register as a student, organizer, or admin to access role-specific features
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Create or Browse Events
              </h3>
              <p className="text-gray-600">
                Organizers can create events, while students can browse and discover interesting activities
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Register & Participate
              </h3>
              <p className="text-gray-600">
                Easy registration process with real-time updates and event management tools
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Trusted by students, faculty, and administrators
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-6 animate-fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students and organizers who are already using EventHub 
            to create amazing campus experiences.
          </p>
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn btn-secondary text-lg px-8 py-4"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="btn btn-outline text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-blue-900"
              >
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