<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center space-y-4">
      <!-- Loading Spinner -->
      <div class="spinner w-8 h-8"></div>
      
      <!-- Loading Text -->
      <div class="text-center">
        <p class="text-gray-700 font-medium">{{ message }}</p>
        <p v-if="subtitle" class="text-gray-500 text-sm mt-1">{{ subtitle }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
// Props
const props = defineProps({
  message: {
    type: String,
    default: 'Loading...'
  },
  subtitle: {
    type: String,
    default: null
  }
})

// Add some loading messages that rotate
const loadingMessages = [
  'Loading your dashboard...',
  'Fetching appointments...',
  'Preparing your schedule...',
  'Getting everything ready...'
]

const currentMessage = ref(props.message)

onMounted(() => {
  // If no custom message provided, rotate through default messages
  if (props.message === 'Loading...') {
    let messageIndex = 0
    const messageInterval = setInterval(() => {
      currentMessage.value = loadingMessages[messageIndex]
      messageIndex = (messageIndex + 1) % loadingMessages.length
    }, 2000) // Change message every 2 seconds

    // Clean up interval when component unmounts
    onUnmounted(() => {
      clearInterval(messageInterval)
    })
  }
})
</script>

<style scoped>
.spinner {
  border: 2px solid #f3f4f6;
  border-top: 2px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>