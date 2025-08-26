<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Profile Settings</h1>
      <p class="text-gray-600 mt-1">Manage your account information and preferences</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Profile Information -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Personal Information -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-semibold text-gray-900 flex items-center">
              <User class="w-5 h-5 mr-2" />
              Personal Information
            </h2>
          </div>
          
          <div class="card-body">
            <form @submit.prevent="updateProfile" class="space-y-6">
              <!-- Success Message -->
              <div v-if="successMessage" class="bg-success-50 border border-success-200 rounded-lg p-4">
                <div class="flex">
                  <CheckCircle class="h-5 w-5 text-success-400 mt-0.5" />
                  <div class="ml-3">
                    <p class="text-sm text-success-700">{{ successMessage }}</p>
                  </div>
                </div>
              </div>

              <!-- Error Message -->
              <div v-if="profileError" class="bg-error-50 border border-error-200 rounded-lg p-4">
                <div class="flex">
                  <AlertCircle class="h-5 w-5 text-error-400 mt-0.5" />
                  <div class="ml-3">
                    <p class="text-sm text-error-700">{{ profileError }}</p>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- First Name -->
                <div class="form-group">
                  <label for="firstName" class="form-label">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    v-model="profileForm.firstName"
                    type="text"
                    required
                    :class="{ 'border-error-500 focus:ring-error-500': profileFieldErrors.firstName }"
                  />
                  <p v-if="profileFieldErrors.firstName" class="form-error">{{ profileFieldErrors.firstName }}</p>
                </div>

                <!-- Last Name -->
                <div class="form-group">
                  <label for="lastName" class="form-label">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    v-model="profileForm.lastName"
                    type="text"
                    required
                    :class="{ 'border-error-500 focus:ring-error-500': profileFieldErrors.lastName }"
                  />
                  <p v-if="profileFieldErrors.lastName" class="form-error">{{ profileFieldErrors.lastName }}</p>
                </div>
              </div>

              <!-- Email -->
              <div class="form-group">
                <label for="email" class="form-label">
                  Email Address
                </label>
                <input
                  id="email"
                  v-model="profileForm.email"
                  type="email"
                  required
                  disabled
                  class="bg-gray-50 cursor-not-allowed"
                />
                <p class="form-help">Email cannot be changed. Contact support if needed.</p>
              </div>

              <!-- Phone Number -->
              <div class="form-group">
                <label for="phoneNumber" class="form-label">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  v-model="profileForm.phoneNumber"
                  type="tel"
                  :class="{ 'border-error-500 focus:ring-error-500': profileFieldErrors.phoneNumber }"
                  placeholder="07700 900 123"
                />
                <p v-if="profileFieldErrors.phoneNumber" class="form-error">{{ profileFieldErrors.phoneNumber }}</p>
                <p class="form-help">UK mobile number for client contact</p>
              </div>

              <!-- Submit Button -->
              <div class="flex justify-end">
                <button
                  type="submit"
                  :disabled="authStore.isLoading || !isProfileFormValid"
                  class="btn-primary disabled:opacity-50"
                >
                  <div v-if="authStore.isLoading" class="flex items-center">
                    <div class="spinner w-4 h-4 mr-2"></div>
                    Updating...
                  </div>
                  <span v-else class="flex items-center">
                    <Save class="w-4 h-4 mr-2" />
                    Update Profile
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Change Password -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-semibold text-gray-900 flex items-center">
              <Lock class="w-5 h-5 mr-2" />
              Change Password
            </h2>
          </div>
          
          <div class="card-body">
            <form @submit.prevent="changePassword" class="space-y-6">
              <!-- Password Success Message -->
              <div v-if="passwordSuccessMessage" class="bg-success-50 border border-success-200 rounded-lg p-4">
                <div class="flex">
                  <CheckCircle class="h-5 w-5 text-success-400 mt-0.5" />
                  <div class="ml-3">
                    <p class="text-sm text-success-700">{{ passwordSuccessMessage }}</p>
                  </div>
                </div>
              </div>

              <!-- Password Error Message -->
              <div v-if="passwordError" class="bg-error-50 border border-error-200 rounded-lg p-4">
                <div class="flex">
                  <AlertCircle class="h-5 w-5 text-error-400 mt-0.5" />
                  <div class="ml-3">
                    <p class="text-sm text-error-700">{{ passwordError }}</p>
                  </div>
                </div>
              </div>

              <!-- Current Password -->
              <div class="form-group">
                <label for="currentPassword" class="form-label">
                  Current Password
                </label>
                <div class="relative">
                  <input
                    id="currentPassword"
                    v-model="passwordForm.currentPassword"
                    :type="showCurrentPassword ? 'text' : 'password'"
                    required
                    :class="{ 'border-error-500 focus:ring-error-500': passwordFieldErrors.currentPassword }"
                  />
                  <button
                    type="button"
                    @click="showCurrentPassword = !showCurrentPassword"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <Eye v-if="!showCurrentPassword" class="h-4 w-4 text-gray-400" />
                    <EyeOff v-else class="h-4 w-4 text-gray-400" />
                  </button>
                </div>
                <p v-if="passwordFieldErrors.currentPassword" class="form-error">{{ passwordFieldErrors.currentPassword }}</p>
              </div>

              <!-- New Password -->
              <div class="form-group">
                <label for="newPassword" class="form-label">
                  New Password
                </label>
                <div class="relative">
                  <input
                    id="newPassword"
                    v-model="passwordForm.newPassword"
                    :type="showNewPassword ? 'text' : 'password'"
                    required
                    :class="{ 'border-error-500 focus:ring-error-500': passwordFieldErrors.newPassword }"
                  />
                  <button
                    type="button"
                    @click="showNewPassword = !showNewPassword"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <Eye v-if="!showNewPassword" class="h-4 w-4 text-gray-400" />
                    <EyeOff v-else class="h-4 w-4 text-gray-400" />
                  </button>
                </div>
                <p v-if="passwordFieldErrors.newPassword" class="form-error">{{ passwordFieldErrors.newPassword }}</p>
                
                <!-- Password Strength Indicator -->
                <div class="mt-2">
                  <div class="flex space-x-1">
                    <div 
                      v-for="i in 4" 
                      :key="i" 
                      class="flex-1 h-1 rounded"
                      :class="i <= passwordStrength ? getStrengthColor(passwordStrength) : 'bg-gray-200'"
                    ></div>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">
                    {{ getStrengthText(passwordStrength) }}
                  </p>
                </div>
              </div>

              <!-- Confirm New Password -->
              <div class="form-group">
                <label for="confirmPassword" class="form-label">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  required
                  :class="{ 'border-error-500 focus:ring-error-500': passwordFieldErrors.confirmPassword }"
                />
                <p v-if="passwordFieldErrors.confirmPassword" class="form-error">{{ passwordFieldErrors.confirmPassword }}</p>
              </div>

              <!-- Submit Button -->
              <div class="flex justify-end">
                <button
                  type="submit"
                  :disabled="isChangingPassword || !isPasswordFormValid"
                  class="btn-primary disabled:opacity-50"
                >
                  <div v-if="isChangingPassword" class="flex items-center">
                    <div class="spinner w-4 h-4 mr-2"></div>
                    Changing...
                  </div>
                  <span v-else class="flex items-center">
                    <Lock class="w-4 h-4 mr-2" />
                    Change Password
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="lg:col-span-1 space-y-6">
        <!-- Profile Summary -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-semibold text-gray-900">Profile Summary</h2>
          </div>
          <div class="card-body text-center">
            <!-- Avatar -->
            <div class="mb-4">
              <div class="h-20 w-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto">
                <span class="text-white text-2xl font-medium">{{ authStore.userInitials }}</span>
              </div>
            </div>
            
            <!-- User Info -->
            <div class="space-y-2">
              <h3 class="text-lg font-semibold text-gray-900">{{ authStore.userFullName }}</h3>
              <p class="text-sm text-gray-600">{{ authStore.user?.email }}</p>
              <p class="text-xs text-gray-500">Estate Agent</p>
            </div>

            <!-- Account Stats -->
            <div class="mt-6 pt-6 border-t border-gray-200">
              <div class="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p class="text-2xl font-bold text-primary-600">{{ appointmentStats.total }}</p>
                  <p class="text-xs text-gray-600">Total Appointments</p>
                </div>
                <div>
                  <p class="text-2xl font-bold text-success-600">{{ appointmentStats.completionRate }}%</p>
                  <p class="text-xs text-gray-600">Completion Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Account Actions -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-semibold text-gray-900">Account Actions</h2>
          </div>
          <div class="card-body space-y-3">
            <button
              @click="refreshProfile"
              class="btn-outline w-full"
              :disabled="authStore.isLoading"
            >
              <RotateCcw class="w-4 h-4 mr-2" />
              Refresh Profile
            </button>
            
            <button
              @click="exportData"
              class="btn-outline w-full"
            >
              <Download class="w-4 h-4 mr-2" />
              Export Data
            </button>
            
            <hr class="my-4">
            
            <button
              @click="confirmLogout"
              class="btn-error w-full"
            >
              <LogOut class="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>

        <!-- Help & Support -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-semibold text-gray-900">Help & Support</h2>
          </div>
          <div class="card-body space-y-3">
            <a href="#" class="flex items-center text-sm text-gray-600 hover:text-primary-600">
              <HelpCircle class="w-4 h-4 mr-2" />
              Help Documentation
            </a>
            
            <a href="#" class="flex items-center text-sm text-gray-600 hover:text-primary-600">
              <Mail class="w-4 h-4 mr-2" />
              Contact Support
            </a>
            
            <a href="#" class="flex items-center text-sm text-gray-600 hover:text-primary-600">
              <MessageSquare class="w-4 h-4 mr-2" />
              Send Feedback
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Logout Confirmation Modal -->
    <div
      v-if="showLogoutConfirm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Sign Out</h3>
        <p class="text-gray-600 mb-6">
          Are you sure you want to sign out of your account?
        </p>
        <div class="flex justify-end space-x-3">
          <button
            @click="showLogoutConfirm = false"
            class="btn-outline"
          >
            Cancel
          </button>
          <button
            @click="logout"
            class="btn-error"
          >
            <LogOut class="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppointmentsStore } from '@/stores/appointments'
import { 
  User, Lock, Save, Eye, EyeOff, CheckCircle, AlertCircle, RotateCcw, 
  Download, LogOut, HelpCircle, Mail, MessageSquare
} from 'lucide-vue-next'

// Router and stores
const router = useRouter()
const authStore = useAuthStore()
const appointmentsStore = useAppointmentsStore()

// Component state
const successMessage = ref('')
const profileError = ref('')
const passwordSuccessMessage = ref('')
const passwordError = ref('')
const profileFieldErrors = reactive({})
const passwordFieldErrors = reactive({})
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const isChangingPassword = ref(false)
const showLogoutConfirm = ref(false)

// Form data
const profileForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Computed properties
const isProfileFormValid = computed(() => {
  return profileForm.firstName && profileForm.lastName && profileForm.email
})

const isPasswordFormValid = computed(() => {
  return passwordForm.currentPassword && 
         passwordForm.newPassword && 
         passwordForm.confirmPassword &&
         passwordForm.newPassword === passwordForm.confirmPassword
})

const passwordStrength = computed(() => {
  const password = passwordForm.newPassword
  let strength = 0
  
  if (password.length >= 8) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++
  
  return Math.min(strength, 4)
})

const appointmentStats = computed(() => {
  return appointmentsStore.appointmentStats
})

// Helper functions
const getStrengthColor = (strength) => {
  const colors = ['bg-error-500', 'bg-warning-500', 'bg-yellow-500', 'bg-success-500']
  return colors[strength - 1] || 'bg-gray-200'
}

const getStrengthText = (strength) => {
  const texts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
  return texts[strength] || 'Enter a password'
}

// Initialize form data
const initializeProfileForm = () => {
  if (authStore.user) {
    profileForm.firstName = authStore.user.firstName || ''
    profileForm.lastName = authStore.user.lastName || ''
    profileForm.email = authStore.user.email || ''
    profileForm.phoneNumber = authStore.user.phoneNumber || ''
  }
}

// Form submission functions
const updateProfile = async () => {
  successMessage.value = ''
  profileError.value = ''
  Object.keys(profileFieldErrors).forEach(key => delete profileFieldErrors[key])

  try {
    console.log('👤 Updating profile...')
    
    // This would normally call the API to update profile
    // For now we'll simulate success
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    successMessage.value = 'Profile updated successfully!'
    console.log('✅ Profile updated')
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 5000)
    
  } catch (error) {
    console.error('❌ Failed to update profile:', error)
    profileError.value = error.message || 'Failed to update profile'
  }
}

const changePassword = async () => {
  passwordSuccessMessage.value = ''
  passwordError.value = ''
  Object.keys(passwordFieldErrors).forEach(key => delete passwordFieldErrors[key])

  // Validate passwords match
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordFieldErrors.confirmPassword = 'Passwords do not match'
    return
  }

  // Check password strength
  if (passwordStrength.value < 2) {
    passwordFieldErrors.newPassword = 'Password is too weak'
    return
  }

  isChangingPassword.value = true

  try {
    console.log('🔒 Changing password...')
    
    // This would normally call the API to change password
    // For now we'll simulate success
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    passwordSuccessMessage.value = 'Password changed successfully!'
    
    // Clear form
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    
    console.log('✅ Password changed')
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      passwordSuccessMessage.value = ''
    }, 5000)
    
  } catch (error) {
    console.error('❌ Failed to change password:', error)
    passwordError.value = error.message || 'Failed to change password'
  } finally {
    isChangingPassword.value = false
  }
}

// Action functions
const refreshProfile = async () => {
  try {
    await authStore.fetchProfile()
    initializeProfileForm()
    successMessage.value = 'Profile refreshed successfully!'
    
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    profileError.value = 'Failed to refresh profile'
  }
}

const exportData = () => {
  // Create export data
  const exportData = {
    profile: authStore.user,
    appointments: appointmentsStore.appointments,
    exportDate: new Date().toISOString()
  }
  
  const dataStr = JSON.stringify(exportData, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
  
  const exportFileDefaultName = `iceberg-estates-data-${new Date().toISOString().split('T')[0]}.json`
  
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
}

const confirmLogout = () => {
  showLogoutConfirm.value = true
}

const logout = async () => {
  try {
    authStore.logout()
    await router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// Initialize component
onMounted(() => {
  initializeProfileForm()
  
  // Load appointment stats if not already loaded
  if (appointmentsStore.appointments.length === 0) {
    appointmentsStore.fetchAppointments()
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