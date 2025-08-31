import { defineStore } from 'pinia'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: []
  }),
  
  actions: {
    addNotification({ type = 'info', title, message, duration = 5000 }) {
      const id = Date.now().toString()
      const notification = {
        id,
        type,
        title,
        message,
        duration
      }
      
      this.notifications.push(notification)
      
      // Auto-remove after specified duration
      if (duration > 0) {
        setTimeout(() => {
          this.removeNotification(id)
        }, duration)
      }
      
      return id
    },
    
    removeNotification(id) {
      const index = this.notifications.findIndex(n => n.id === id)
      if (index > -1) {
        this.notifications.splice(index, 1)
      }
    },
    
    // Convenience methods for different notification types
    success(title, message, duration) {
      return this.addNotification({ type: 'success', title, message, duration })
    },
    
    error(title, message, duration = 8000) {
      return this.addNotification({ type: 'error', title, message, duration })
    },
    
    warning(title, message, duration = 6000) {
      return this.addNotification({ type: 'warning', title, message, duration })
    },
    
    info(title, message, duration) {
      return this.addNotification({ type: 'info', title, message, duration })
    },
    
    clearAll() {
      this.notifications = []
    }
  }
})
