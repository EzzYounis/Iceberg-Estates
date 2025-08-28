import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Import views (we'll create these next)
import LoginView from '@/components/ui/LoginView.vue'
import RegisterView from '@/components/ui/RegisterView.vue'
import DashboardView from '@/components/ui/DashboardView.vue'
import AppointmentsView from '@/components/ui/AppointmentsView.vue'
import AppointmentDetailView from '@/components/ui/AppointmentDetailView.vue'
import CreateAppointmentView from '@/components/ui/CreateAppointmentView.vue'
import ScheduleView from '@/components/ui/ScheduleView.vue'
import ProfileView from '@/components/ui/ProfileView.vue'
import EditAppointmentView from '@/components/ui/EditAppointmentView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Public routes (no authentication required)
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { 
        requiresAuth: false,
        title: 'Login - Iceberg Estates'
      }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { 
        requiresAuth: false,
        title: 'Register - Iceberg Estates'
      }
    },
    
    // Protected routes (authentication required)
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { 
        requiresAuth: true,
        title: 'Dashboard - Iceberg Estates'
      }
    },
    {
      path: '/appointments',
      name: 'Appointments',
      component: AppointmentsView,
      meta: { 
        requiresAuth: true,
        title: 'Appointments - Iceberg Estates'
      }
    },
    {
      path: '/appointments/create',
      name: 'create-appointment',
      component: CreateAppointmentView,
      meta: { 
        requiresAuth: true,
        title: 'Create Appointment - Iceberg Estates'
      }
    },
    {
      path: '/appointments/:id',
      name: 'appointment-detail',
      component: AppointmentDetailView,
      meta: { 
        requiresAuth: true,
        title: 'Appointment Details - Iceberg Estates'
      }
    },
    {
      path: '/schedule',
      name: 'schedule',
      component: ScheduleView,
      meta: { 
        requiresAuth: true,
        title: 'Schedule - Iceberg Estates'
      }
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { 
        requiresAuth: true,
        title: 'Profile - Iceberg Estates'
      }
    },
    
    // Catch-all route for 404
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/components/ui/NotFoundView.vue'),
      meta: {
        title: 'Page Not Found - Iceberg Estates'
      }
    },
    {
    path: '/appointments/:id/edit',
    name: 'EditAppointment',
    component: EditAppointmentView,
    meta: { 
        requiresAuth: true,
        title: 'Edit Appointment - Iceberg Estates'
      }
    },
  ]
})

// Navigation guards - run before each route change
router.beforeEach(async (to, from, next) => {
  console.log(' Navigating to:', to.path)
  
  const authStore = useAuthStore()
  
  // Set page title
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      console.log('Route requires authentication, redirecting to login')
      next({
        name: 'login',
        query: { redirect: to.fullPath } // Save intended destination
      })
      return
    }
  }
  
  // If user is authenticated and trying to access login/register, redirect to dashboard
  if (authStore.isAuthenticated && ['login', 'register'].includes(to.name)) {
    console.log('User already authenticated, redirecting to dashboard')
    next({ name: 'dashboard' })
    return
  }
  
  // Continue with navigation
  next()
})

// After navigation completes
router.afterEach((to, from) => {
  console.log('Navigation completed:', to.path)
})

export default router