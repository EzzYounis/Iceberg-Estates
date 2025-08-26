import { defineStore } from 'pinia'
import apiClient, { API_ENDPOINTS, apiHelpers } from '@/config/api'

export const useAuthStore = defineStore('auth', {
  // STATE - Data that the store manages
  state: () => ({
    // User authentication state
    user: null,           // Current user information
    token: null,          // JWT authentication token
    isAuthenticated: false, // Whether user is logged in
    
    // Loading states
    isLoading: false,     // General loading state
    isLoggingIn: false,   // Login in progress
    isRegistering: false, // Registration in progress
    
    // Error handling
    error: null           // Last error message
  }),
  
  // GETTERS - Computed properties based on state
  getters: {
    // Get user's full name
    userFullName: (state) => {
      if (state.user) {
        return `${state.user.firstName} ${state.user.lastName}`
      }
      return ''
    },
    
    // Check if user has specific role (for future expansion)
    isAgent: (state) => {
      return state.user && state.isAuthenticated
    },
    
    // Get user initials for avatar
    userInitials: (state) => {
      if (state.user) {
        const first = state.user.firstName?.[0] || ''
        const last = state.user.lastName?.[0] || ''
        return (first + last).toUpperCase()
      }
      return ''
    }
  },
  
  // ACTIONS - Functions that can modify the state
  actions: {
    // Initialize auth state from localStorage
    initializeAuth() {
      console.log('Initializing authentication state...')
      
      const token = localStorage.getItem('auth_token')
      const userData = localStorage.getItem('user_data')
      
      if (token && userData) {
        try {
          this.token = token
          this.user = JSON.parse(userData)
          this.isAuthenticated = true
          console.log('Authentication restored from localStorage')
        } catch (error) {
          console.error('Failed to restore auth state:', error)
          this.clearAuth()
        }
      } else {
        console.log('No stored authentication found')
      }
    },
    
    // Register a new user
    async register(userData) {
      this.isRegistering = true
      this.error = null
      
      try {
        console.log('Registering new user:', userData.email)
        
        const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phoneNumber
        })
        
        if (apiHelpers.isSuccess(response)) {
          const data = apiHelpers.extractData(response)
          
          // Store authentication data
          this.user = data.user
          this.token = data.token
          this.isAuthenticated = true
          
          // Persist to localStorage
          localStorage.setItem('auth_token', data.token)
          localStorage.setItem('user_data', JSON.stringify(data.user))
          
          console.log('Registration successful:', this.user.email)
          return { success: true, data }
        }
      } catch (error) {
        console.error('❌ Registration failed:', error)
        this.error = apiHelpers.handleApiError(error)
        throw error
      } finally {
        this.isRegistering = false
      }
    },
    
    // Login user
    async login(credentials) {
      this.isLoggingIn = true
      this.error = null
      
      try {
        console.log('Logging in user:', credentials.email)
        
        const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
          email: credentials.email,
          password: credentials.password
        })
        
        if (apiHelpers.isSuccess(response)) {
          const data = apiHelpers.extractData(response)
          
          // Store authentication data
          this.user = data.user
          this.token = data.token
          this.isAuthenticated = true
          
          // Persist to localStorage
          localStorage.setItem('auth_token', data.token)
          localStorage.setItem('user_data', JSON.stringify(data.user))
          
          console.log('Login successful:', this.user.email)
          return { success: true, data }
        }
      } catch (error) {
        console.error('Login failed:', error)
        this.error = apiHelpers.handleApiError(error)
        throw error
      } finally {
        this.isLoggingIn = false
      }
    },
    
    // Logout user
    logout() {
      console.log('Logging out user')
      this.clearAuth()
    },
    
    // Clear authentication state
    clearAuth() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      this.error = null
      
      // Clear localStorage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      
      console.log('🧹 Authentication state cleared')
    },
    
    // Get user profile (refresh user data)
    async fetchProfile() {
      if (!this.isAuthenticated) {
        throw new Error('User not authenticated')
      }
      
      this.isLoading = true
      
      try {
        console.log('👤 Fetching user profile...')
        
        const response = await apiClient.get(API_ENDPOINTS.AUTH.PROFILE)
        
        if (apiHelpers.isSuccess(response)) {
          const data = apiHelpers.extractData(response)
          
          // Update user data
          this.user = data.user
          localStorage.setItem('user_data', JSON.stringify(data.user))
          
          console.log('Profile updated')
          return data.user
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
        
        // If token is invalid, clear auth
        if (error.response?.status === 401) {
          this.clearAuth()
        }
        
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    // Clear error state
    clearError() {
      this.error = null
    }
  }
})