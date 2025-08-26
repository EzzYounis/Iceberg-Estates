<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div class="flex justify-center mb-6">
          <div class="h-16 w-16 bg-primary-600 rounded-xl flex items-center justify-center">
            <span class="text-white font-bold text-2xl">I</span>
          </div>
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h2>
        <p class="text-gray-600">Join Iceberg Estates as a property agent</p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="bg-error-50 border border-error-200 rounded-lg p-4">
        <div class="flex">
          <div class="ml-3">
            <p class="text-sm text-error-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Registration Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="card p-8">
          <!-- Name Fields -->
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group">
              <label for="firstName" class="form-label">
                First Name
              </label>
              <input
                id="firstName"
                v-model="form.firstName"
                type="text"
                autocomplete="given-name"
                required
                :class="{ 'border-error-500 focus:ring-error-500': errors.firstName }"
                placeholder="John"
              >
              <p v-if="errors.firstName" class="form-error">{{ errors.firstName }}</p>
            </div>

            <div class="form-group">
              <label for="lastName" class="form-label">
                Last Name
              </label>
              <input
                id="lastName"
                v-model="form.lastName"
                type="text"
                autocomplete="family-name"
                required
                :class="{ 'border-error-500 focus:ring-error-500': errors.lastName }"
                placeholder="Smith"
              >
              <p v-if="errors.lastName" class="form-error">{{ errors.lastName }}</p>
            </div>
          </div>

          <!-- Email Field -->
          <div class="form-group">
            <label for="email" class="form-label">
              Email Address
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              autocomplete="email"
              required
              :class="{ 'border-error-500 focus:ring-error-500': errors.email }"
              placeholder="john.smith@icebergestates.com"
            >
            <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
            <p class="form-help">Use your business email address</p>
          </div>

          <!-- Phone Field -->
          <div class="form-group">
            <label for="phoneNumber" class="form-label">
              Phone Number
            </label>
            <input
              id="phoneNumber"
              v-model="form.phoneNumber"
              type="tel"
              autocomplete="tel"
              :class="{ 'border-error-500 focus:ring-error-500': errors.phoneNumber }"
              placeholder="07700 900 123"
            >
            <p v-if="errors.phoneNumber" class="form-error">{{ errors.phoneNumber }}</p>
            <p class="form-help">UK mobile number (optional)</p>
          </div>

          <!-- Password Field -->
          <div class="form-group">
            <label for="password" class="form-label">
              Password
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                required
                :class="{ 'border-error-500 focus:ring-error-500': errors.password }"
                placeholder="Create a strong password"
              >
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <Eye v-if="!showPassword" class="h-4 w-4 text-gray-400" />
                <EyeOff v-else class="h-4 w-4 text-gray-400" />
              </button>
            </div>
            <p v-if="errors.password" class="form-error">{{ errors.password }}</p>
            
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

          <!-- Confirm Password Field -->
          <div class="form-group">
            <label for="confirmPassword" class="form-label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              :class="{ 'border-error-500 focus:ring-error-500': errors.confirmPassword }"
              placeholder="Confirm your password"
            >
            <p v-if="errors.confirmPassword" class="form-error">{{ errors.confirmPassword }}</p>
          </div>

          <!-- Terms and Conditions -->
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input
                id="terms"
                v-model="form.acceptTerms"
                type="checkbox"
                required
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              >
            </div>
            <div class="ml-3 text-sm">
              <label for="terms" class="text-gray-700">
                I agree to the 
                <a href="#" class="text-primary-600 hover:text-primary-500 font-medium">Terms of Service</a> 
                and 
                <a href="#" class="text-primary-600 hover:text-primary-500 font-medium">Privacy Policy</a>
              </label>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="authStore.isRegistering || !isFormValid"
            class="btn-primary w-full"
            :class="{ 'opacity-50 cursor-not-allowed': !isFormValid }"
          >
            <div v-if="authStore.isRegistering" class="flex items-center justify-center">
              <div class="spinner w-4 h-4 mr-2"></div>
              Creating Account...
            </div>
            <span v-else>Create Account</span>
          </button>
        </div>
      </form>

      <!-- Login Link -->
      <div class="text-center">
        <p class="text-gray-600">
          Already have an account?
          <router-link to="/login" class="text-primary-600 hover:text-primary-500 font-medium">
            Sign in here
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Eye, EyeOff } from 'lucide-vue-next'

// Router and stores
const router = useRouter()
const authStore = useAuthStore()

// Component state
const showPassword = ref(false)
const error = ref('')
const errors = reactive({})

// Form data
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

// Password strength calculation
const passwordStrength = computed(() => {
  const password = form.password
  let strength = 0
  
  if (password.length >= 8) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++
  
  return Math.min(strength, 4)
})

// Form validation
const isFormValid = computed(() => {
  return form.firstName && 
         form.lastName && 
         form.email && 
         form.password && 
         form.confirmPassword && 
         form.acceptTerms &&
         Object.keys(errors).length === 0
})

// Password strength helpers
const getStrengthColor = (strength) => {
  const colors = ['bg-error-500', 'bg-warning-500', 'bg-yellow-500', 'bg-success-500']
  return colors[strength - 1] || 'bg-gray-200'
}

const getStrengthText = (strength) => {
  const texts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
  return texts[strength] || 'Enter a password'
}

// Form validation
const validateForm = () => {
  // Clear previous errors
  Object.keys(errors).forEach(key => delete errors[key])
  
  // First name validation
  if (!form.firstName) {
    errors.firstName = 'First name is required'
  } else if (form.firstName.length < 2) {
    errors.firstName = 'First name must be at least 2 characters'
  } else if (!/^[a-zA-Z\s'-]+$/.test(form.firstName)) {
    errors.firstName = 'First name can only contain letters, spaces, hyphens, and apostrophes'
  }
  
  // Last name validation
  if (!form.lastName) {
    errors.lastName = 'Last name is required'
  } else if (form.lastName.length < 2) {
    errors.lastName = 'Last name must be at least 2 characters'
  } else if (!/^[a-zA-Z\s'-]+$/.test(form.lastName)) {
    errors.lastName = 'Last name can only contain letters, spaces, hyphens, and apostrophes'
  }
  
  // Email validation
  if (!form.email) {
    errors.email = 'Email is required'
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Please enter a valid email address'
  }
  
  // Phone number validation (optional)
  if (form.phoneNumber && !/^(\+44|0)[0-9\s-]{10,}$/.test(form.phoneNumber.replace(/\s/g, ''))) {
    errors.phoneNumber = 'Please enter a valid UK phone number'
  }
  
  // Password validation
  if (!form.password) {
    errors.password = 'Password is required'
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
    errors.password = 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
  }
  
  // Confirm password validation
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }
  
  return Object.keys(errors).length === 0
}

// Handle form submission
const handleSubmit = async () => {
  // Clear previous error
  error.value = ''
  
  // Validate form
  if (!validateForm()) {
    return
  }
  
  if (!form.acceptTerms) {
    error.value = 'Please accept the terms and conditions'
    return
  }
  
  try {
    console.log('📝 Attempting registration...')
    
    // Attempt registration
    const result = await authStore.register({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phoneNumber: form.phoneNumber || null,
      password: form.password
    })
    
    if (result.success) {
      console.log('Registration successful')
      
      // Redirect to dashboard
      await router.push('/')
    }
    
  } catch (err) {
    console.error('Registration failed:', err)
    error.value = err.message || 'Registration failed. Please try again.'
  }
}
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