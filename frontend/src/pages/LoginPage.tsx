import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../store/authStore'
import { LoginForm } from '../types'
import { Eye, EyeOff, Shield, User } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [userType, setUserType] = useState<'admin' | 'student'>('student')
  const { login, isLoading } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.username, data.password, userType)
    } catch (error) {
      // Error is handled by the store
    }
  }

  const handleUserTypeChange = (type: 'admin' | 'student') => {
    setUserType(type)
    reset() // Clear form when switching user types
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <Shield className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            MCQ Competition Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Secure online examination platform
          </p>
        </div>

        {/* User Type Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Select User Type
              </h3>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => handleUserTypeChange('student')}
                  className={`flex-1 flex items-center justify-center px-4 py-3 border rounded-lg text-sm font-medium transition-colors ${
                    userType === 'student'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="h-4 w-4 mr-2" />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => handleUserTypeChange('admin')}
                  className={`flex-1 flex items-center justify-center px-4 py-3 border rounded-lg text-sm font-medium transition-colors ${
                    userType === 'admin'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </button>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  {...register('username', { required: 'Username is required' })}
                  type="text"
                  autoComplete="username"
                  className="mt-1 input"
                  placeholder="Enter your username"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-danger-600">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    {...register('password', { required: 'Password is required' })}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="input pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-danger-600">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn btn-primary btn-lg"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : null}
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Info Message */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Shield className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    {userType === 'admin' ? 'Admin Access' : 'Student Access'}
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    {userType === 'admin' ? (
                      <p>Use your admin credentials to access the management dashboard.</p>
                    ) : (
                      <p>Use the credentials provided by your administrator to access the exam portal.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            © 2024 MCQ Competition Portal. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
