// API configuration for connecting to our backend
import axios from 'axios'

// Base URL for our API
const BASE_URL = import.meta.env.VITE_API_URL;

// Create axios instance with default settings
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - runs before every API call
apiClient.interceptors.request.use(
  (config) => {
    // Add authentication token to every request if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    console.log('API Request:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor - runs after every API response
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data?.message)
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      
      // Only redirect if we're not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

// API endpoints - organized by feature
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    PROFILE: '/api/auth/profile'
  },
  
  // Appointments
  APPOINTMENTS: {
    BASE: '/api/appointments',
    BY_ID: (id) => `/api/appointments/${id}`,
    SCHEDULE: (date) => `/api/appointments/schedule/${date}`
  },
  // Agents
  AGENTS: {
    BASE: '/api/agents'
  }
  
 
}

// Helper functions for common API operations
export const apiHelpers = {
  // Handle API errors consistently
  handleApiError(error) {
    if (error.response?.data?.message) {
      return error.response.data.message
    } else if (error.message) {
      return error.message
    } else {
      return 'An unexpected error occurred'
    }
  },
  
  // Extract data from API response
  extractData(response) {
    return response.data?.data || response.data
  },
  
  // Check if response was successful
  isSuccess(response) {
    return response.data?.success === true || response.status < 300
  }
}

export default apiClient