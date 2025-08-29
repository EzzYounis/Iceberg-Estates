<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center space-x-4 mb-4">
        <router-link to="/appointments" class="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft class="w-5 h-5 text-gray-600" />
        </router-link>
        <h1 class="text-3xl font-bold text-gray-900">New Appointment</h1>
      </div>
      <p class="text-gray-600">Schedule a property viewing or meeting with a client</p>
    </div>

    <!-- Error Messages -->
    <div v-if="error" class="mb-6 bg-error-50 border border-error-200 rounded-lg p-4">
      <div class="flex">
        <AlertCircle class="h-5 w-5 text-error-400 mt-0.5" />
        <div class="ml-3">
          <h3 class="text-sm font-medium text-error-800">Error Creating Appointment</h3>
          <p class="mt-1 text-sm text-error-700">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Validation Errors -->
    <div v-if="validationErrors.length > 0" class="mb-6 bg-error-50 border border-error-200 rounded-lg p-4">
      <div class="flex">
        <AlertCircle class="h-5 w-5 text-error-400 mt-0.5" />
        <div class="ml-3">
          <h3 class="text-sm font-medium text-error-800">Please fix the following errors:</h3>
          <ul class="mt-2 text-sm text-error-700 list-disc list-inside">
            <li v-for="error in validationErrors" :key="error.field">
              {{ error.message }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-8">
      <!-- Customer Information -->
      <div class="card">
        <div class="card-header">
          <h2 class="text-xl font-semibold text-gray-900 flex items-center">
            <User class="w-5 h-5 mr-2" />
            Customer Information
          </h2>
          <p class="text-sm text-gray-600 mt-1">Details about the person you're meeting</p>
        </div>
        
        <div class="card-body space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Customer Name -->
            <div class="form-group">
              <label for="customerName" class="form-label">
                Customer Name *
              </label>
              <input
                id="customerName"
                v-model="form.customerName"
                type="text"
                required
                :class="{ 'border-error-500 focus:ring-error-500': fieldErrors.customerName }"
                placeholder="John Smith"
              />
              <p v-if="fieldErrors.customerName" class="form-error">{{ fieldErrors.customerName }}</p>
            </div>

            <!-- Customer Phone -->
            <div class="form-group">
              <label for="customerPhone" class="form-label">
                Phone Number *
              </label>
              <input
                id="customerPhone"
                v-model="form.customerPhone"
                type="tel"
                required
                :class="{ 'border-error-500 focus:ring-error-500': fieldErrors.customerPhone }"
                placeholder="07700 900 123"
              />
              <p v-if="fieldErrors.customerPhone" class="form-error">{{ fieldErrors.customerPhone }}</p>
              <p class="form-help">UK mobile number for contact</p>
            </div>

            <!-- Customer Email -->
            <div class="form-group">
              <label for="customerEmail" class="form-label">
                Email Address
              </label>
              <input
                id="customerEmail"
                v-model="form.customerEmail"
                type="email"
                :class="{ 'border-error-500 focus:ring-error-500': fieldErrors.customerEmail }"
                placeholder="john.smith@email.com"
              />
              <p v-if="fieldErrors.customerEmail" class="form-error">{{ fieldErrors.customerEmail }}</p>
              <p class="form-help">Optional - for sending confirmation emails</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Property Information -->
      <div class="card">
        <div class="card-header">
          <h2 class="text-xl font-semibold text-gray-900 flex items-center">
            <MapPin class="w-5 h-5 mr-2" />
            Property Details
          </h2>
          <p class="text-sm text-gray-600 mt-1">Where the appointment will take place</p>
        </div>
        
        <div class="card-body space-y-6">
          <!-- Property Address -->
          <div class="form-group">
            <label for="propertyAddress" class="form-label">
              Property Address *
            </label>
            <textarea
              id="propertyAddress"
              v-model="form.propertyAddress"
              rows="3"
              required
              :class="{ 'border-error-500 focus:ring-error-500': fieldErrors.propertyAddress }"
              placeholder="123 High Street, City Centre, London"
            ></textarea>
            <p v-if="fieldErrors.propertyAddress" class="form-error">{{ fieldErrors.propertyAddress }}</p>
            <p class="form-help">Full address of the property to visit</p>
          </div>

          <!-- Property Postcode -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label for="propertyPostcode" class="form-label">
                Postcode *
              </label>
              <div class="flex space-x-2">
                <input
                  id="propertyPostcode"
                  v-model="form.propertyPostcode"
                  type="text"
                  required
                  :class="{ 'border-error-500 focus:ring-error-500': fieldErrors.propertyPostcode }"
                  placeholder="SW1A 1AA"
                  class="flex-1"
                />
                <button
                  type="button"
                  @click="validatePostcode"
                  :disabled="!form.propertyPostcode || isValidatingPostcode"
                  class="btn-outline px-3 py-2 disabled:opacity-50"
                >
                  <div v-if="isValidatingPostcode" class="flex items-center">
                    <div class="spinner w-4 h-4 mr-1"></div>
                    Checking...
                  </div>
                  <span v-else>Validate</span>
                </button>
              </div>
              <p v-if="fieldErrors.propertyPostcode" class="form-error">{{ fieldErrors.propertyPostcode }}</p>
              <p v-if="postcodeStatus === 'valid'" class="text-sm text-success-600 mt-1">
                ✓ Postcode validated
              </p>
              <p v-else-if="postcodeStatus === 'invalid'" class="text-sm text-error-600 mt-1">
                ✗ Invalid postcode
              </p>
              <p class="form-help">UK postcode for travel calculation</p>
            </div>

            <!-- Travel Info Display -->
            <div v-if="travelInfo" class="form-group">
              <label class="form-label">Travel Information</label>
              <div class="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <div class="flex items-center space-x-4 text-sm">
                  <div class="flex items-center text-primary-700">
                    <Navigation class="w-4 h-4 mr-1" />
                    <span>{{ travelInfo.distance }} km</span>
                  </div>
                  <div class="flex items-center text-primary-700">
                    <Clock class="w-4 h-4 mr-1" />
                    <span>{{ travelInfo.travelTime }} min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Agent Selection -->
      <div class="card">
        <div class="card-header">
          <h2 class="text-xl font-semibold text-gray-900 flex items-center">
            <User class="w-5 h-5 mr-2" />
            Assign Agent
          </h2>
          <p class="text-sm text-gray-600 mt-1">Select the agent responsible for this appointment</p>
        </div>
        <div class="card-body">
          <div class="form-group" style="position:relative;">
            <label for="agentCombo" class="form-label">Agent</label>
            <input
              id="agentCombo"
              v-model="agentSearch"
              type="text"
              placeholder="Type to search and select agent..."
              class="w-full border rounded px-2 py-1"
              :disabled="agentLoading"
              @focus="showAgentList = true"
              @input="showAgentList = true"
              @blur="() => setTimeout(() => showAgentList = false, 150)"
            />
            <ul v-if="showAgentList && filteredAgents.length > 0" class="absolute z-10 bg-white border w-full mt-1 rounded shadow max-h-48 overflow-auto">
              <li
                v-for="agent in filteredAgents"
                :key="agent.id"
                @mousedown.prevent="selectAgent(agent)"
                :class="['px-3 py-2 cursor-pointer hover:bg-primary-50', agent.id === form.agentId ? 'bg-primary-100 font-semibold' : '']"
              >
                {{ agent.firstName }} {{ agent.lastName }}
              </li>
            </ul>
            <button type="button" class="btn-outline mt-2" @click="assignLater">Assign Later</button>
            <p class="form-help">Leave blank or click 'Assign Later' to create an unassigned appointment.</p>
            <p v-if="agentError" class="form-error">{{ agentError }}</p>
            <p v-if="fieldErrors.agentId" class="form-error">{{ fieldErrors.agentId }}</p>
          </div>
        </div>
      </div>

      <!-- Appointment Timing -->
      <div class="card">
        <div class="card-header">
          <h2 class="text-xl font-semibold text-gray-900 flex items-center">
            <Calendar class="w-5 h-5 mr-2" />
            Date & Time
          </h2>
          <p class="text-sm text-gray-600 mt-1">When the appointment should take place</p>
        </div>
        
        <div class="card-body space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Appointment Date -->
            <div class="form-group">
              <label for="appointmentDate" class="form-label">
                Appointment Date *
              </label>
              <input
                id="appointmentDate"
                v-model="form.appointmentDate"
                type="date"
                required
                :min="minDate"
                :class="{ 'border-error-500 focus:ring-error-500': fieldErrors.appointmentDate }"
              />
              <p v-if="fieldErrors.appointmentDate" class="form-error">{{ fieldErrors.appointmentDate }}</p>
              <p class="form-help">Appointments can only be scheduled for future dates</p>
            </div>

            <!-- Appointment Time -->
            <div class="form-group">
              <label for="appointmentTime" class="form-label">
                Appointment Time *
              </label>
              <select
                id="appointmentTime"
                v-model="form.appointmentTime"
                required
                :class="{ 'border-error-500 focus:ring-error-500': fieldErrors.appointmentTime }"
              >
                <option value="">Select a time</option>
                <option v-for="time in availableTimes" :key="time" :value="time">
                  {{ formatTime(time) }}
                </option>
              </select>
              <p v-if="fieldErrors.appointmentTime" class="form-error">{{ fieldErrors.appointmentTime }}</p>
              <p class="form-help">Business hours: 8:00 AM - 6:00 PM</p>
            </div>
          </div>

          <!-- Schedule Preview -->
          <div v-if="schedulePreview" class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 class="text-sm font-medium text-gray-900 mb-3">Schedule Preview</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Depart office:</span>
                <span class="font-medium">{{ schedulePreview.departureTime }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Appointment:</span>
                <span class="font-medium">{{ schedulePreview.appointmentTime }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Return to office:</span>
                <span class="font-medium">{{ schedulePreview.returnTime }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Available again:</span>
                <span class="font-medium">{{ schedulePreview.availableTime }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Notes -->
      <div class="card">
        <div class="card-header">
          <h2 class="text-xl font-semibold text-gray-900 flex items-center">
            <FileText class="w-5 h-5 mr-2" />
            Additional Information
          </h2>
          <p class="text-sm text-gray-600 mt-1">Any special notes or requirements</p>
        </div>
        
        <div class="card-body">
          <div class="form-group">
            <label for="notes" class="form-label">
              Notes
            </label>
            <textarea
              id="notes"
              v-model="form.notes"
              rows="4"
              :class="{ 'border-error-500 focus:ring-error-500': fieldErrors.notes }"
              placeholder="Any special instructions, requirements, or notes about this appointment..."
            ></textarea>
            <p v-if="fieldErrors.notes" class="form-error">{{ fieldErrors.notes }}</p>
            <p class="form-help">Optional - visible in your schedule and appointment details</p>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex items-center justify-between bg-white border-t border-gray-200 pt-6">
        <router-link to="/appointments" class="btn-outline">
          Cancel
        </router-link>
        
        <div class="flex items-center space-x-4">
          <!-- Preview Button -->
          <button
            type="button"
            @click="previewAppointment"
            :disabled="!isFormValid"
            class="btn-secondary disabled:opacity-50"
          >
            <Eye class="w-4 h-4 mr-2" />
            Preview
          </button>
          
          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="appointmentsStore.isCreating || !isFormValid"
            class="btn-primary disabled:opacity-50"
          >
            <div v-if="appointmentsStore.isCreating" class="flex items-center">
              <div class="spinner w-4 h-4 mr-2"></div>
              Creating...
            </div>
            <span v-else class="flex items-center">
              <Plus class="w-4 h-4 mr-2" />
              Create Appointment
            </span>
          </button>
        </div>
      </div>
    </form>

    <!-- Preview Modal -->
    <div
      v-if="showPreview"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Appointment Preview</h3>
            <button @click="showPreview = false" class="text-gray-400 hover:text-gray-600">
              <X class="w-5 h-5" />
            </button>
          </div>
          
          <div class="space-y-4">
            <div>
              <h4 class="font-medium text-gray-900">{{ form.customerName }}</h4>
              <p class="text-sm text-gray-600">{{ form.customerPhone }}</p>
              <p v-if="form.customerEmail" class="text-sm text-gray-600">{{ form.customerEmail }}</p>
            </div>
            
            <div>
              <h4 class="font-medium text-gray-900">Property</h4>
              <p class="text-sm text-gray-600">{{ form.propertyAddress }}</p>
              <p class="text-sm text-gray-600">{{ form.propertyPostcode }}</p>
            </div>
            
            <div>
              <h4 class="font-medium text-gray-900">Date & Time</h4>
              <p class="text-sm text-gray-600">
                {{ formatDateTime(form.appointmentDate, form.appointmentTime) }}
              </p>
            </div>
            
            <div v-if="travelInfo">
              <h4 class="font-medium text-gray-900">Travel</h4>
              <p class="text-sm text-gray-600">{{ travelInfo.distance }} km, {{ travelInfo.travelTime }} minutes</p>
            </div>
            
            <div v-if="form.notes">
              <h4 class="font-medium text-gray-900">Notes</h4>
              <p class="text-sm text-gray-600">{{ form.notes }}</p>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 mt-6">
            <button @click="showPreview = false" class="btn-outline">
              Edit
            </button>
            <button @click="handleSubmit" class="btn-primary">
              <Plus class="w-4 h-4 mr-2" />
              Create Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppointmentsStore } from '@/stores/appointments'
import { 
  ArrowLeft, User, MapPin, Calendar, Clock, FileText, Navigation, 
  AlertCircle, Eye, Plus, X 
} from 'lucide-vue-next'
import { format, addDays } from 'date-fns'

// Router and stores
const router = useRouter()
const appointmentsStore = useAppointmentsStore()

// Component state
const error = ref('')
const validationErrors = ref([])
const fieldErrors = reactive({})
const postcodeStatus = ref('')
const isValidatingPostcode = ref(false)
const travelInfo = ref(null)
const schedulePreview = ref(null)
const showPreview = ref(false)

import apiClient, { API_ENDPOINTS } from '@/config/api'
const agents = ref([])
const agentSearch = ref('')
const agentLoading = ref(false)
const agentError = ref('')
const showAgentList = ref(false)
function selectAgent(agent) {
  form.agentId = agent.id
  agentSearch.value = agent.firstName + ' ' + agent.lastName
  showAgentList.value = false
}
const form = reactive({
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  propertyAddress: '',
  propertyPostcode: '',
  appointmentDate: '',
  appointmentTime: '',
  notes: '',
  agentId: '' // null or '' means unassigned
})

// Computed properties
const minDate = computed(() => {
  return format(addDays(new Date(), 1), 'yyyy-MM-dd')
})

const availableTimes = computed(() => {
  const times = []
  for (let hour = 8; hour <= 18; hour++) {
    times.push(`${hour.toString().padStart(2, '0')}:00`)
    if (hour < 18) {
      times.push(`${hour.toString().padStart(2, '0')}:30`)
    }
  }
  return times
})

const filteredAgents = computed(() => {
  if (!agentSearch.value) return agents.value
  return agents.value.filter(a =>
    (a.firstName + ' ' + a.lastName).toLowerCase().includes(agentSearch.value.toLowerCase())
  )
})

import { watch } from 'vue'
// Keep agentId and agentSearch in sync if user clears the input
watch(agentSearch, (val) => {
  if (!val) form.agentId = ''
})

const isFormValid = computed(() => {
  return form.customerName && 
         form.customerPhone && 
         form.propertyAddress && 
         form.propertyPostcode && 
         form.appointmentDate && 
         form.appointmentTime
})
function assignLater() {
  form.agentId = ''
  agentSearch.value = ''
  showAgentList.value = false
}

// Helper functions
const formatTime = (time) => {
  const [hours, minutes] = time.split(':')
  const hour12 = parseInt(hours) % 12 || 12
  const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM'
  return `${hour12}:${minutes} ${ampm}`
}

const formatDateTime = (date, time) => {
  try {
    const dateTime = new Date(`${date}T${time}`)
    return format(dateTime, 'PPP p')
  } catch (error) {
    return `${date} ${time}`
  }
}

// Validation functions
const validatePostcode = async () => {
  if (!form.propertyPostcode) return
  
  isValidatingPostcode.value = true
  postcodeStatus.value = ''
  
  try {
    // This would normally call your API to validate postcode
    // For now, we'll simulate validation
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simple UK postcode pattern validation
    const postcodePattern = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i
    
    if (postcodePattern.test(form.propertyPostcode.trim())) {
      postcodeStatus.value = 'valid'
      travelInfo.value = {
        distance: '12.5',
        travelTime: '25'
      }
      updateSchedulePreview()
    } else {
      postcodeStatus.value = 'invalid'
      travelInfo.value = null
      schedulePreview.value = null
    }
    
  } catch (error) {
    postcodeStatus.value = 'error'
    console.error('Postcode validation failed:', error)
  } finally {
    isValidatingPostcode.value = false
  }
}

const updateSchedulePreview = () => {
  if (!form.appointmentTime || !travelInfo.value) return
  
  const [hours, minutes] = form.appointmentTime.split(':').map(Number)
  const appointmentDateTime = new Date()
  appointmentDateTime.setHours(hours, minutes, 0, 0)
  
  const travelMinutes = parseInt(travelInfo.value.travelTime)
  
  // Calculate departure time
  const departureTime = new Date(appointmentDateTime)
  departureTime.setMinutes(departureTime.getMinutes() - travelMinutes)
  
  // Calculate return time (appointment + 1 hour + travel back)
  const returnTime = new Date(appointmentDateTime)
  returnTime.setMinutes(returnTime.getMinutes() + 60 + travelMinutes)
  
  schedulePreview.value = {
    departureTime: format(departureTime, 'h:mm a'),
    appointmentTime: format(appointmentDateTime, 'h:mm a'),
    returnTime: format(returnTime, 'h:mm a'),
    availableTime: format(returnTime, 'h:mm a')
  }
}

// Form actions
const previewAppointment = () => {
  showPreview.value = true
}

const handleSubmit = async () => {
  error.value = ''
  validationErrors.value = []
  Object.keys(fieldErrors).forEach(key => delete fieldErrors[key])
  
  try {
    console.log('📝 Creating appointment...')
    
    const appointmentData = {
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      customerEmail: form.customerEmail.trim() || null,
      propertyAddress: form.propertyAddress.trim(),
      propertyPostcode: form.propertyPostcode.trim().toUpperCase(),
      appointmentDate: form.appointmentDate,
      appointmentTime: form.appointmentTime,
      notes: form.notes.trim() || null,
      agentId: form.agentId || null // send null if unassigned
    }
    
    const result = await appointmentsStore.createAppointment(appointmentData)
    
    if (result) {
      console.log('✅ Appointment created successfully')
      showPreview.value = false
      await router.push(`/appointments/${result.id}`)
    }
    
  } catch (err) {
    console.error('❌ Failed to create appointment:', err)
    error.value = err.message || 'Failed to create appointment'
    
    // Handle validation errors from store
    if (appointmentsStore.validationErrors.length > 0) {
      validationErrors.value = appointmentsStore.validationErrors
      
      // Map validation errors to field errors
      appointmentsStore.validationErrors.forEach(error => {
        fieldErrors[error.field] = error.message
      })
    }
  }
}

// Watch for form changes to update schedule preview
onMounted(async () => {
  // Set default date to tomorrow
  form.appointmentDate = format(addDays(new Date(), 1), 'yyyy-MM-dd')
  // Fetch agents
  agentLoading.value = true
  try {
    const res = await apiClient.get(API_ENDPOINTS.AGENTS.BASE)
    agents.value = res.data?.data?.agents || res.data?.agents || []
    // Default to first agent if available
    if (agents.value.length > 0) {
      form.agentId = agents.value[0].id
      agentSearch.value = agents.value[0].firstName + ' ' + agents.value[0].lastName
    }
  } catch (e) {
    agentError.value = 'Failed to load agents.'
    agents.value = []
  } finally {
    agentLoading.value = false
  }
  // Watch for time changes
  let timeoutId = null
  const watchFormChanges = () => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      if (form.appointmentTime && travelInfo.value) {
        updateSchedulePreview()
      }
    }, 300)
  }
  // You would set up watchers here in a real Vue component
  console.log('🗓️ Create appointment form initialized')
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