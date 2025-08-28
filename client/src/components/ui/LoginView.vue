<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div class="flex justify-center mb-6">
          
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p class="text-gray-600">Sign in to your Iceberg Estates account</p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="bg-error-50 border border-error-200 rounded-lg p-4">
        <div class="flex">
          <div class="ml-3">
            <p class="text-sm text-error-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="card p-8">
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
              placeholder="agent@icebergestates.com"
            >
            <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
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
                autocomplete="current-password"
                required
                :class="{ 'border-error-500 focus:ring-error-500': errors.password }"
                placeholder="Enter your password"
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
          </div>

          <!-- Remember Me -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember"
                v-model="form.remember"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              >
              <label for="remember" class="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            
            <div class="text-sm">
              <a href="#" class="text-primary-600 hover:text-primary-500 font-medium">
                Forgot password?
              </a>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="authStore.isLoggingIn"
            class="btn-primary w-full"
          >
            <div v-if="authStore.isLoggingIn" class="flex items-center justify-center">
              <div class="spinner w-4 h-4 mr-2"></div>
              Signing in...
            </div>
            <span v-else>Sign In</span>
          </button>
        </div>
      </form>

      <!-- Register Link -->
      <div class="text-center">
        <p class="text-gray-600">
          Don't have an account?
          <router-link to="/register" class="text-primary-600 hover:text-primary-500 font-medium">
            Sign up here
          </router-link>
        </p>
      </div>

      <!-- Demo Credentials (Development Only) -->
      <div v-if="isDevelopment" class="card p-4 bg-gray-50 border-dashed">
        <p class="text-xs text-gray-500 mb-2">Demo Credentials (Development):</p>
        <button
          @click="fillDemoCredentials"
          class="text-xs bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-gray-700"
        >
          Fill Demo Login
        </button>
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
  email: '',
  password: '',
  remember: false
})

// Environment check
const isDevelopment = computed(() => {
  return import.meta.env.MODE === 'development'
})

// Fill demo credentials for development
const fillDemoCredentials = () => {
  form.email = 'test@iceberg.com'
  form.password = 'testpassword123'
}

// Form validation
const validateForm = () => {
  // Clear previous errors
  Object.keys(errors).forEach(key => delete errors[key])
  
  // Email validation
  if (!form.email) {
    errors.email = 'Email is required'
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Please enter a valid email address'
  }
  
  // Password validation
  if (!form.password) {
    errors.password = 'Password is required'
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
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
  
  try {
    console.log(' Attempting login...')
    
    // Attempt login
    const result = await authStore.login({
      email: form.email,
      password: form.password
    })
    
    if (result.success) {
      console.log('✅ Login successful')
      
      // Check if there's a redirect URL
      const redirect = router.currentRoute.value.query.redirect
      
      if (redirect) {
        // Redirect to the original destination
        await router.push(redirect)
      } else {
        // Go to dashboard
        await router.push('/')
      }
    }
    
  } catch (err) {
    console.error('Login failed:', err)
    error.value = err.message || 'Login failed. Please check your credentials and try again.'
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