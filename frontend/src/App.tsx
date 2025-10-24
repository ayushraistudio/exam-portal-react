import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useEffect } from 'react'

// Pages
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import StudentDashboard from './pages/StudentDashboard'
import ContestPage from './pages/ContestPage'
import ResultsPage from './pages/ResultsPage'
import LoadingSpinner from './components/LoadingSpinner'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { user, isLoading, initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            user ? (
              <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />
            ) : (
              <LoginPage />
            )
          } 
        />
        
        {/* Admin routes */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Student routes */}
        <Route 
          path="/student/*" 
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Contest route (accessible by both roles) */}
        <Route 
          path="/contest/:contestId" 
          element={
            <ProtectedRoute>
              <ContestPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Results route (accessible by both roles) */}
        <Route 
          path="/results/:contestId" 
          element={
            <ProtectedRoute>
              <ResultsPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Default route - show login */}
        <Route 
          path="/" 
          element={
            user ? (
              <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />
            ) : (
              <LoginPage />
            )
          } 
        />
        
        {/* 404 route */}
        <Route 
          path="*" 
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600 mb-8">Page not found</p>
                <button 
                  onClick={() => window.history.back()}
                  className="btn btn-primary"
                >
                  Go Back
                </button>
              </div>
            </div>
          } 
        />
      </Routes>
    </div>
  )
}

export default App
