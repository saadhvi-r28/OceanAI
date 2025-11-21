import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { projectAPI, sectionAPI, exportAPI } from '../api/api'
import toast from 'react-hot-toast'
import Button from '../components/Button'
import Card from '../components/Card'
import Modal from '../components/Modal'
import {
  FiArrowLeft,
  FiDownload,
  FiRefreshCw,
  FiThumbsUp,
  FiThumbsDown,
  FiMessageSquare,
  FiZap,
  FiEye,
} from 'react-icons/fi'

export default function ProjectEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generatingAll, setGeneratingAll] = useState(false)
  const [generatingSections, setGeneratingSections] = useState(new Set())
  const [activeSection, setActiveSection] = useState(null)
  const [refinementPrompt, setRefinementPrompt] = useState('')
  const [refinementModal, setRefinementModal] = useState(false)
  const [feedbackModal, setFeedbackModal] = useState(false)
  const [previewModal, setPreviewModal] = useState(false)
  const [comment, setComment] = useState('')
  const [selectedRefinement, setSelectedRefinement] = useState(null)
  const [sectionFeedback, setSectionFeedback] = useState({})
  const [selectedTheme, setSelectedTheme] = useState('')

  useEffect(() => {
    fetchProject()
  }, [id])

  useEffect(() => {
    if (project) {
      loadFeedback()
    }
  }, [project])

  const fetchProject = async () => {
    try {
      const { data } = await projectAPI.getById(id)
      setProject(data)
      setSelectedTheme(data.color_theme || 'blue_purple')
    } catch (error) {
      toast.error('Failed to fetch project')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const loadFeedback = async () => {
    const feedback = {}
    for (const section of project.sections) {
      try {
        const { data: refinements } = await sectionAPI.getRefinements(section.id)
        if (refinements.length > 0 && refinements[0].feedback) {
          feedback[section.id] = {
            type: refinements[0].feedback,
            comment: refinements[0].comment
          }
        }
      } catch (error) {
        // Silently ignore - section might not have refinements
      }
    }
    setSectionFeedback(feedback)
  }

  const generateAllSections = async () => {
    setGeneratingAll(true)
    const promises = project.sections.map((section) =>
      sectionAPI.generate(section.id).catch(() => null)
    )

    try {
      await Promise.all(promises)
      await fetchProject()
      toast.success('All content generated!')
    } catch (error) {
      toast.error('Some sections failed to generate')
    } finally {
      setGeneratingAll(false)
    }
  }

  const generateSection = async (sectionId) => {
    setGeneratingSections(prev => new Set(prev).add(sectionId))
    try {
      await sectionAPI.generate(sectionId)
      await fetchProject()
      toast.success('Content generated!')
    } catch (error) {
      toast.error('Failed to generate content')
    } finally {
      setGeneratingSections(prev => {
        const next = new Set(prev)
        next.delete(sectionId)
        return next
      })
    }
  }

  const openRefinementModal = (section) => {
    if (!section.content) {
      toast.error('Generate content first')
      return
    }
    setActiveSection(section)
    setRefinementPrompt('')
    setRefinementModal(true)
  }

  const handleRefine = async () => {
    if (!refinementPrompt.trim()) {
      toast.error('Please enter a refinement prompt')
      return
    }

    try {
      await sectionAPI.refine(activeSection.id, { prompt: refinementPrompt })
      await fetchProject()
      setRefinementModal(false)
      toast.success('Content refined!')
    } catch (error) {
      toast.error('Failed to refine content')
    }
  }

  const openFeedbackModal = (section) => {
    setActiveSection(section)
    setComment('')
    setFeedbackModal(true)
  }

  const handleFeedback = async (feedback) => {
    try {
      // Get the latest refinement for this section
      const { data: refinements } = await sectionAPI.getRefinements(activeSection.id)
      
      if (refinements.length > 0) {
        await sectionAPI.updateFeedback(refinements[0].id, {
          feedback,
          comment: comment || null,
        })
        // Update local feedback state
        setSectionFeedback({
          ...sectionFeedback,
          [activeSection.id]: {
            type: feedback,
            comment: comment || null
          }
        })
        toast.success('Feedback saved!')
        setFeedbackModal(false)
        setComment('')
      } else {
        toast.error('No content to provide feedback on. Please generate content first.')
        setFeedbackModal(false)
      }
    } catch (error) {
      console.error('Feedback error:', error)
      toast.error(error.response?.data?.detail || 'Failed to save feedback')
    }
  }

  const handlePreview = () => {
    setPreviewModal(true)
  }

  const handleExport = async () => {
    try {
      const response = await exportAPI.download(id)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      const extension = project.document_type === 'docx' ? 'docx' : 'pptx'
      link.setAttribute('download', `${project.title}.${extension}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Document exported!')
    } catch (error) {
      toast.error('Failed to export document')
    }
  }

  const updateSectionContent = async (sectionId, content) => {
    try {
      await sectionAPI.update(sectionId, { content })
      await fetchProject()
      toast.success('Section updated!')
    } catch (error) {
      toast.error('Failed to update section')
    }
  }

  const handleThemeChange = async (e) => {
    const newTheme = e.target.value
    setSelectedTheme(newTheme)
    try {
      await projectAPI.update(id, { color_theme: newTheme })
      toast.success('Theme updated!')
      await fetchProject()
    } catch (error) {
      toast.error('Failed to update theme')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          Back to Dashboard
        </button>
        <div className="flex space-x-3">
          <Button onClick={generateAllSections} loading={generatingAll} variant="outline">
            <FiZap className="mr-2" />
            Generate All
          </Button>
          <Button onClick={handlePreview} variant="secondary">
            <FiEye className="mr-2" />
            Preview
          </Button>
          <Button onClick={handleExport}>
            <FiDownload className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card className="p-8 mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-red-500 dark:to-orange-500 bg-clip-text text-transparent">{project.title}</h1>
        {project.description && (
          <p className="mt-2 text-gray-600 dark:text-gray-300">{project.description}</p>
        )}
        <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-red-900 dark:to-orange-900 text-blue-800 dark:text-orange-200 rounded-full font-medium">
            {project.document_type.toUpperCase()}
          </span>
          <span>{project.sections.length} {project.document_type === 'docx' ? 'sections' : 'slides'}</span>
        </div>
        {project.document_type === 'pptx' && (
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Presentation Theme
            </label>
            <select
              value={selectedTheme}
              onChange={handleThemeChange}
              className="w-full md:w-96 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-orange-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 text-sm"
            >
              <option value="blue_purple">🌌 Deep Blue & Purple</option>
              <option value="green_teal">🌊 Ocean Teal & Emerald</option>
              <option value="orange_red">🔥 Crimson & Orange</option>
              <option value="navy_gold">✨ Navy & Gold</option>
              <option value="pink_purple">💎 Magenta & Purple</option>
              <option value="forest_sage">🌲 Forest & Sage</option>
              <option value="sunset">🌅 Sunset</option>
              <option value="ocean">🌊 Ocean Blue</option>
              <option value="slate">🏔️ Slate Gray</option>
            </select>
          </div>
        )}
      </Card>

      <div className="space-y-6">
        {project.sections
          .sort((a, b) => a.order - b.order)
          .map((section, index) => (
            <Card key={section.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {index + 1}. {section.title}
                  </h2>
                  {sectionFeedback[section.id] && (
                    <div className="flex items-center space-x-1">
                      {sectionFeedback[section.id].type === 'like' ? (
                        <div className="flex items-center px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                          <FiThumbsUp className="w-3 h-3 mr-1" />
                          Liked
                        </div>
                      ) : (
                        <div className="flex items-center px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">
                          <FiThumbsDown className="w-3 h-3 mr-1" />
                          Disliked
                        </div>
                      )}
                      {sectionFeedback[section.id].comment && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                          "{sectionFeedback[section.id].comment}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  {!section.content ? (
                    <Button
                      onClick={() => generateSection(section.id)}
                      size="sm"
                      variant="outline"
                      disabled={generatingSections.has(section.id) || generatingAll}
                    >
                      {generatingSections.has(section.id) ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-1"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <FiZap className="mr-1" />
                          Generate
                        </>
                      )}
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => openRefinementModal(section)}
                        size="sm"
                        variant="outline"
                      >
                        <FiRefreshCw className="mr-1" />
                        Refine
                      </Button>
                      <Button
                        onClick={() => openFeedbackModal(section)}
                        size="sm"
                        variant="outline"
                      >
                        <FiMessageSquare className="mr-1" />
                        Feedback
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {generatingSections.has(section.id) ? (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-black p-8 rounded-lg border-2 border-dashed border-blue-300 dark:border-orange-700">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 dark:border-red-500"></div>
                      <div className="absolute top-0 left-0 animate-ping rounded-full h-16 w-16 border-4 border-purple-400 dark:border-orange-500 opacity-20"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-red-500 dark:to-orange-500 bg-clip-text text-transparent animate-pulse">
                        Generating AI Content...
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        This may take a few seconds
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-600 dark:bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-2 h-2 bg-purple-600 dark:bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-2 h-2 bg-pink-600 dark:bg-yellow-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                  </div>
                </div>
              ) : section.content ? (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <textarea
                    value={section.content}
                    onChange={(e) => {
                      const newSections = project.sections.map((s) =>
                        s.id === section.id ? { ...s, content: e.target.value } : s
                      )
                      setProject({ ...project, sections: newSections })
                    }}
                    onBlur={() => updateSectionContent(section.id, section.content)}
                    className="w-full min-h-[200px] p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Content will appear here..."
                  />
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg text-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600">
                  Click "Generate" to create content for this section
                </div>
              )}
            </Card>
          ))}
      </div>

      {/* Refinement Modal */}
      <Modal
        isOpen={refinementModal}
        onClose={() => setRefinementModal(false)}
        title="Refine Content"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What would you like to change?
            </label>
            <textarea
              value={refinementPrompt}
              onChange={(e) => setRefinementPrompt(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Make this more formal, Add more details about..., Convert to bullet points"
            />
          </div>
          <div className="flex space-x-3">
            <Button onClick={handleRefine} className="flex-1">
              Refine
            </Button>
            <Button
              onClick={() => setRefinementModal(false)}
              variant="secondary"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Feedback Modal */}
      <Modal
        isOpen={feedbackModal}
        onClose={() => setFeedbackModal(false)}
        title="Provide Feedback"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              How would you rate this content?
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => handleFeedback('like')}
                className="flex-1 flex items-center justify-center space-x-2 p-4 border-2 border-green-300 dark:border-green-700 hover:border-green-500 dark:hover:border-green-500 rounded-lg transition-colors bg-white dark:bg-gray-800"
              >
                <FiThumbsUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                <span className="font-medium text-gray-900 dark:text-white">Like</span>
              </button>
              <button
                onClick={() => handleFeedback('dislike')}
                className="flex-1 flex items-center justify-center space-x-2 p-4 border-2 border-red-300 dark:border-red-700 hover:border-red-500 dark:hover:border-red-500 rounded-lg transition-colors bg-white dark:bg-gray-800"
              >
                <FiThumbsDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                <span className="font-medium text-gray-900 dark:text-white">Dislike</span>
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Share your thoughts..."
            />
          </div>
          <Button
            onClick={() => setFeedbackModal(false)}
            variant="secondary"
            className="w-full"
          >
            Close
          </Button>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={previewModal}
        onClose={() => setPreviewModal(false)}
        title="Document Preview"
        maxWidth="sm:max-w-5xl"
      >
        <div className="space-y-6">
          {/* Title Slide */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-black rounded-lg p-8 border-2 border-blue-200 dark:border-orange-700 text-center">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-red-500 dark:to-orange-500 text-white rounded-full text-xs font-bold">
                {project.document_type.toUpperCase()}
              </span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-red-500 dark:to-orange-500 bg-clip-text text-transparent mb-4">
              {project.title}
            </h1>
            {project.description && (
              <p className="text-gray-600 dark:text-gray-300 text-lg">{project.description}</p>
            )}
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              {project.sections.length} {project.document_type === 'docx' ? 'Sections' : 'Slides'}
            </div>
          </div>

          {/* Content Preview */}
          <div className="max-h-[50vh] overflow-y-auto space-y-4 pr-2">
            {project.sections
              .sort((a, b) => a.order - b.order)
              .map((section, index) => (
                <div
                  key={section.id}
                  className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-orange-600 transition-colors"
                >
                  <div className="flex items-start space-x-3 mb-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-red-500 dark:to-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </span>
                    <h3 className="flex-1 text-lg font-bold text-gray-900 dark:text-white">
                      {section.title}
                    </h3>
                  </div>
                  {section.content ? (
                    <div className="ml-11 text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                      {section.content}
                    </div>
                  ) : (
                    <div className="ml-11 text-gray-400 dark:text-gray-500 italic text-sm">
                      [Content not yet generated]
                    </div>
                  )}
                </div>
              ))}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button onClick={handleExport} className="flex-1">
              <FiDownload className="mr-2" />
              Download
            </Button>
            <Button
              onClick={() => setPreviewModal(false)}
              variant="secondary"
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
