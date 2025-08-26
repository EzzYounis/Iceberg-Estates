<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full text-center">
      <!-- 404 Icon -->
      <div class="mb-8">
        <div class="h-24 w-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle class="h-12 w-12 text-primary-600" />
        </div>
        <h1 class="text-6xl font-bold text-gray-900 mb-2">404</h1>
        <h2 class="text-2xl font-semibold text-gray-700">Page Not Found</h2>
      </div>

      <!-- Error Message -->
      <div class="mb-8">
        <p class="text-gray-600 mb-4">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or the URL might be incorrect.
        </p>
        <p class="text-sm text-gray-500">
          Error: <code class="bg-gray-100 px-2 py-1 rounded text-xs">{{ $route.fullPath }}</code>
        </p>
      </div>

      <!-- Actions -->
      <div class="space-y-4">
        <router-link to="/" class="btn-primary w-full">
          <Home class="w-4 h-4 mr-2" />
          Back to Dashboard
        </router-link>
        
        <router-link to="/appointments" class="btn-outline w-full">
          <Calendar class="w-4 h-4 mr-2" />
          View Appointments
        </router-link>
        
        <button @click="goBack" class="btn-outline w-full">
          <ArrowLeft class="w-4 h-4 mr-2" />
          Go Back
        </button>
      </div>

      <!-- Help Text -->
      <div class="mt-8 text-sm text-gray-500">
        <p>If you believe this is an error, please contact support.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { AlertTriangle, Home, Calendar, ArrowLeft } from 'lucide-vue-next'

const router = useRouter()

const goBack = () => {
  // Go back in history if possible, otherwise go to dashboard
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script>