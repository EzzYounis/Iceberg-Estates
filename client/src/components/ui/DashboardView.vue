<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Welcome Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Welcome back, {{ authStore.user?.firstName }}!</h1>
      <p class="text-gray-600 mt-2">Here's what's happening with your appointments today.</p>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Today's Appointments -->
      <div class="card p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Calendar class="h-8 w-8 text-primary-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Today's Appointments</p>
            <p class="text-2xl font-bold text-gray-900">{{ todayStats.count }}</p>
          </div>
        </div>
      </div>

      <!-- This Week -->
      <div class="card p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Clock class="h-8 w-8 text-success-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">This Week</p>
            <p class="text-2xl font-bold text-gray-900">{{ weekStats.count }}</p>
          </div>
        </div>
      </div>

      <!-- Total Distance -->
      <div class="card p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <MapPin class="h-8 w-8 text-warning-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Total Distance Today</p>
            <p class="text-2xl font-bold text-gray-900">{{ todayStats.totalDistance }} km</p>
          </div>
        </div>
      </div>

      <!-- Completion Rate -->
      <div class="card p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <TrendingUp class="h-8 w-8 text-primary-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Completion Rate</p>
            <p class="text-2xl font-bold text-gray-900">{{ appointmentStats.completionRate }}%</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Today's Schedule -->
      <div class="lg:col-span-2">
        <div class="card">
          <div class="card-header flex items-center justify-between">
            <h2 class="text-xl font-semibold text-gray-900">Today's Schedule</h2>
            <router-link 
              to="/schedule" 
              class="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View Full Schedule
            </router-link>
          </div>
          
          <div class="card-body">
            <div v-if="isLoadingToday" class="flex justify-center py-8">
              <div class="spinner"></div>
            </div>
            
            <div v-else-if="todayAppointments.length === 0" class="text-center py-8">
              <Calendar class="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p class="text-gray-500">No appointments scheduled for today</p>
              <router-link to="/appointments/create" class="btn-primary mt-4">
                <Plus class="w-4 h-4 mr-2" />
                Schedule First Appointment
              </router-link>
            </div>
            
            <div v-else class="space-y-4">
              <div 
                v-for="appointment in todayAppointments" 
                :key="appointment.id"
                class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0">
                    <div class="w-2 h-2 rounded-full bg-primary-600"></div>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ appointment.customerName }}</p>
                    <p class="text-sm text-gray-500">{{ appointment.propertyAddress }}</p>
                    <p class="text-xs text-gray-400">{{ appointment.propertyPostcode }}</p>
                  </div>
                </div>
                
                <div class="text-right">
                  <p class="font-medium text-gray-900">{{ appointment.appointmentTime }}</p>
                  <p class="text-sm text-gray-500">{{ appointment.distanceKm }} km away</p>
                  <span :class="getStatusClass(appointment.status)">
                    {{ formatStatus(appointment.status) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Upcoming Appointments -->
      <div class="lg:col-span-1">
        <div class="card">
          <div class="card-header">
            <h2 class="text-xl font-semibold text-gray-900">Upcoming This Week</h2>
          </div>
          
          <div class="card-body">
            <div v-if="isLoadingUpcoming" class="flex justify-center py-4">
              <div class="spinner w-6 h-6"></div>
            </div>
            
            <div v-else-if="upcomingAppointments.length === 0" class="text-center py-4">
              <Clock class="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p class="text-gray-500 text-sm">No upcoming appointments</p>
            </div>
            
            <div v-else class="space-y-3">
              <div 
                v-for="appointment in upcomingAppointments.slice(0, 5)" 
                :key="appointment.id"
                class="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
              >
                <div>
                  <p class="font-medium text-sm text-gray-900">{{ appointment.customerName }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(appointment.appointmentDate) }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-gray-900">{{ appointment.appointmentTime }}</p>
                </div>
              </div>
              
              <div v-if="upcomingAppointments.length > 5" class="text-center pt-2">
                <router-link to="/appointments" class="text-sm text-primary-600 hover:text-primary-700">
                  View {{ upcomingAppointments.length - 5 }} more
                </router-link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAppointmentsStore } from '@/stores/appointments'
import { Calendar, Clock, MapPin, Plus, TrendingUp } from 'lucide-vue-next'
import { format, parseISO } from 'date-fns'

// Stores
const authStore = useAuthStore()
const appointmentsStore = useAppointmentsStore()

// Loading states
const isLoadingToday = ref(true)
const isLoadingUpcoming = ref(true)

// Computed properties (only show appointments for the logged-in user)
const todayAppointments = computed(() => {
  if (!authStore.user) return [];
  return appointmentsStore.todayAppointments.filter(apt => String(apt.userId) === String(authStore.user.id));
});
const upcomingAppointments = computed(() => {
  if (!authStore.user) return [];
  return appointmentsStore.upcomingAppointments.filter(apt => String(apt.userId) === String(authStore.user.id));
});
const appointmentStats = computed(() => appointmentsStore.appointmentStats)

// Calculate today's stats
const todayStats = computed(() => {
  const today = todayAppointments.value
  return {
    count: today.length,
    totalDistance: today.reduce((sum, apt) => sum + (apt.distanceKm * 2 || 0), 0).toFixed(1)
  }
})

// Calculate week stats
const weekStats = computed(() => {
  const upcoming = upcomingAppointments.value
  return {
    count: upcoming.length
  }
})

// Helper functions
const getStatusClass = (status) => {
  const classes = {
    scheduled: 'status-scheduled',
    completed: 'status-completed',
    cancelled: 'status-cancelled',
    no_show: 'status-no-show'
  }
  return classes[status] || 'status-scheduled'
}

const formatStatus = (status) => {
  const statusMap = {
    scheduled: 'Scheduled',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'No Show'
  }
  return statusMap[status] || status
}

const formatDate = (dateString) => {
  try {
    return format(parseISO(dateString), 'MMM dd')
  } catch (error) {
    return dateString
  }
}

// Load data on component mount
onMounted(async () => {
  try {
    console.log('🏠 Loading dashboard data...')
    
    // Load appointments
    await appointmentsStore.fetchAppointments()
    
    console.log('Dashboard data loaded')
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  } finally {
    isLoadingToday.value = false
    isLoadingUpcoming.value = false
  }
})
</script>