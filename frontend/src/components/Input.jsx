import { forwardRef } from 'react'

const Input = forwardRef(({ 
  label, 
  error, 
  className = '',
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-orange-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${
          error ? 'border-red-500 dark:border-red-700' : 'border-purple-200 dark:border-gray-700'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
