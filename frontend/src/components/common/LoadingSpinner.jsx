import { Loader2 } from 'lucide-react'

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'blue', 
  text = '', 
  className = '',
  overlay = false 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const colorClasses = {
    blue: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-600',
    green: 'text-green-600',
    red: 'text-red-600'
  }

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    xl: 'text-xl'
  }

  const spinner = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 
        className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`}
      />
      {text && (
        <p className={`mt-2 ${textSizeClasses[size]} ${colorClasses[color]} font-medium`}>
          {text}
        </p>
      )}
    </div>
  )

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          {spinner}
        </div>
      </div>
    )
  }

  return spinner
}

// Inline spinner for buttons
export const ButtonSpinner = ({ size = 'small', className = '' }) => (
  <Loader2 className={`${size === 'small' ? 'w-4 h-4' : 'w-5 h-5'} animate-spin ${className}`} />
)

export default LoadingSpinner