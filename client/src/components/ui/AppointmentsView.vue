<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Appointments</h1>
        <p class="text-gray-600 mt-1">Manage your property viewings and meetings</p>
      </div>
      <router-link to="/appointments/create" class="btn-primary">
        <Plus class="w-4 h-4 mr-2" />
        New Appointment
      </router-link>
    </div>

    <!-- Filters and Search -->
    <div class="card mb-6">
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div class="md:col-span-2">
            <label class="form-label">Search</label>
            <div class="relative">
              <Search class="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                v-model="filters.searchQuery"
                type="text"
                placeholder="Search by customer name, address, or postcode..."
                class="pl-10"
                @input="debouncedSearch"
              />
            </div>
          </div>

          <!-- Status Filter -->
          <div>
            <label class="form-label">Status</label>
            <select v-model="filters.status" @change="applyFilters">
              <option value="">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </div>

          <!-- Date Range -->
          <div>
            <label class="form-label">Date Range</label>
            <select v-model="dateRange" @change="handleDateRangeChange">
              <option value="">All Dates</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="this_week">This Week</option>
              <option value="next_week">Next Week</option>
              <option value="this_month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>

        <!-- Custom Date Range -->
        <div v-if="dateRange === 'custom'" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label class="form-label">Start Date</label>
            <input
              v-model="filters.startDate"
              type="date"
              @change="applyFilters"
            />
          </div>
          <div>
            <label class="form-label">End Date</label>
            <input
              v-model="filters.endDate"
              type="date"
              @change="applyFilters"
            />
          </div>
        </div>

        <!-- Filter Actions -->
        <div class="flex items-center justify-between mt-4">
          <div class="text-sm text-gray-600">
            Showing {{ filteredAppointments.length }} 
            {{ filteredAppointments.length === 1 ? 'appointment' : 'appointments' }}
          </div>
          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Appointments List -->
    <div class="space-y-4">
      <!-- Loading State -->
      <div v-if="appointmentsStore.isLoading" class="flex justify-center py-12">
        <div class="spinner w-8 h-8"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredAppointments.length === 0" class="card">
        <div class="card-body text-center py-12">
          <Calendar class="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            {{ hasActiveFilters ? 'No appointments found' : 'No appointments yet' }}
          </h3>
          <p class="text-gray-600 mb-6">
            {{ hasActiveFilters 
              ? 'Try adjusting your filters to see more results.' 
              : 'Create your first appointment to get started.' 
            }}
          </p>
          <router-link 
            v-if="!hasActiveFilters"
            to="/appointments/create" 
            class="btn-primary"
          >
            <Plus class="w-4 h-4 mr-2" />
            Create First Appointment
          </router-link>
          <button 
            v-else
            @click="clearFilters"
            class="btn-outline"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <!-- Appointments Cards -->
      <div v-else class="space-y-4">
        <div
          v-for="appointment in paginatedAppointments"
          :key="appointment.id"
          class="card hover:shadow-md transition-shadow duration-200 relative"
        >
          <div class="card-body">
            <div class="flex items-start justify-between">
              <!-- Appointment Info -->
              <div class="flex-1">
                <div class="flex items-start space-x-4">
                  <!-- Status Indicator -->
                  <div class="flex-shrink-0 mt-1">
                    <div 
                      class="w-3 h-3 rounded-full"
                      :class="getStatusColor(appointment.status)"
                    ></div>
                  </div>
                  <!-- Details -->
                  <div class="flex-1">
                    <div class="flex items-center space-x-3 mb-2">
                      <h3 class="text-lg font-semibold text-gray-900">
                        {{ appointment.customerName }}
                      </h3>
                      <span :class="getStatusClass(appointment.status)">
                        {{ formatStatus(appointment.status) }}
                      </span>
                      <span v-if="appointment.agent" class="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Agent: {{ appointment.agent.firstName }} {{ appointment.agent.lastName }}
                      </span>
                    </div>
                    <div class="space-y-2">
                      <div class="flex items-center text-gray-600">
                        <MapPin class="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{{ appointment.propertyAddress }}</span>
                      </div>
                      <div class="flex items-center text-gray-600">
                        <Calendar class="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{{ formatDateTime(appointment.appointmentDate, appointment.appointmentTime) }}</span>
                      </div>
                      <div class="flex items-center space-x-6 text-sm text-gray-500">
                        <div class="flex items-center">
                          <Phone class="w-4 h-4 mr-1" />
                          <span>{{ appointment.customerPhone }}</span>
                        </div>
                        <div v-if="appointment.customerEmail" class="flex items-center">
                          <Mail class="w-4 h-4 mr-1" />
                          <span>{{ appointment.customerEmail }}</span>
                        </div>
                        <div class="flex items-center">
                          <Navigation class="w-4 h-4 mr-1" />
                          <span>{{ appointment.distanceKm }}km away</span>
                        </div>
                      </div>
                      <div v-if="appointment.notes" class="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mt-3">
                        <strong>Notes:</strong> {{ appointment.notes }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Actions -->
              <div class="flex-shrink-0 ml-6 flex flex-col items-end">
                <div class="flex items-center space-x-2">
                  <!-- View Details -->
                  <router-link
                    :to="`/appointments/${appointment.id}`"
                    class="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50"
                    title="View Details"
                  >
                    <Eye class="w-4 h-4" />
                  </router-link>
                  <!-- Edit -->
                  <button
                    @click="editAppointment(appointment)"
                    class="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50"
                    title="Edit Appointment"
                  >
                    <Edit class="w-4 h-4" />
                  </button>
                  <!-- Delete -->
                  <button
                    @click="confirmDelete(appointment)"
                    class="p-2 text-gray-400 hover:text-error-600 rounded-lg hover:bg-error-50"
                    title="Delete Appointment"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                  <!-- Status Actions -->
                  <div class="relative">
                    <button
                      @click="toggleStatusMenu(appointment.id)"
                      class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      title="Change Status"
                    >
                      <MoreVertical class="w-4 h-4" />
                    </button>
                    <!-- Status Dropdown -->
                    <div
                      v-if="activeStatusMenu === appointment.id"
                      v-click-outside="() => activeStatusMenu = null"
                      class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                    >
                      <button
                        v-for="status in availableStatuses"
                        :key="status.value"
                        @click="updateStatus(appointment, status.value)"
                        class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        :class="{ 'bg-primary-50 text-primary-700': appointment.status === status.value }"
                      >
                        <span :class="status.color" class="w-2 h-2 rounded-full mr-3"></span>
                        {{ status.label }}
                      </button>
                    </div>
                  </div>
                </div>
                <!-- Assign/Claim for Unassigned, bottom right -->
                <div v-if="appointment.status === 'unassigned'" class="absolute bottom-4 right-4 flex flex-col space-y-2 z-10">
                  <button @click="openAssignPopup(appointment)" class="btn-primary btn-xs">Assign To</button>
                  <button @click="claimAppointment(appointment)" class="btn-success btn-xs">Claim</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

    <!-- Assign Agent Popup -->
    <div v-if="showAssignPopup" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Assign Appointment</h3>
        <div v-if="isLoadingAgents" class="flex justify-center py-4">
          <div class="spinner w-6 h-6"></div>
        </div>
        <div v-else>
          <ul class="divide-y divide-gray-200 max-h-60 overflow-y-auto mb-4">
            <li v-for="agent in agents" :key="agent.id" class="py-2 flex items-center justify-between">
              <span>{{ agent.firstName }} {{ agent.lastName }}</span>
              <button @click="assignToAgent(agent.id)" class="btn-primary btn-sm">Assign</button>
            </li>
          </ul>
          <button @click="showAssignPopup = false" class="btn-outline w-full">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-8 flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to 
        {{ Math.min(currentPage * itemsPerPage, filteredAppointments.length) }} of 
        {{ filteredAppointments.length }} results
      </div>
      
      <div class="flex items-center space-x-2">
        <button
          @click="currentPage = currentPage - 1"
          :disabled="currentPage === 1"
          class="btn-outline px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft class="w-4 h-4" />
        </button>
        
        <span class="text-sm text-gray-700">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        
        <button
          @click="currentPage = currentPage + 1"
          :disabled="currentPage === totalPages"
          class="btn-outline px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="appointmentToDelete"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Delete Appointment</h3>
        <p class="text-gray-600 mb-6">
          Are you sure you want to delete the appointment with 
          <strong>{{ appointmentToDelete.customerName }}</strong>? 
          This action cannot be undone.
        </p>
        <div class="flex justify-end space-x-3">
          <button
            @click="appointmentToDelete = null"
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
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppointmentsStore } from '@/stores/appointments'
import { 
  Plus, Search, Calendar, MapPin, Phone, Mail, Navigation, Eye, Edit, Trash2, 
  MoreVertical, ChevronLeft, ChevronRight
} from 'lucide-vue-next'
import { format, parseISO, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

import apiClient, { API_ENDPOINTS, apiHelpers } from '@/config/api'
import { useAuthStore } from '@/stores/auth'

// Router and stores
const router = useRouter()
const appointmentsStore = useAppointmentsStore()
const authStore = useAuthStore()
// Assign/Claim logic
const showAssignPopup = ref(false)
const agents = ref([])
const isLoadingAgents = ref(false)
let assignTargetAppointment = null

const openAssignPopup = async (appointment) => {
  showAssignPopup.value = true
  isLoadingAgents.value = true
  assignTargetAppointment = appointment
  try {
    const response = await apiClient.get(API_ENDPOINTS.AGENTS.BASE)
    if (apiHelpers.isSuccess(response)) {
      agents.value = apiHelpers.extractData(response).agents
    }
  } catch (e) {
    agents.value = []
  } finally {
    isLoadingAgents.value = false
  }
}

const assignToAgent = async (agentId) => {
  if (!assignTargetAppointment) return
  try {
    await appointmentsStore.updateAppointment(assignTargetAppointment.id, { agentId })
    showAssignPopup.value = false
    assignTargetAppointment = null
    await appointmentsStore.fetchAppointments()
  } catch (e) {
    // handle error
  }
}

const claimAppointment = async (appointment) => {
  try {
    await appointmentsStore.updateAppointment(appointment.id, { agentId: authStore.user.id })
    await appointmentsStore.fetchAppointments()
  } catch (e) {
    // handle error
  }
}

// Component state
const dateRange = ref('')
const activeStatusMenu = ref(null)
const appointmentToDelete = ref(null)
const currentPage = ref(1)
const itemsPerPage = 20

// Filters
const filters = reactive({
  searchQuery: '',
  status: '',
  startDate: '',
  endDate: ''
})

// Available statuses for status dropdown
const availableStatuses = [
  { value: 'scheduled', label: 'Scheduled', color: 'bg-primary-500' },
  { value: 'completed', label: 'Completed', color: 'bg-success-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-error-500' },
  { value: 'no_show', label: 'No Show', color: 'bg-warning-500' },
  { value: 'unassigned', label: 'Unassigned', color: 'bg-gray-400' }
]

// Computed properties
const filteredAppointments = computed(() => {
  return appointmentsStore.filteredAppointments
})

const paginatedAppointments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredAppointments.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredAppointments.value.length / itemsPerPage)
})

const hasActiveFilters = computed(() => {
  return filters.searchQuery || filters.status || filters.startDate || filters.endDate
})

// Debounced search function
let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 300)
}

// Helper functions
const getStatusColor = (status) => {
  const colors = {
    scheduled: 'bg-primary-500',
    completed: 'bg-success-500',
    cancelled: 'bg-error-500',
    no_show: 'bg-warning-500',
    unassigned: 'bg-gray-400'
  }
  return colors[status] || 'bg-gray-500'
}

const getStatusClass = (status) => {
  const classes = {
    scheduled: 'status-scheduled',
    completed: 'status-completed',
    cancelled: 'status-cancelled',
    no_show: 'status-no-show',
    unassigned: 'status-unassigned'
  }
  return classes[status] || 'status-scheduled'
}

const formatStatus = (status) => {
  const statusMap = {
    scheduled: 'Scheduled',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'No Show',
    unassigned: 'Unassigned'
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

// Filter functions
const handleDateRangeChange = () => {
  const today = new Date()
  
  switch (dateRange.value) {
    case 'today':
      filters.startDate = format(today, 'yyyy-MM-dd')
      filters.endDate = format(today, 'yyyy-MM-dd')
      break
    case 'tomorrow':
      const tomorrow = addDays(today, 1)
      filters.startDate = format(tomorrow, 'yyyy-MM-dd')
      filters.endDate = format(tomorrow, 'yyyy-MM-dd')
      break
    case 'this_week':
      filters.startDate = format(startOfWeek(today), 'yyyy-MM-dd')
      filters.endDate = format(endOfWeek(today), 'yyyy-MM-dd')
      break
    case 'next_week':
      const nextWeek = addDays(today, 7)
      filters.startDate = format(startOfWeek(nextWeek), 'yyyy-MM-dd')
      filters.endDate = format(endOfWeek(nextWeek), 'yyyy-MM-dd')
      break
    case 'this_month':
      filters.startDate = format(startOfMonth(today), 'yyyy-MM-dd')
      filters.endDate = format(endOfMonth(today), 'yyyy-MM-dd')
      break
    case '':
      filters.startDate = ''
      filters.endDate = ''
      break
  }
  
  if (dateRange.value !== 'custom') {
    applyFilters()
  }
}

const applyFilters = () => {
  appointmentsStore.updateFilters(filters)
  currentPage.value = 1 // Reset to first page when filtering
}

const clearFilters = () => {
  Object.assign(filters, {
    searchQuery: '',
    status: '',
    startDate: '',
    endDate: ''
  })
  dateRange.value = ''
  appointmentsStore.clearFilters()
  currentPage.value = 1
}

// Action functions
const toggleStatusMenu = (appointmentId) => {
  activeStatusMenu.value = activeStatusMenu.value === appointmentId ? null : appointmentId
}

const editAppointment = (appointment) => {
  router.push(`/appointments/${appointment.id}/edit`)
}

const confirmDelete = (appointment) => {
  appointmentToDelete.value = appointment
}

const deleteAppointment = async () => {
  try {
    await appointmentsStore.deleteAppointment(appointmentToDelete.value.id)
    appointmentToDelete.value = null
    console.log('✅ Appointment deleted successfully')
  } catch (error) {
    console.error('❌ Failed to delete appointment:', error)
  }
}

const updateStatus = async (appointment, newStatus) => {
  try {
    await appointmentsStore.updateAppointment(appointment.id, { status: newStatus })
    activeStatusMenu.value = null
    console.log('✅ Appointment status updated')
  } catch (error) {
    console.error('❌ Failed to update status:', error)
  }
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

// Load data on component mount
onMounted(async () => {
  try {
    console.log('📋 Loading appointments...')
    await appointmentsStore.fetchAppointments()
    console.log('✅ Appointments loaded')
  } catch (error) {
    console.error('❌ Failed to load appointments:', error)
  }
})
</script>