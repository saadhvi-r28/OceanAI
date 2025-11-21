export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl border-2 border-purple-200 dark:border-red-900/50 hover:shadow-2xl hover:border-purple-300 dark:hover:border-orange-700 transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
