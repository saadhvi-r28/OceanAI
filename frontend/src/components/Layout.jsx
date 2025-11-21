import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { FiLogOut, FiFileText, FiMoon, FiSun } from 'react-icons/fi'
import { useDarkMode } from '../hooks/useDarkMode'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [darkMode, setDarkMode] = useDarkMode()

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white dark:from-gray-900 dark:via-black dark:to-red-950 transition-colors duration-300">
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-lg border-b border-purple-200 dark:border-red-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-2 group">
                <div className="p-2 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 dark:from-red-500 dark:via-orange-500 dark:to-red-700 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
                  <FiFileText className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-red-500 dark:via-orange-500 dark:to-red-700 bg-clip-text text-transparent">
                  AI Doc Generator
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Hello, <span className="font-semibold text-purple-600 dark:text-orange-500">{user?.username}</span>
              </span>
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-red-900/50 rounded-lg transition-all"
              >
                {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-4 py-2 text-sm text-white bg-gradient-to-r from-blue-500 to-purple-600 dark:from-red-500 dark:to-orange-600 hover:from-blue-600 hover:to-purple-700 dark:hover:from-red-600 dark:hover:to-orange-700 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
