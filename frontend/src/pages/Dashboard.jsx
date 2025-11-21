import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { projectAPI } from '../api/api'
import toast from 'react-hot-toast'
import Button from '../components/Button'
import Card from '../components/Card'
import { FiPlus, FiFileText, FiFile, FiTrash2, FiEdit } from 'react-icons/fi'

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const { data } = await projectAPI.getAll()
      setProjects(data)
    } catch (error) {
      toast.error('Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      await projectAPI.delete(id)
      toast.success('Project deleted')
      fetchProjects()
    } catch (error) {
      toast.error('Failed to delete project')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-200 dark:border-gray-700 border-t-purple-600 dark:border-t-orange-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FiFileText className="w-8 h-8 text-purple-600 dark:text-orange-500" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-red-500 dark:via-orange-500 dark:to-red-700 bg-clip-text text-transparent animate-gradient">
            My Projects
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Create and manage your documents with AI
          </p>
        </div>
        <Link to="/create">
          <Button size="lg" className="group">
            <FiPlus className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
            New Project
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20 dark:from-red-500/20 dark:via-orange-500/20 dark:to-red-700/20 blur-3xl"></div>
          <Card className="relative p-16 text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-300/30 to-blue-300/30 dark:from-orange-300/30 dark:to-red-300/30 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-300/30 to-purple-300/30 dark:from-red-300/30 dark:to-orange-300/30 rounded-full blur-3xl translate-y-32 -translate-x-32"></div>
            <div className="relative">
              <div className="p-6 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 dark:from-red-500 dark:via-orange-500 dark:to-red-700 rounded-3xl w-28 h-28 mx-auto mb-8 flex items-center justify-center animate-bounce shadow-2xl">
                <FiFileText className="w-14 h-14 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-red-500 dark:via-orange-500 dark:to-red-700 bg-clip-text text-transparent mb-3">No projects yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">Get started by creating your first AI-powered document</p>
              <Link to="/create">
                <Button size="lg">
                  <FiPlus className="mr-2" />
                  Create Your First Project
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <Card 
              key={project.id} 
              className="p-6 group relative overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-300/20 to-blue-300/20 dark:from-orange-300/20 dark:to-red-300/20 rounded-full blur-2xl translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-500"></div>
              
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ${
                      project.document_type === 'docx' 
                        ? 'bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700' 
                        : 'bg-gradient-to-br from-orange-400 to-orange-600 dark:from-orange-500 dark:to-orange-700'
                    }`}>
                      {project.document_type === 'docx' ? (
                        <FiFile className="w-6 h-6 text-white" />
                      ) : (
                        <FiFileText className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-orange-400 transition-colors">
                        {project.title}
                      </h3>
                      <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-full bg-purple-100 dark:bg-orange-900 text-purple-700 dark:text-orange-300 uppercase">
                        {project.document_type}
                      </span>
                    </div>
                  </div>
                </div>

                {project.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 italic">
                    {project.description}
                  </p>
                )}

                <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-3 mb-4 space-y-1.5">
                  <p className="text-sm line-clamp-1">
                    <span className="font-semibold text-purple-700 dark:text-orange-400">📝 Topic:</span> 
                    <span className="text-gray-700 dark:text-gray-300 ml-1">{project.topic}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-purple-700 dark:text-orange-400">📄 Sections:</span>
                    <span className="text-gray-700 dark:text-gray-300 ml-1">{project.sections.length}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    🕒 Updated: {formatDate(project.updated_at)}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => navigate(`/project/${project.id}`)}
                    className="flex-1"
                    size="sm"
                  >
                    <FiEdit className="mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(project.id)}
                    variant="danger"
                    size="sm"
                    className="px-4"
                  >
                    <FiTrash2 />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
