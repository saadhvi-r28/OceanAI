export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ...props 
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105'
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 dark:from-red-500 dark:via-orange-500 dark:to-red-700 text-white hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 dark:hover:from-red-600 dark:hover:via-orange-600 dark:hover:to-red-800 focus:ring-purple-500 dark:focus:ring-orange-500',
    secondary: 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-gray-700 dark:to-gray-800 text-purple-700 dark:text-orange-300 hover:from-purple-200 hover:to-blue-200 dark:hover:from-gray-600 dark:hover:to-gray-700 focus:ring-purple-500 dark:focus:ring-orange-500',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 dark:from-red-700 dark:to-red-900 text-white hover:from-red-600 hover:to-red-700 dark:hover:from-red-800 dark:hover:to-black focus:ring-red-500',
    outline: 'border-2 border-purple-500 dark:border-orange-500 text-purple-600 dark:text-orange-400 hover:bg-purple-50 dark:hover:bg-gray-800 focus:ring-purple-500 dark:focus:ring-orange-500',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg',
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}
