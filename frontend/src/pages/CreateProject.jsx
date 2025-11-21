import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { projectAPI } from '../api/api'
import toast from 'react-hot-toast'
import Button from '../components/Button'
import Input from '../components/Input'
import Card from '../components/Card'
import { FiX, FiPlus, FiArrowLeft, FiZap } from 'react-icons/fi'

export default function CreateProject() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    document_type: 'docx',
    topic: '',
    color_theme: 'blue_purple',
  })
  const [numSections, setNumSections] = useState(5)
  const [sections, setSections] = useState([{ title: '', order: 0 }])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSectionChange = (index, value) => {
    const newSections = [...sections]
    newSections[index].title = value
    newSections[index].order = index
    setSections(newSections)
  }

  const addSection = () => {
    setSections([...sections, { title: '', order: sections.length }])
  }

  const removeSection = (index) => {
    if (sections.length > 1) {
      setSections(sections.filter((_, i) => i !== index))
    }
  }

  const generateOutline = async () => {
    if (!formData.topic) {
      toast.error('Please enter a topic first')
      return
    }

    setGenerating(true)
    try {
      const { data } = await projectAPI.generateOutline({
        topic: formData.topic,
        document_type: formData.document_type,
        num_sections: numSections,
      })
      setSections(data.sections.map((title, index) => ({ title, order: index })))
      toast.success('Outline generated successfully!')
    } catch (error) {
      toast.error('Failed to generate outline')
    } finally {
      setGenerating(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (sections.some((s) => !s.title.trim())) {
      toast.error('All sections must have a title')
      return
    }

    setLoading(true)
    try {
      const { data } = await projectAPI.create({
        ...formData,
        sections,
      })
      toast.success('Project created successfully!')
      navigate(`/project/${data.id}`)
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-orange-400 mb-6 transition-colors"
      >
        <FiArrowLeft className="mr-2" />
        Back to Dashboard
      </button>

      <Card className="p-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-red-500 dark:via-orange-500 dark:to-red-700 bg-clip-text text-transparent mb-6">Create New Project</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Project Title *"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="My Business Report"
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-orange-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Optional description..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Document Type *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, document_type: 'docx' })}
                className={`p-4 border-2 rounded-lg transition-all shadow-md hover:shadow-lg ${
                  formData.document_type === 'docx'
                    ? 'border-blue-500 dark:border-orange-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-orange-900/30 dark:to-red-900/30 ring-2 ring-blue-500 dark:ring-orange-500'
                    : 'border-purple-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-400 dark:hover:border-gray-600'
                }`}
              >
                <div className="text-lg font-bold text-gray-900 dark:text-white">Word Document</div>
                <div className="text-sm font-medium text-blue-600 dark:text-blue-400">.docx</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, document_type: 'pptx' })}
                className={`p-4 border-2 rounded-lg transition-all shadow-md hover:shadow-lg ${
                  formData.document_type === 'pptx'
                    ? 'border-purple-500 dark:border-orange-500 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-orange-900/30 dark:to-red-900/30 ring-2 ring-purple-500 dark:ring-orange-500'
                    : 'border-purple-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-400 dark:hover:border-gray-600'
                }`}
              >
                <div className="text-lg font-bold text-gray-900 dark:text-white">PowerPoint</div>
                <div className="text-sm font-medium text-purple-600 dark:text-purple-400">.pptx</div>
              </button>
            </div>
          </div>

          <Input
            label="Main Topic *"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            required
            placeholder="e.g., A market analysis of the EV industry in 2025"
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Number of {formData.document_type === 'docx' ? 'Sections' : 'Slides'} *
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={numSections}
              onChange={(e) => setNumSections(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-orange-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100"
              placeholder="5"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Choose how many {formData.document_type === 'docx' ? 'sections' : 'slides'} to generate (1-20)
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Presentation Color Theme
            </label>
            <select
              name="color_theme"
              value={formData.color_theme}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-orange-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100"
            >
              <option value="blue_purple">🌌 Deep Blue & Purple - Professional & Bold</option>
              <option value="green_teal">🌊 Ocean Teal & Emerald - Fresh & Modern</option>
              <option value="orange_red">🔥 Crimson & Orange - Energetic & Powerful</option>
              <option value="navy_gold">✨ Navy & Gold - Elegant & Luxurious</option>
              <option value="pink_purple">💎 Magenta & Purple - Creative & Vibrant</option>
              <option value="forest_sage">🌲 Forest & Sage - Natural & Calm</option>
              <option value="sunset">🌅 Sunset - Warm & Sophisticated</option>
              <option value="ocean">🌊 Ocean Blue - Deep & Trustworthy</option>
              <option value="slate">🏔️ Slate Gray - Modern & Minimal</option>
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Choose a professional color theme for your presentation slides
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                {formData.document_type === 'docx' ? 'Sections' : 'Slides'} *
              </label>
              <Button
                type="button"
                onClick={generateOutline}
                loading={generating}
                variant="outline"
                size="sm"
                className="animate-pulse hover:animate-none"
              >
                <FiZap className="mr-1" />
                AI Generate
              </Button>
            </div>

            <div className="space-y-3">
              {sections.map((section, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={section.title}
                    onChange={(e) => handleSectionChange(index, e.target.value)}
                    placeholder={`${formData.document_type === 'docx' ? 'Section' : 'Slide'} ${
                      index + 1
                    } title`}
                    required
                  />
                  {sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSection(index)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="button"
              onClick={addSection}
              variant="secondary"
              className="mt-3 w-full"
              size="sm"
            >
              <FiPlus className="mr-2" />
              Add {formData.document_type === 'docx' ? 'Section' : 'Slide'}
            </Button>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button type="submit" loading={loading} className="flex-1" size="lg">
              Create Project
            </Button>
            <Button
              type="button"
              onClick={() => navigate('/dashboard')}
              variant="secondary"
              size="lg"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
