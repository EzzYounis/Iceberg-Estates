<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Schedule</h1>
        <p class="text-gray-600 mt-1">Your daily appointment schedule and travel times</p>
      </div>
      <router-link to="/appointments/create" class="btn-primary">
        <Plus class="w-4 h-4 mr-2" />
        New Appointment
      </router-link>
    </div>

    <!-- Date Navigation -->
    <div class="card mb-6">
      <div class="card-body">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button
              @click="goToPreviousDay"
              class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft class="w-5 h-5" />
            </button>
            
            <div class="text-center">
              <h2 class="text-xl font-semibold text-gray-900">
                {{ formatSelectedDate(selectedDate) }}
              </h2>
              <p class="text-sm text-gray-600">{{ getDayOfWeek(selectedDate) }}</p>
            </div>
            
            <button
              @click="goToNextDay"
              class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ChevronRight class="w-5 h-5" />
            </button>
          </div>
          
          <div class="flex items-center space-x-2">
            <button
              @click="goToToday"
              :class="isToday(selectedDate) ? 'btn-primary' : 'btn-outline'"
            >
              <Calendar class="w-4 h-4 mr-2" />
              Today
            </button>
            
            <input
              v-model="selectedDate"
              type="date"
              class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              @change="loadDaySchedule"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Schedule Summary -->
    <div v-if="daySchedule && daySchedule.summary" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="card p-4">
        <div class="flex items-center">
          <Calendar class="h-8 w-8 text-primary-600 mr-3" />
          <div>
            <p class="text-sm text-gray-500">Appointments</p>
            <p class="text-xl font-bold text-gray-900">{{ daySchedule.summary.totalAppointments }}</p>
          </div>
        </div>
      </div>
      
      <div class="card p-4">
        <div class="flex items-center">
          <Clock class="h-8 w-8 text-success-600 mr-3" />
          <div>
            <p class="text-sm text-gray-500">Travel Time</p>
            <p class="text-xl font-bold text-gray-900">{{ daySchedule.summary.totalTravelTime }}m</p>
          </div>
        </div>
      </div>
      
      <div class="card p-4">
        <div class="flex items-center">
          <Navigation class="h-8 w-8 text-warning-600 mr-3" />
          <div>
            <p class="text-sm text-gray-500">Distance</p>
            <p class="text-xl font-bold text-gray-900">{{ daySchedule.summary.totalDistance.toFixed(1) }}km</p>
          </div>
        </div>
      </div>
      
      <div class="card p-4">
        <div class="flex items-center">
          <TrendingUp class="h-8 w-8 text-primary-600 mr-3" />
          <div>
            <p class="text-sm text-gray-500">Efficiency</p>
            <p class="text-xl font-bold text-gray-900">
              {{ daySchedule.summary.totalAppointments > 0 ? Math.round((daySchedule.summary.totalAppointments * 60) / Math.max(daySchedule.summary.totalTravelTime, 1)) : 0 }}%
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Schedule Timeline -->
    <div class="card">
      <div class="card-header">
        <h2 class="text-xl font-semibold text-gray-900">Timeline</h2>
        <p class="text-sm text-gray-600 mt-1">Your schedule for {{ formatSelectedDate(selectedDate) }}</p>
      </div>
      
      <div class="card-body">
        <!-- Loading State -->
        <div v-if="appointmentsStore.isFetchingSchedule" class="flex justify-center py-8">
          <div class="spinner w-8 h-8"></div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!daySchedule || daySchedule.appointments.length === 0" class="text-center py-12">
          <Calendar class="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">No appointments scheduled</h3>
          <p class="text-gray-600 mb-6">
            {{ isToday(selectedDate) ? 'You have a free day today!' : 'No appointments on this date.' }}
          </p>
          <router-link to="/appointments/create" class="btn-primary">
            <Plus class="w-4 h-4 mr-2" />
            Schedule Appointment
          </router-link>
        </div>

        <!-- Timeline -->
        <div v-else class="relative">
          <!-- Time markers -->
          <div class="absolute left-0 top-0 bottom-0 w-20 border-r border-gray-200">
            <div 
              v-for="hour in timeMarkers" 
              :key="hour" 
              class="relative h-16 flex items-center"
            >
              <span class="text-xs text-gray-500 bg-white px-2">{{ formatHour(hour) }}</span>
            </div>
          </div>

          <!-- Schedule blocks -->
          <div class="ml-24 relative">
            <!-- Office periods (green blocks) -->
            <div 
              v-for="(period, index) in officePeriods" 
              :key="`office-${index}`"
              class="absolute left-0 right-0 bg-success-100 border border-success-200 rounded-lg p-2 flex items-center justify-center"
              :style="{ 
                top: `${period.top}px`, 
                height: `${period.height}px`,
                zIndex: 1
              }"
            >
              <span class="text-xs font-medium text-success-700">
                {{ period.label }}
              </span>
            </div>

            <!-- Travel periods (orange blocks) -->
            <div 
              v-for="(period, index) in travelPeriods" 
              :key="`travel-${index}`"
              class="absolute left-0 right-0 bg-warning-100 border border-warning-200 rounded-lg p-2 flex items-center justify-center"
              :style="{ 
                top: `${period.top}px`, 
                height: `${period.height}px`,
                zIndex: 2
              }"
            >
              <div class="flex items-center text-xs font-medium text-warning-700">
                <Navigation class="w-3 h-3 mr-1" />
                {{ period.label }}
              </div>
            </div>

            <!-- Appointment blocks (blue blocks) -->
            <div 
              v-for="(appointment, index) in scheduleBlocks" 
              :key="appointment.id"
              class="absolute left-0 right-0 bg-primary-100 border border-primary-200 rounded-lg p-3 cursor-pointer hover:bg-primary-150 transition-colors"
              :style="{ 
                top: `${appointment.top}px`, 
                height: `${appointment.height}px`,
                zIndex: 3
              }"
              @click="viewAppointment(appointment)"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  <h4 class="font-medium text-primary-900 text-sm truncate">
                    {{ appointment.customerName }}
                  </h4>
                  <p class="text-xs text-primary-700 truncate">
                    {{ appointment.propertyAddress }}
                  </p>
                  <div class="flex items-center mt-1 text-xs text-primary-600">
                    <Clock class="w-3 h-3 mr-1" />
                    {{ appointment.appointmentTime }}
                  </div>
                </div>
                <div class="flex-shrink-0 ml-2">
                  <span class="text-xs bg-primary-200 text-primary-800 px-2 py-1 rounded-full">
                    {{ appointment.distanceKm }}km
                  </span>
                </div>
              </div>
            </div>

            <!-- Time grid lines -->
            <div class="absolute inset-0" style="z-index: 0;">
              <div 
                v-for="hour in timeMarkers" 
                :key="`line-${hour}`"
                class="border-t border-gray-100"
                :style="{ top: `${(hour - 8) * 64}px` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Schedule Actions -->
    <div v-if="daySchedule && daySchedule.appointments.length > 0" class="mt-6 flex justify-center space-x-4">
      <button @click="exportSchedule" class="btn-outline">
        <Download class="w-4 h-4 mr-2" />
        Export Schedule
      </button>
      
      <button @click="printSchedule" class="btn-outline">
        <Printer class="w-4 h-4 mr-2" />
        Print Schedule
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppointmentsStore } from '@/stores/appointments'
import { 
  Plus, ChevronLeft, ChevronRight, Calendar, Clock, Navigation, TrendingUp,
  Download, Printer, Eye
} from 'lucide-vue-next'
import { format, addDays, subDays, parseISO, isToday as dateIsToday } from 'date-fns'

// Router and stores
const router = useRouter()
const appointmentsStore = useAppointmentsStore()

// Component state
const selectedDate = ref(format(new Date(), 'yyyy-MM-dd'))
const daySchedule = ref(null)

// Time markers for the timeline (8 AM to 7 PM)
const timeMarkers = computed(() => {
  const markers = []
  for (let hour = 8; hour <= 19; hour++) {
    markers.push(hour)
  }
  return markers
})

// Helper functions
const formatSelectedDate = (date) => {
  try {
    return format(parseISO(date), 'EEEE, MMMM do, yyyy')
  } catch (error) {
    return date
  }
}

const getDayOfWeek = (date) => {
  try {
    const today = new Date()
    const selectedDateTime = parseISO(date)
    
    if (dateIsToday(selectedDateTime)) {
      return 'Today'
    } else if (selectedDateTime.getTime() === addDays(today, 1).getTime()) {
      return 'Tomorrow'
    } else if (selectedDateTime.getTime() === subDays(today, 1).getTime()) {
      return 'Yesterday'
    } else {
      return format(selectedDateTime, 'EEEE')
    }
  } catch (error) {
    return ''
  }
}

const formatHour = (hour) => {
  const hour12 = hour % 12 || 12
  const ampm = hour >= 12 ? 'PM' : 'AM'
  return `${hour12} ${ampm}`
}

const isToday = (date) => {
  try {
    return dateIsToday(parseISO(date))
  } catch (error) {
    return false
  }
}

// Calculate timeline positions
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()

const scheduleBlocks = computed(() => {
  if (!daySchedule.value || !daySchedule.value.appointments || !authStore.user) return []
  // Only show appointments for the logged-in user
  return daySchedule.value.appointments
    .filter(appointment => appointment.userId === authStore.user.id)
    .map(appointment => {
      const [hours, minutes] = appointment.appointmentTime.split(':').map(Number)
      const startMinutes = (hours - 8) * 60 + minutes
      const top = (startMinutes / 60) * 64 // 64px per hour
      const height = 64 // 1 hour appointment
      return {
        ...appointment,
        top,
        height
      }
    })
})

// Calculate travel periods (only for logged-in user)
const travelPeriods = computed(() => {
  if (!daySchedule.value || !daySchedule.value.appointments || !authStore.user) return []
  const periods = []
  daySchedule.value.appointments
    .filter(appointment => String(appointment.userId) === String(authStore.user.id))
    .forEach(appointment => {
      if (appointment.departureTime) {
        // Travel to appointment
        const [depHours, depMinutes] = appointment.departureTime.split(':').map(Number)
        const [aptHours, aptMinutes] = appointment.appointmentTime.split(':').map(Number)
        const depStartMinutes = (depHours - 8) * 60 + depMinutes
        const aptStartMinutes = (aptHours - 8) * 60 + aptMinutes
        periods.push({
          top: (depStartMinutes / 60) * 64,
          height: ((aptStartMinutes - depStartMinutes) / 60) * 64,
          label: `Travel to ${appointment.customerName}`
        })
        // Travel back from appointment
        const returnStartMinutes = aptStartMinutes + 60 // After 1-hour appointment
        const returnEndMinutes = returnStartMinutes + appointment.travelTimeMinutes
        periods.push({
          top: (returnStartMinutes / 60) * 64,
          height: ((returnEndMinutes - returnStartMinutes) / 60) * 64,
          label: `Return from ${appointment.customerName}`
        })
      }
    })
  return periods
})

// Calculate office periods (only for logged-in user)
const officePeriods = computed(() => {
  if (!daySchedule.value || !daySchedule.value.summary || !daySchedule.value.summary.busyPeriods || !authStore.user) return []
  const periods = []
  // Only use busyPeriods for the logged-in user
  const busyPeriods = daySchedule.value.summary.busyPeriods
    .filter(period => String(period.userId) === String(authStore.user.id))
    .sort((a, b) => a.start.localeCompare(b.start))
  // Office time before first appointment
  if (busyPeriods.length > 0) {
    const firstBusy = busyPeriods[0]
    const [firstHours, firstMinutes] = firstBusy.start.split(':').map(Number)
    const firstBusyMinutes = (firstHours - 8) * 60 + firstMinutes
    if (firstBusyMinutes > 0) {
      periods.push({
        top: 0,
        height: (firstBusyMinutes / 60) * 64,
        label: 'Office Time'
      })
    }
  }
  // Office time between appointments
  for (let i = 0; i < busyPeriods.length - 1; i++) {
    const currentEnd = busyPeriods[i].end
    const nextStart = busyPeriods[i + 1].start
    const [endHours, endMinutes] = currentEnd.split(':').map(Number)
    const [startHours, startMinutes] = nextStart.split(':').map(Number)
    const endMinutesFromStart = (endHours - 8) * 60 + endMinutes
    const startMinutesFromStart = (startHours - 8) * 60 + startMinutes
    const gapMinutes = startMinutesFromStart - endMinutesFromStart
    if (gapMinutes > 0) {
      periods.push({
        top: (endMinutesFromStart / 60) * 64,
        height: (gapMinutes / 60) * 64,
        label: 'Office Time'
      })
    }
  }
  return periods
})

// Navigation functions
const goToPreviousDay = () => {
  selectedDate.value = format(subDays(parseISO(selectedDate.value), 1), 'yyyy-MM-dd')
}

const goToNextDay = () => {
  selectedDate.value = format(addDays(parseISO(selectedDate.value), 1), 'yyyy-MM-dd')
}

const goToToday = () => {
  selectedDate.value = format(new Date(), 'yyyy-MM-dd')
}

// Data loading
const loadDaySchedule = async () => {
  try {
    console.log('📅 Loading schedule for:', selectedDate.value)
    const schedule = await appointmentsStore.fetchDaySchedule(selectedDate.value)
    daySchedule.value = schedule
    console.log('✅ Schedule loaded')
  } catch (error) {
    console.error('❌ Failed to load schedule:', error)
    daySchedule.value = null
  }
}

// Actions
const viewAppointment = (appointment) => {
  router.push(`/appointments/${appointment.id}`)
}

const exportSchedule = () => {
  // Implement schedule export functionality
  const scheduleData = {
    date: selectedDate.value,
    appointments: daySchedule.value?.appointments || [],
    summary: daySchedule.value?.summary || {}
  }
  
  const dataStr = JSON.stringify(scheduleData, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
  
  const exportFileDefaultName = `schedule-${selectedDate.value}.json`
  
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
}

const printSchedule = () => {
  window.print()
}

// Watch for date changes
watch(selectedDate, loadDaySchedule)

// Load initial data
onMounted(() => {
  loadDaySchedule()
})
</script>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }
  
  .card {
    box-shadow: none !important;
    border: 1px solid #e5e7eb !important;
  }
}

.spinner {
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>