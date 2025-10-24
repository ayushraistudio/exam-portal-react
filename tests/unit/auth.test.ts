import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { authService } from '../../frontend/src/services/authService'

// Mock Firebase Auth
const mockSignInWithEmailAndPassword = jest.fn()
const mockSignOut = jest.fn()
const mockGetIdToken = jest.fn()

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: {
      getIdToken: mockGetIdToken
    }
  })),
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  signOut: mockSignOut
}))

// Mock fetch
global.fetch = jest.fn()

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        user: {
          getIdToken: jest.fn().mockResolvedValue('mock-token')
        }
      }

      const mockResponse = {
        success: true,
        data: {
          user: {
            uid: 'test-uid',
            username: 'testuser',
            role: 'student',
            email: 'test@example.com'
          },
          sessionId: 'test-session-id'
        }
      }

      mockSignInWithEmailAndPassword.mockResolvedValue(mockUser)
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      const result = await authService.login('testuser', 'password', 'student')

      expect(result.success).toBe(true)
      expect(result.data?.user.username).toBe('testuser')
      expect(result.data?.sessionId).toBe('test-session-id')
    })

    it('should throw error for invalid credentials', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValue(new Error('Invalid credentials'))

      await expect(authService.login('invalid', 'wrong', 'student'))
        .rejects.toThrow('Invalid credentials')
    })

    it('should handle backend login failure', async () => {
      const mockUser = {
        user: {
          getIdToken: jest.fn().mockResolvedValue('mock-token')
        }
      }

      mockSignInWithEmailAndPassword.mockResolvedValue(mockUser)
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'Backend error' })
      })

      await expect(authService.login('testuser', 'password', 'student'))
        .rejects.toThrow('Backend error')
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true })
      })
      mockSignOut.mockResolvedValue(undefined)

      await authService.logout()

      expect(mockSignOut).toHaveBeenCalled()
    })

    it('should logout from Firebase even if backend fails', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Backend error'))
      mockSignOut.mockResolvedValue(undefined)

      await authService.logout()

      expect(mockSignOut).toHaveBeenCalled()
    })
  })

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          uid: 'test-uid',
          username: 'testuser',
          role: 'student'
        }
      }

      mockGetIdToken.mockResolvedValue('mock-token')
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      const result = await authService.getCurrentUser()

      expect(result.success).toBe(true)
      expect(result.data?.username).toBe('testuser')
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when user is authenticated', () => {
      // Mock currentUser
      Object.defineProperty(authService, 'getCurrentFirebaseUser', {
        value: jest.fn().mockReturnValue({ uid: 'test-uid' })
      })

      expect(authService.isAuthenticated()).toBe(true)
    })

    it('should return false when user is not authenticated', () => {
      Object.defineProperty(authService, 'getCurrentFirebaseUser', {
        value: jest.fn().mockReturnValue(null)
      })

      expect(authService.isAuthenticated()).toBe(false)
    })
  })
})
