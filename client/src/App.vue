<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Navigation Header -->
    <AppHeader v-if="authStore.isAuthenticated" />
    
    <!-- Main Content Area -->
    <main :class="{ 'pt-16': authStore.isAuthenticated }">
      <!-- Router View - This is where different pages will be displayed -->
      <RouterView />
    </main>
    
    <!-- Global Loading Overlay -->
    <LoadingOverlay v-if="isGlobalLoading" />
    
    <!-- Global Notifications -->
    <NotificationContainer />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Import components (we'll create these next)
import AppHeader from '@/components/layout/AppHeader.vue'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import NotificationContainer from '@/components/ui/NotificationContainer.vue'

// Get auth store
const authStore = useAuthStore()

// Computed properties
const isGlobalLoading = computed(() => {
  return authStore.isLoading || authStore.isLoggingIn || authStore.isRegistering
})

// Initialize app
onMounted(() => {
  console.log(' Iceberg Estates App initializing...')
  
  // Restore authentication state from localStorage
  authStore.initializeAuth()
  
  console.log(' App initialized')
})
</script>

<style>
/* Global styles */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Utility classes */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>