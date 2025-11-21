import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../api/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import Button from '../components/Button'
import Input from '../components/Input'
import Card from '../components/Card'
import { FiFileText, FiMoon, FiSun } from 'react-icons/fi'
import { useDarkMode } from '../hooks/useDarkMode'

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useDarkMode()
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: tokenData } = await authAPI.login(formData)
      localStorage.setItem('token', tokenData.access_token)
      
      const { data: userData } = await authAPI.getMe()
      setAuth(tokenData.access_token, userData)
      
      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = error.response?.data?.detail || 'Login failed. Please check your credentials.'
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-white dark:from-gray-900 dark:via-black dark:to-red-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300/30 dark:bg-orange-300/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300/30 dark:bg-red-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <button
        onClick={toggleDarkMode}
        className="fixed top-6 right-6 p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-red-900/50 rounded-full shadow-2xl hover:shadow-purple-500/50 dark:hover:shadow-orange-500/50 transition-all z-50 group"
      >
        {darkMode ? <FiSun className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" /> : <FiMoon className="w-6 h-6 group-hover:-rotate-12 transition-transform duration-500" />}
      </button>
      
      <Card className="max-w-md w-full p-8 relative z-10 animate-fadeIn">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 dark:from-red-500 dark:via-orange-500 dark:to-red-700 rounded-2xl shadow-2xl transform hover:scale-110 hover:rotate-6 transition-all duration-300 animate-bounce" style={{ animationDuration: '2s' }}>
              <FiFileText className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-red-500 dark:via-orange-500 dark:to-red-700 bg-clip-text text-transparent animate-gradient">AI Doc Generator</h2>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 font-medium">✨ Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
          />

          <Button
            type="submit"
            loading={loading}
            className="w-full"
            size="lg"
          >
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  )
}
