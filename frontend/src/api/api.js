import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if 401 and NOT already on login/register page
    if (error.response?.status === 401 && 
        !window.location.pathname.includes('/login') && 
        !window.location.pathname.includes('/register')) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
}

// Project endpoints
export const projectAPI = {
  create: (data) => api.post('/api/projects', data),
  getAll: () => api.get('/api/projects'),
  getById: (id) => api.get(`/api/projects/${id}`),
  update: (id, data) => api.put(`/api/projects/${id}`, data),
  delete: (id) => api.delete(`/api/projects/${id}`),
  generateOutline: (data) => api.post('/api/projects/generate-outline', data),
}

// Section endpoints
export const sectionAPI = {
  generate: (id) => api.post(`/api/sections/${id}/generate`),
  update: (id, data) => api.put(`/api/sections/${id}`, data),
  refine: (id, data) => api.post(`/api/sections/${id}/refine`, data),
  getRefinements: (id) => api.get(`/api/sections/${id}/refinements`),
  updateFeedback: (id, data) => api.patch(`/api/sections/refinements/${id}/feedback`, data),
}

// Export endpoint
export const exportAPI = {
  download: (id) => api.get(`/api/export/${id}`, { responseType: 'blob' }),
  preview: (id) => api.get(`/api/export/${id}?preview=true`, { responseType: 'blob' }),
}

export default api
