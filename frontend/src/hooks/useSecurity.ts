import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import { rejoinService } from '../services/rejoinService'
import toast from 'react-hot-toast'

interface SecurityState {
  isMinimized: boolean
  minimizeCount: number
  lastActivity: Date
  isExamMode: boolean
  warningShown: boolean
}

const MINIMIZE_TIMEOUT = 3000 // 3 seconds
// const ACTIVITY_TIMEOUT = 30000 // 30 seconds

export function useSecurity(contestId?: string) {
  const { user } = useAuthStore()
  const [securityState, setSecurityState] = useState<SecurityState>({
    isMinimized: false,
    minimizeCount: 0,
    lastActivity: new Date(),
    isExamMode: false,
    warningShown: false
  })

  const [minimizeTimer, setMinimizeTimer] = useState<NodeJS.Timeout | null>(null)

  // Handle visibility change (minimize/restore)
  const handleVisibilityChange = useCallback(() => {
    if (!securityState.isExamMode) return

    if (document.hidden) {
      // Window was minimized or tab switched
      setSecurityState(prev => ({
        ...prev,
        isMinimized: true,
        minimizeCount: prev.minimizeCount + 1
      }))

      // Start 3-second timer
      const timer = setTimeout(async () => {
        if (contestId && user) {
          try {
            await rejoinService.requestRejoin(contestId, 'Window minimized or tab switched')
            toast.error('You have been logged out due to window minimization. Please request rejoin.')
            
            // Logout user
            const { logout } = useAuthStore.getState()
            await logout()
          } catch (error) {
            console.error('Error requesting rejoin:', error)
          }
        }
      }, MINIMIZE_TIMEOUT)

      setMinimizeTimer(timer)
    } else {
      // Window was restored
      if (minimizeTimer) {
        clearTimeout(minimizeTimer)
        setMinimizeTimer(null)
      }

      setSecurityState(prev => ({
        ...prev,
        isMinimized: false,
        lastActivity: new Date()
      }))

      if (securityState.minimizeCount > 0 && !securityState.warningShown) {
        toast.error('Please avoid minimizing the window or switching tabs during the exam.')
        setSecurityState(prev => ({ ...prev, warningShown: true }))
      }
    }
  }, [securityState.isExamMode, securityState.minimizeCount, securityState.warningShown, contestId, user, minimizeTimer])

  // Handle window blur (alt+tab, etc.)
  const handleBlur = useCallback(() => {
    if (!securityState.isExamMode) return

    setSecurityState(prev => ({
      ...prev,
      isMinimized: true,
      minimizeCount: prev.minimizeCount + 1
    }))

    const timer = setTimeout(async () => {
      if (contestId && user) {
        try {
          await rejoinService.requestRejoin(contestId, 'Window lost focus')
          toast.error('You have been logged out due to window focus loss. Please request rejoin.')
          
          const { logout } = useAuthStore.getState()
          await logout()
        } catch (error) {
          console.error('Error requesting rejoin:', error)
        }
      }
    }, MINIMIZE_TIMEOUT)

    setMinimizeTimer(timer)
  }, [securityState.isExamMode, contestId, user])

  // Handle window focus
  const handleFocus = useCallback(() => {
    if (minimizeTimer) {
      clearTimeout(minimizeTimer)
      setMinimizeTimer(null)
    }

    setSecurityState(prev => ({
      ...prev,
      isMinimized: false,
      lastActivity: new Date()
    }))
  }, [minimizeTimer])

  // Handle user activity
  const handleActivity = useCallback(() => {
    setSecurityState(prev => ({
      ...prev,
      lastActivity: new Date()
    }))
  }, [])

  // Disable right-click and context menu
  const handleContextMenu = useCallback((e: MouseEvent) => {
    if (securityState.isExamMode) {
      e.preventDefault()
      toast.error('Right-click is disabled during the exam.')
    }
    return false
  }, [securityState.isExamMode])

  // Disable keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!securityState.isExamMode) return

    // Disable common shortcuts
    const disabledKeys = [
      'F12', // Developer tools
      'Ctrl+Shift+I', // Developer tools
      'Ctrl+Shift+J', // Console
      'Ctrl+U', // View source
      'Ctrl+S', // Save
      'Ctrl+P', // Print
      'Ctrl+A', // Select all
      'Ctrl+C', // Copy
      'Ctrl+V', // Paste
      'Ctrl+X', // Cut
      'Ctrl+Z', // Undo
      'Ctrl+Y', // Redo
      'Ctrl+F', // Find
      'Ctrl+H', // History
      'Ctrl+R', // Refresh
      'F5', // Refresh
      'Ctrl+F5', // Hard refresh
    ]

    const keyCombo = e.ctrlKey ? `Ctrl+${e.key}` : e.key

    if (disabledKeys.includes(keyCombo) || disabledKeys.includes(e.key)) {
      e.preventDefault()
      toast.error('This keyboard shortcut is disabled during the exam.')
    }
  }, [securityState.isExamMode])

  // Disable text selection
  const handleSelectStart = useCallback((e: Event) => {
    if (securityState.isExamMode) {
      e.preventDefault()
    }
  }, [securityState.isExamMode])

  // Disable drag and drop
  const handleDragStart = useCallback((e: DragEvent) => {
    if (securityState.isExamMode) {
      e.preventDefault()
    }
  }, [securityState.isExamMode])

  // Setup event listeners
  useEffect(() => {
    if (!securityState.isExamMode) return

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)
    document.addEventListener('mousemove', handleActivity)
    document.addEventListener('keydown', handleActivity)
    document.addEventListener('click', handleActivity)
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('selectstart', handleSelectStart)
    document.addEventListener('dragstart', handleDragStart)

    // Disable text selection
    document.body.style.userSelect = 'none'
    document.body.style.webkitUserSelect = 'none'

    // Disable right-click
    document.body.style.webkitTouchCallout = 'none'
    document.body.style.webkitTapHighlightColor = 'transparent'

    return () => {
      // Remove event listeners
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('mousemove', handleActivity)
      document.removeEventListener('keydown', handleActivity)
      document.removeEventListener('click', handleActivity)
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('selectstart', handleSelectStart)
      document.removeEventListener('dragstart', handleDragStart)

      // Re-enable text selection
      document.body.style.userSelect = ''
      document.body.style.webkitUserSelect = ''

      // Re-enable right-click
      document.body.style.webkitTouchCallout = ''
      document.body.style.webkitTapHighlightColor = ''

      // Clear timer
      if (minimizeTimer) {
        clearTimeout(minimizeTimer)
      }
    }
  }, [
    securityState.isExamMode,
    handleVisibilityChange,
    handleBlur,
    handleFocus,
    handleActivity,
    handleContextMenu,
    handleKeyDown,
    handleSelectStart,
    handleDragStart,
    minimizeTimer
  ])

  const enableExamMode = useCallback(() => {
    setSecurityState(prev => ({
      ...prev,
      isExamMode: true,
      lastActivity: new Date()
    }))
  }, [])

  const disableExamMode = useCallback(() => {
    setSecurityState(prev => ({
      ...prev,
      isExamMode: false
    }))

    if (minimizeTimer) {
      clearTimeout(minimizeTimer)
      setMinimizeTimer(null)
    }
  }, [minimizeTimer])

  return {
    securityState,
    enableExamMode,
    disableExamMode,
    isMinimized: securityState.isMinimized,
    minimizeCount: securityState.minimizeCount
  }
}
