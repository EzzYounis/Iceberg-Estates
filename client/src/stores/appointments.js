import { defineStore } from 'pinia'
import apiClient, { API_ENDPOINTS, apiHelpers } from '@/config/api'
import { format, parseISO, startOfDay, endOfDay } from 'date-fns'

export const useAppointmentsStore = defineStore('appointments', {
  // STATE - Data that the store manages
  state: () => ({
    // Appointments data
    appointments: [],           // List of all appointments
    currentAppointment: null,   // Currently selected appointment
    daySchedule: null,          // Schedule for a specific day
    
    // Filtering and pagination
    filters: {
      status: '',               // Filter by status
      startDate: '',            // Date range start
      endDate: '',              // Date range end
      searchQuery: ''           // Search in customer names/addresses
    },
    pagination: {
      total: 0,
      limit: 50,
      offset: 0,
      hasMore: false
    },
    
    // Loading states
    isLoading: false,           // General loading
    isCreating: false,          // Creating appointment
    isUpdating: false,          // Updating appointment
    isDeleting: false,          // Deleting appointment
    isFetchingSchedule: false,  // Loading day schedule
    
    // Error handling
    error: null,                // Last error message
    validationErrors: []        // Form validation errors
  }),
  
  // GETTERS - Computed properties
  getters: {
    // Get appointments for today
    todayAppointments: (state) => {
      const today = format(new Date(), 'yyyy-MM-dd')
      return state.appointments.filter(apt => apt.appointmentDate === today)
    },
    
    // Get upcoming appointments (next 7 days)
    upcomingAppointments: (state) => {
      const today = new Date()
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      return state.appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate)
        return aptDate >= today && aptDate <= nextWeek && apt.status === 'scheduled'
      })
    },
    
    // Get appointments by status
    appointmentsByStatus: (state) => {
      return (status) => state.appointments.filter(apt => apt.status === status)
    },
    
    // Get filtered appointments
    filteredAppointments: (state) => {
      let filtered = [...state.appointments]
      
      // Filter by status
      if (state.filters.status) {
        filtered = filtered.filter(apt => apt.status === state.filters.status)
      }
      
      // Filter by date range
      if (state.filters.startDate) {
        filtered = filtered.filter(apt => apt.appointmentDate >= state.filters.startDate)
      }
      if (state.filters.endDate) {
        filtered = filtered.filter(apt => apt.appointmentDate <= state.filters.endDate)
      }
      
      // Filter by search query
      if (state.filters.searchQuery) {
        const query = state.filters.searchQuery.toLowerCase()
        filtered = filtered.filter(apt => 
          apt.customerName.toLowerCase().includes(query) ||
          apt.propertyAddress.toLowerCase().includes(query) ||
          apt.propertyPostcode.toLowerCase().includes(query)
        )
      }
      
      return filtered
    },
    
    // Get appointment statistics
    appointmentStats: (state) => {
      const total = state.appointments.length
      const scheduled = state.appointments.filter(apt => apt.status === 'scheduled').length
      const completed = state.appointments.filter(apt => apt.status === 'completed').length
      const cancelled = state.appointments.filter(apt => apt.status === 'cancelled').length
      const unassigned = state.appointments.filter(apt => apt.status === 'unassigned').length
      
      return {
        total,
        scheduled,
        completed,
        cancelled,
        unassigned,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      }
    }
  },
  
  // ACTIONS - Functions to modify state
  actions: {
    // Fetch all appointments
    async fetchAppointments(options = {}) {
      this.isLoading = true
      this.error = null
      
      try {
        console.log('Fetching appointments...')
        
        // Build query parameters
        const params = {
          limit: options.limit || this.pagination.limit,
          offset: options.offset || this.pagination.offset
        }
        
        // Add filters if present
        if (this.filters.status) params.status = this.filters.status
        if (this.filters.startDate) params.startDate = this.filters.startDate
        if (this.filters.endDate) params.endDate = this.filters.endDate
        
        const response = await apiClient.get(API_ENDPOINTS.APPOINTMENTS.BASE, { params })
        
        if (apiHelpers.isSuccess(response)) {
          const data = apiHelpers.extractData(response)
          
          // Update state
          if (options.append) {
            this.appointments.push(...data.appointments)
          } else {
            this.appointments = data.appointments
          }
          
          this.pagination = data.pagination
          
          console.log(`Fetched ${data.appointments.length} appointments`)
          return data
        }
      } catch (error) {
        console.error('Failed to fetch appointments:', error)
        this.error = apiHelpers.handleApiError(error)
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    // Fetch a specific appointment
    async fetchAppointment(id) {
      this.isLoading = true
      this.error = null
      
      try {
        console.log('Fetching appointment:', id)
        
        const response = await apiClient.get(API_ENDPOINTS.APPOINTMENTS.BY_ID(id))
        
        if (apiHelpers.isSuccess(response)) {
          const data = apiHelpers.extractData(response)
          this.currentAppointment = data.appointment
          
          console.log('Appointment fetched:', data.appointment.customerName)
          return data.appointment
        }
      } catch (error) {
        console.error('Failed to fetch appointment:', error)
        this.error = apiHelpers.handleApiError(error)
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    // Create new appointment
    async createAppointment(appointmentData) {
      this.isCreating = true
      this.error = null
      this.validationErrors = []
      
      try {
        console.log('Creating appointment for:', appointmentData.customerName)
        
        const response = await apiClient.post(API_ENDPOINTS.APPOINTMENTS.BASE, appointmentData)
        
        if (apiHelpers.isSuccess(response)) {
          const data = apiHelpers.extractData(response)
          
          // Add to appointments list
          this.appointments.unshift(data.appointment)
          
          console.log('Appointment created successfully')
          return data.appointment
        }
      } catch (error) {
        console.error('Failed to create appointment:', error)
        this.error = apiHelpers.handleApiError(error)
        
        // Handle validation errors
        if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
          this.validationErrors = error.response.data.details
        }
        
        throw error
      } finally {
        this.isCreating = false
      }
    },
    
    // Update existing appointment
    async updateAppointment(id, appointmentData) {
      this.isUpdating = true
      this.error = null
      this.validationErrors = []
      
      try {
        console.log('Updating appointment:', id)
        
        const response = await apiClient.put(API_ENDPOINTS.APPOINTMENTS.BY_ID(id), appointmentData)
        
        if (apiHelpers.isSuccess(response)) {
          const data = apiHelpers.extractData(response)
          
          // Update in appointments list
          const index = this.appointments.findIndex(apt => apt.id === id)
          if (index !== -1) {
            this.appointments[index] = data.appointment
          }
          
          // Update current appointment if it's the same one
          if (this.currentAppointment?.id === id) {
            this.currentAppointment = data.appointment
          }
          
          console.log('Appointment updated successfully')
          return data.appointment
        }
      } catch (error) {
        console.error('Failed to update appointment:', error)
        this.error = apiHelpers.handleApiError(error)
        
        if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
          this.validationErrors = error.response.data.details
        }
        
        throw error
      } finally {
        this.isUpdating = false
      }
    },
    
    // Delete appointment
    async deleteAppointment(id) {
      this.isDeleting = true
      this.error = null
      
      try {
        console.log('Deleting appointment:', id)
        
        const response = await apiClient.delete(API_ENDPOINTS.APPOINTMENTS.BY_ID(id))
        
        if (apiHelpers.isSuccess(response)) {
          // Remove from appointments list
          this.appointments = this.appointments.filter(apt => apt.id !== id)
          
          // Clear current appointment if it's the deleted one
          if (this.currentAppointment?.id === id) {
            this.currentAppointment = null
          }
          
          console.log('Appointment deleted successfully')
          return true
        }
      } catch (error) {
        console.error('Failed to delete appointment:', error)
        this.error = apiHelpers.handleApiError(error)
        throw error
      } finally {
        this.isDeleting = false
      }
    },
    
    // Fetch day schedule
    async fetchDaySchedule(date) {
      this.isFetchingSchedule = true
      this.error = null
      
      try {
        console.log('Fetching schedule for:', date)
        
        const response = await apiClient.get(API_ENDPOINTS.APPOINTMENTS.SCHEDULE(date))
        
        if (apiHelpers.isSuccess(response)) {
          const data = apiHelpers.extractData(response)
          this.daySchedule = data
          
          console.log(`Schedule fetched: ${data.appointments.length} appointments`)
          return data
        }
      } catch (error) {
        console.error('Failed to fetch day schedule:', error)
        this.error = apiHelpers.handleApiError(error)
        throw error
      } finally {
        this.isFetchingSchedule = false
      }
    },
    
    // Update filters
    updateFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters }
      console.log('Filters updated:', this.filters)
    },
    
    // Clear all filters
    clearFilters() {
      this.filters = {
        status: '',
        startDate: '',
        endDate: '',
        searchQuery: ''
      }
      console.log('Filters cleared')
    },
    
    // Clear errors
    clearError() {
      this.error = null
      this.validationErrors = []
    },
    
    // Clear current appointment
    clearCurrentAppointment() {
      this.currentAppointment = null
    }
  }
})