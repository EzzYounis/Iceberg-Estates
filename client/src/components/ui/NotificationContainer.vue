<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <div
      v-for="notification in notifications"
      :key="notification.id"
      :class="notificationClasses(notification.type)"
      class="max-w-sm p-4 rounded-lg shadow-lg animate-slide-up"
    >
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <component :is="getIcon(notification.type)" class="h-5 w-5" />
        </div>
        <div class="ml-3 flex-1">
          <p class="text-sm font-medium">{{ notification.title }}</p>
          <p v-if="notification.message" class="mt-1 text-sm">{{ notification.message }}</p>
        </div>
        <div class="ml-4 flex-shrink-0">
          <button
            @click="removeNotification(notification.id)"
            class="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-vue-next'

// Notification state
const notifications = ref([])

// Computed classes for different notification types
const notificationClasses = (type) => {
  const base = 'border-l-4'
  const classes = {
    success: `${base} bg-success-50 border-success-500 text-success-800`,
    error: `${base} bg-error-50 border-error-500 text-error-800`,
    warning: `${base} bg-warning-50 border-warning-500 text-warning-800`,
    info: `${base} bg-primary-50 border-primary-500 text-primary-800`
  }
  return classes[type] || classes.info
}

// Get icon component for notification type
const getIcon = (type) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  }
  return icons[type] || Info
}

// Add notification
const addNotification = (notification) => {
  const id = Date.now().toString()
  notifications.value.push({
    id,
    ...notification
  })
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    removeNotification(id)
  }, 5000)
  
  return id
}

// Remove notification
const removeNotification = (id) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

// Expose methods to parent components
defineExpose({
  addNotification,
  removeNotification
})
</script>