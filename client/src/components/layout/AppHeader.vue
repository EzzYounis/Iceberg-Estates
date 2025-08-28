<template>
  <header class="fixed top-0 left-0 right-0 z-40 bg-white shadow-soft border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo and Company Name -->
        <div class="flex items-center">
          <router-link to="/" class="flex items-center space-x-3">
            <div class="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-lg">I</span>
            </div>
            <span class="text-xl font-bold text-gray-900">Iceberg Estates</span>
          </router-link>
        </div>
        
        <!-- Navigation Menu -->
        <nav class="hidden md:flex space-x-8">
          <router-link
            to="/"
            class="nav-link"
            :class="$route.name === 'dashboard' ? 'nav-link-active' : 'nav-link-inactive'"
          >
            <Home class="w-4 h-4 mr-2" />
            Dashboard
          </router-link>
          
          <router-link
            to="/appointments"
            class="nav-link"
            :class="$route.name?.includes('appointment') ? 'nav-link-active' : 'nav-link-inactive'"
          >
            <Calendar class="w-4 h-4 mr-2" />
            Appointments
          </router-link>
          
          <router-link
            to="/schedule"
            class="nav-link"
            :class="$route.name === 'schedule' ? 'nav-link-active' : 'nav-link-inactive'"
          >
            <Clock class="w-4 h-4 mr-2" />
            Schedule
          </router-link>
        </nav>
        
        <!-- User Menu -->
        <div class="flex items-center space-x-4">
          <!-- Create Appointment Button -->
          <router-link
            to="/appointments/create"
            class="btn-primary hidden sm:inline-flex"
          >
            <Plus class="w-4 h-4 mr-2" />
            New Appointment
          </router-link>
          
          <!-- User Dropdown -->
          <div class="relative user-dropdown">
            <button
              @click="toggleUserMenu"
              class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <!-- User Avatar -->
              <div class="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span class="text-white text-sm font-medium">{{ authStore.userInitials || 'U' }}</span>
              </div>
              
              <!-- User Name -->
              <span class="hidden sm:block text-sm font-medium text-gray-700">
                {{ authStore.userFullName || 'User' }}
              </span>
              
              <!-- Dropdown Arrow -->
              <ChevronDown class="w-4 h-4 text-gray-500 transition-transform" :class="{ 'rotate-180': showUserMenu }" />
            </button>
            
            <!-- Dropdown Menu -->
            <div
              v-show="showUserMenu"
              class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-fade-in"
            >
              <button
                @click="handleLogout"
                class="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
              >
                <LogOut class="w-4 h-4 mr-3" />
                Logout
              </button>
            </div>
          </div>
          
          <!-- Mobile Menu Button -->
          <button
            @click="showMobileMenu = !showMobileMenu"
            class="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
    
    <!-- Mobile Menu -->
    <div v-if="showMobileMenu" class="md:hidden border-t border-gray-200 bg-white">
      <div class="px-4 py-2 space-y-1">
        <router-link
          to="/"
          class="block px-3 py-2 rounded-md text-base font-medium"
          :class="$route.name === 'dashboard' ? 'bg-primary-100 text-primary-900' : 'text-gray-600 hover:bg-gray-100'"
          @click="showMobileMenu = false"
        >
          Dashboard
        </router-link>
        
        <router-link
          to="/appointments"
          class="block px-3 py-2 rounded-md text-base font-medium"
          :class="$route.name?.includes('appointment') ? 'bg-primary-100 text-primary-900' : 'text-gray-600 hover:bg-gray-100'"
          @click="showMobileMenu = false"
        >
          Appointments
        </router-link>
        
        <router-link
          to="/schedule"
          class="block px-3 py-2 rounded-md text-base font-medium"
          :class="$route.name === 'schedule' ? 'bg-primary-100 text-primary-900' : 'text-gray-600 hover:bg-gray-100'"
          @click="showMobileMenu = false"
        >
          Schedule
        </router-link>
        
        <router-link
          to="/appointments/create"
          class="block px-3 py-2 rounded-md text-base font-medium bg-primary-600 text-white"
          @click="showMobileMenu = false"
        >
          New Appointment
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  Home,
  Calendar,
  Clock,
  Plus,
  User,
  LogOut,
  Menu,
  ChevronDown
} from 'lucide-vue-next'

// Router and stores
const router = useRouter()
const authStore = useAuthStore()

// Component state
const showUserMenu = ref(false)
const showMobileMenu = ref(false)

// Toggle user menu
const toggleUserMenu = () => {
  console.log('Profile clicked, current state:', showUserMenu.value)
  showUserMenu.value = !showUserMenu.value
  console.log('New state:', showUserMenu.value)
}

// Close user menu when clicking outside
const closeUserMenu = () => {
  if (showUserMenu.value) {
    console.log('Closing user menu')
    showUserMenu.value = false
  }
}

// Handle logout
const handleLogout = async () => {
  try {
    showUserMenu.value = false // Close the dropdown
    console.log('Logging out...')
    authStore.logout()
    await router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// Click outside handler
const handleClickOutside = (event) => {
  const dropdown = event.target.closest('.user-dropdown')
  if (!dropdown && showUserMenu.value) {
    closeUserMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>