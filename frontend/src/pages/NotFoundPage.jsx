import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="btn btn-primary inline-flex items-center"
          >
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Link>

          <div className="text-center">
            <button
              onClick={() => window.history.back()}
              className="btn btn-outline inline-flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>

        <div className="mt-12">
          <p className="text-sm text-gray-500">
            If you believe this is an error, please{' '}
            <Link to="/contact" className="text-blue-600 hover:text-blue-700">
              contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage