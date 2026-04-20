import { Link } from 'react-router-dom'
import { Calendar, Mail, Phone, MapPin, Github, Twitter, Linkedin } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-blue-400" />
              <span className="font-bold text-xl">EventHub</span>
            </div>
            <p className="text-gray-400 text-sm">
              Streamlining college event management with modern technology. 
              Connect, organize, and participate in campus events effortlessly.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://github.com" 
                className="text-gray-400 hover:text-white transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com" 
                className="text-gray-400 hover:text-white transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                className="text-gray-400 hover:text-white transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/events" 
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Browse Events
                </Link>
              </li>
              <li>
                <Link 
                  to="/register" 
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Get Started
                </Link>
              </li>
              <li>
                <Link 
                  to="/login" 
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* For Users */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">For Users</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-400 text-sm">Students</span>
                <p className="text-gray-500 text-xs">Browse and register for events</p>
              </li>
              <li>
                <span className="text-gray-400 text-sm">Organizers</span>
                <p className="text-gray-500 text-xs">Create and manage events</p>
              </li>
              <li>
                <span className="text-gray-400 text-sm">Administrators</span>
                <p className="text-gray-500 text-xs">Oversee system operations</p>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-blue-400" />
                <span className="text-gray-400 text-sm">support@eventhub.edu</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-blue-400" />
                <span className="text-gray-400 text-sm">+91 __________</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span className="text-gray-400 text-sm">
                 Bharat Institute Of Technology<br />
                  Meerut, Uttar Pradesh, India
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} EventHub. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link 
                to="/privacy" 
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms" 
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
              >
                Terms of Service
              </Link>
              <Link 
                to="/support" 
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
              >
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer