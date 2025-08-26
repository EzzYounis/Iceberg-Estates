<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Loading State -->
    <div v-if="appointmentsStore.isLoading" class="flex justify-center py-12">
      <div class="spinner w-8 h-8"></div>
    </div>

    <!-- Appointment Not Found -->
    <div v-else-if="!appointment" class="text-center py-12">
      <AlertCircle class="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h2 class="text-2xl font-semibold text-gray-900 mb-2">Appointment Not Found</h2>
      <p class="text-gray-600 mb-6">The appointment you're looking for doesn't exist or you don't have access to it.</p>
      <router-link to="/appointments" class="btn-primary">
        <ArrowLeft class="w-4 h-4 mr-2" />
        Back to Appointments
      </router-link>
    </div>

    <!-- Appointment Details -->
    <div v-else>
      <!-- Header -->
      <div class="flex items-start justify-between mb-8">
        <div class="flex items-center space-x-4">
          <router-link to="/appointments" class="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft class="w-5 h-5 text-gray-600" />
          </router-link>
          <div>
            <h1 class="text-3xl font-bold text-gray-900">{{ appointment.customerName }}</h1>
            <div class="flex items-center space-x-3 mt-2">
              <span :class="getStatusClass(appointment.status)">
                {{ formatStatus(appointment.status) }}
              </span>
              <span class="text-gray-500">•</span>
              <span class="text-gray-600">{{ formatDateTime(appointment.appointmentDate, appointment.appointmentTime) }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center space-x-3">
          <button
            @click="editAppointment"
            class="btn-outline"
          >
            <Edit class="w-4 h-4 mr-2" />
            Edit
          </button>
          
          <div class="relative">
            <button
              @click="showStatusMenu = !showStatusMenu"
              class="btn-secondary"
            >
              <span>Change Status</span>
              <ChevronDown class="w-4 h-4 ml-2" />
            </button>
            
            <!-- Status Dropdown -->
            <div
              v-if="showStatusMenu"
              v-click-outside="() => showStatusMenu = false"
              class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
            >
              <button
                v-for="status in availableStatuses"
                :key="status.value"
                @click="updateStatus(status.value)"
                class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                :class="{ 'bg-primary-50 text-primary-700': appointment.status === status.value }"
              >
                <span :class="status.color" class="w-2 h-2 rounded-full mr-3"></span>
                {{ status.label }}
              </button>
            </div>
          </div>
          
          <button
            @click="confirmDelete"
            class="btn-error"
          >
            <Trash2 class="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Details -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Customer Information -->
          <div class="card">
            <div class="card-header">
              <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                <User class="w-5 h-5 mr-2" />
                Customer Information
              </h2>
            </div>
            <div class="card-body space-y-4">
              <div>
                <label class="form-label">Name</label>
                <p class="text-gray-900">{{ appointment.customerName }}</p>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="form-label">Phone</label>
                  <div class="flex items-center space-x-2">
                    <p class="text-gray-900">{{ appointment.customerPhone }}</p>
                    <a 
                      :href="`tel:${appointment.customerPhone}`"
                      class="p-1 text-primary-600 hover:text-primary-700 rounded"
                      title="Call customer"
                    >
                      <Phone class="w-4 h-4" />
                    </a>
                  </div>
                </div>
                
                <div v-if="appointment.customerEmail">
                  <label class="form-label">Email</label>
                  <div class="flex items-center space-x-2">
                    <p class="text-gray-900">{{ appointment.customerEmail }}</p>
                    <a 
                      :href="`mailto:${appointment.customerEmail}`"
                      class="p-1 text-primary-600 hover:text-primary-700 rounded"
                      title="Email customer"
                    >
                      <Mail class="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Property Information -->
          <div class="card">
            <div class="card-header">
              <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                <MapPin class="w-5 h-5 mr-2" />
                Property Details
              </h2>
            </div>
            <div class="card-body space-y-4">
              <div>
                <label class="form-label">Address</label>
                <p class="text-gray-900">{{ appointment.propertyAddress }}</p>
              </div>
              
              <div class="flex items-center justify-between">
                <div>
                  <label class="form-label">Postcode</label>
                  <p class="text-gray-900">{{ appointment.propertyPostcode }}</p>
                </div>
                
                <div class="flex items-center space-x-2">
                  <a
                    :href="getGoogleMapsUrl(appointment.propertyAddress, appointment.propertyPostcode)"
                    target="_blank"
                    class="btn-outline px-3 py-2 text-sm"
                  >
                    <ExternalLink class="w-4 h-4 mr-1" />
                    View on Maps
                  </a>
                  
                  <button
                    @click="getDirections"
                    class="btn-outline px-3 py-2 text-sm"
                  >
                    <Navigation class="w-4 h-4 mr-1" />
                    Directions
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="appointment.notes" class="card">
            <div class="card-header">
              <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                <FileText class="w-5 h-5 mr-2" />
                Notes
              </h2>
            </div>
            <div class="card-body">
              <p class="text-gray-900 whitespace-pre-wrap">{{ appointment.notes }}</p>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Schedule Information -->
          <div class="card">
            <div class="card-header">
              <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                <Clock class="w-5 h-5 mr-2" />
                Schedule
              </h2>
            </div>
            <div class="card-body space-y-4">
              <div class="space-y-3">
                <div class="flex justify-between items-center py-2 border-b border-gray-100">
                  <span class="text-sm text-gray-600">Depart Office</span>
                  <span class="font-medium">{{ appointment.departureTime || 'Not calculated' }}</span>
                </div>
                
                <div class="flex justify-between items-center py-2 border-b border-gray-100">
                  <span class="text-sm text-gray-600">Appointment</span>
                  <span class="font-medium">{{ appointment.appointmentTime }}</span>
                </div>
                
                <div class="flex justify-between items-center py-2 border-b border-gray-100">
                  <span class="text-sm text-gray-600">Return Office</span>
                  <span class="font-medium">{{ appointment.returnTime || 'Not calculated' }}</span>
                </div>
                
                <div class="flex justify-between items-center py-2">
                  <span class="text-sm text-gray-600">Available Again</span>
                  <span class="font-medium">{{ appointment.availableAgainTime || 'Not calculated' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Travel Information -->
          <div class="card">
            <div class="card-header">
              <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                <Navigation class="w-5 h-5 mr-2" />
                Travel Info
              </h2>
            </div>
            <div class="card-body space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="text-center p-3 bg-primary-50 rounded-lg">
                  <p class="text-2xl font-bold text-primary-600">{{ appointment.distanceKm || 0 }}<span class="text-sm">km</span></p>
                  <p class="text-xs text-primary-700">Distance</p>
                </div>
                
                <div class="text-center p-3 bg-success-50 rounded-lg">
                  <p class="text-2xl font-bold text-success-600">{{ appointment.travelTimeMinutes || 0 }}<span class="text-sm">min</span></p>
                  <p class="text-xs text-success-700">Travel Time</p>
                </div>
              </div>
              
              <div class="text-center p-3 bg-warning-50 rounded-lg">
                <p class="text-lg font-bold text-warning-600">{{ ((appointment.distanceKm || 0) * 2).toFixed(1) }}<span class="text-sm">km</span></p>
                <p class="text-xs text-warning-700">Round Trip Distance</p>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="card">
            <div class="card-header">
              <h2 class="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div class="card-body space-y-3">
              <button
                @click="callCustomer"
                class="btn-success w-full"
              >
                <Phone class="w-4 h-4 mr-2" />
                Call Customer
              </button>
              
              <button
                v-if="appointment.customerEmail"
                @click="emailCustomer"
                class="btn-outline w-full"
              >
                <Mail class="w-4 h-4 mr-2" />
                Email Customer
              </button>
              
              <button
                @click="viewOnCalendar"
                class="btn-outline w-full"
              >
                <Calendar class="w-4 h-4 mr-2" />
                View in Schedule
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Delete Appointment</h3>
          <p class="text-gray-600 mb-6">
            Are you sure you want to delete this appointment with {{ appointment.customerName }}? 
            This action cannot be undone.
          </p>
          <div class="flex justify-end space-x-3">
            <button
              @click="showDeleteConfirm = false"
              class="btn-outline"
            >
              Cancel
            </button>
            <button
              @click="deleteAppointment"
              :disabled="appointmentsStore.isDeleting"
              class="btn-error"
            >
              <div v-if="appointmentsStore.isDeleting" class="flex items-center">
                <div class="spinner w-4 h-4 mr-2"></div>
                Deleting...
              </div>
              <span v-else>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppointmentsStore } from '@/stores/appointments'
import { 
  ArrowLeft, User, MapPin, Clock, Navigation, FileText, Edit, ChevronDown,
  Trash2, Phone, Mail, Calendar, ExternalLink, AlertCircle
} from 'lucide-vue-next'
import { format, parseISO } from 'date-fns'

// Router and stores
const router = useRouter()
const route = useRoute()
const appointmentsStore = useAppointmentsStore()

// Component state
const showStatusMenu = ref(false)
const showDeleteConfirm = ref(false)

// Computed properties
const appointment = computed(() => appointmentsStore.currentAppointment)

// Available statuses for status dropdown
const availableStatuses = [
  { value: 'scheduled', label: 'Scheduled', color: 'bg-primary-500' },
  { value: 'completed', label: 'Completed', color: 'bg-success-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-error-500' },
  { value: 'no_show', label: 'No Show', color: 'bg-warning-500' }
]

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

const formatDateTime = (date, time) => {
  try {
    const dateTime = parseISO(`${date}T${time}`)
    return format(dateTime, 'PPP p')
  } catch (error) {
    return `${date} ${time}`
  }
}

const getGoogleMapsUrl = (address, postcode) => {
  const query = encodeURIComponent(`${address}, ${postcode}`)
  return `https://www.google.com/maps/search/?api=1&query=${query}`
}

// Action functions
const editAppointment = () => {
  router.push(`/appointments/${route.params.id}/edit`)
}

const updateStatus = async (newStatus) => {
  try {
    await appointmentsStore.updateAppointment(route.params.id, { status: newStatus })
    showStatusMenu.value = false
    console.log('✅ Appointment status updated')
  } catch (error) {
    console.error('❌ Failed to update status:', error)
  }
}

const confirmDelete = () => {
  showDeleteConfirm.value = true
}

const deleteAppointment = async () => {
  try {
    await appointmentsStore.deleteAppointment(route.params.id)
    showDeleteConfirm.value = false
    console.log('✅ Appointment deleted successfully')
    await router.push('/appointments')
  } catch (error) {
    console.error('❌ Failed to delete appointment:', error)
  }
}

const callCustomer = () => {
  if (appointment.value?.customerPhone) {
    window.location.href = `tel:${appointment.value.customerPhone}`
  }
}

const emailCustomer = () => {
  if (appointment.value?.customerEmail) {
    const subject = encodeURIComponent(`Regarding your appointment on ${appointment.value.appointmentDate}`)
    const body = encodeURIComponent(`Dear ${appointment.value.customerName},\n\nI hope this email finds you well. I'm writing regarding your upcoming appointment scheduled for ${formatDateTime(appointment.value.appointmentDate, appointment.value.appointmentTime)} at ${appointment.value.propertyAddress}.\n\nBest regards,\n[Your Name]`)
    window.location.href = `mailto:${appointment.value.customerEmail}?subject=${subject}&body=${body}`
  }
}

const getDirections = () => {
  if (appointment.value) {
    const destination = encodeURIComponent(`${appointment.value.propertyAddress}, ${appointment.value.propertyPostcode}`)
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`
    window.open(url, '_blank')
  }
}

const viewOnCalendar = () => {
  router.push(`/schedule?date=${appointment.value.appointmentDate}`)
}

// Click outside directive
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}

// Load appointment data on component mount
onMounted(async () => {
  const appointmentId = route.params.id
  
  try {
    console.log('🔍 Loading appointment details:', appointmentId)
    await appointmentsStore.fetchAppointment(appointmentId)
    console.log('✅ Appointment details loaded')
  } catch (error) {
    console.error('❌ Failed to load appointment:', error)
  }
})
</script>

<style scoped>
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