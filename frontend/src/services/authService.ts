import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { User, ApiResponse } from '../types'

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'

class AuthService {
  private getAuthToken = async (): Promise<string | null> => {
    const user = auth.currentUser
    if (!user) return null
    
    try {
      return await user.getIdToken()
    } catch (error) {
      console.error('Error getting auth token:', error)
      return null
    }
  }

  private makeRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    const token = await this.getAuthToken()
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async login(username: string, password: string, userType: 'admin' | 'student'): Promise<ApiResponse<{ user: User; sessionId: string }>> {
    try {
      // Make real API call to backend
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          userType
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
      // Logout from backend
      await this.makeRequest('/api/auth/logout', { method: 'POST' })
      
      // Sign out from Firebase Auth
      await signOut(auth)
    } catch (error) {
      console.error('Logout error:', error)
      // Still sign out from Firebase even if backend logout fails
      await signOut(auth)
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      return await this.makeRequest<User>('/api/auth/me')
    } catch (error) {
      console.error('Get current user error:', error)
      throw error
    }
  }

  async refreshSession(): Promise<ApiResponse> {
    try {
      return await this.makeRequest('/api/auth/refresh', { method: 'POST' })
    } catch (error) {
      console.error('Refresh session error:', error)
      throw error
    }
  }

  // Utility method to check if user is authenticated
  isAuthenticated(): boolean {
    return auth.currentUser !== null
  }

  // Get current Firebase user
  getCurrentFirebaseUser() {
    return auth.currentUser
  }
}

export const authService = new AuthService()
