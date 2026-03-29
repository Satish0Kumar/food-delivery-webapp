import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login for ADMIN routes (not customer order placement)
    const url = error.config?.url || ''
    const isAdminRoute = url.includes('/auth') || url.includes('/items') || url.includes('/upload')
    if (error.response?.status === 401 && isAdminRoute) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
