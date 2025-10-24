import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

interface AuthState {
  user: User | null
  isLoading: boolean
  isInitialized: boolean
  sessionId: string | null
}

interface AuthActions {
  login: (username: string, password: string, userType: 'admin' | 'student') => Promise<void>
  logout: () => Promise<void>
  initialize: () => Promise<void>
  refreshSession: () => Promise<void>
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isLoading: false,
      isInitialized: false,
      sessionId: null,

      // Actions
      login: async (username: string, password: string, userType: 'admin' | 'student') => {
        set({ isLoading: true })
        
        try {
          const result = await authService.login(username, password, userType)
          
          if (result.success && result.data) {
            set({
              user: result.data.user,
              sessionId: result.data.sessionId,
              isLoading: false
            })
            
            toast.success(`Welcome back, ${result.data.user.username}!`)
            
            // Navigate based on user role
            if (result.data.user.role === 'admin') {
              window.location.href = '/admin'
            } else {
              window.location.href = '/student'
            }
          } else {
            throw new Error(result.error || 'Login failed')
          }
        } catch (error) {
          set({ isLoading: false })
          const message = error instanceof Error ? error.message : 'Login failed'
          toast.error(message)
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })
        
        try {
          await authService.logout()
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({
            user: null,
            sessionId: null,
            isLoading: false
          })
          
          toast.success('Logged out successfully')
        }
      },

      initialize: async () => {
        if (get().isInitialized) return
        
        set({ isLoading: true })
        
        try {
          const result = await authService.getCurrentUser()
          
          if (result.success && result.data) {
            set({
              user: result.data,
              isLoading: false,
              isInitialized: true
            })
          } else {
            set({
              user: null,
              sessionId: null,
              isLoading: false,
              isInitialized: true
            })
          }
        } catch (error) {
          console.error('Auth initialization error:', error)
          set({
            user: null,
            sessionId: null,
            isLoading: false,
            isInitialized: true
          })
        }
      },

      refreshSession: async () => {
        try {
          await authService.refreshSession()
        } catch (error) {
          console.error('Session refresh error:', error)
          // If refresh fails, logout user
          get().logout()
        }
      },

      setUser: (user: User | null) => {
        set({ user })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        sessionId: state.sessionId
      })
    }
  )
)
