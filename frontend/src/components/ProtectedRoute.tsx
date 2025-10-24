import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import LoadingSpinner from './LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  role?: 'admin' | 'student'
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    // Redirect to login with return url
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (role && user.role !== role) {
    // Redirect to appropriate dashboard based on user role
    return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />
  }

  return <>{children}</>
}
