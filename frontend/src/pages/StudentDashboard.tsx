import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { LogOut, BookOpen, Clock, Trophy, Play } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import { Contest } from '../types'

export default function StudentDashboard() {
  const { user, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState('available')
  const [isLoading, setIsLoading] = useState(false)
  const [contests, setContests] = useState<Contest[]>([])

  const handleLogout = async () => {
    await logout()
  }

  const loadContests = async () => {
    setIsLoading(true)
    // Mock data for now - will be replaced with API calls
    setTimeout(() => {
      setContests([
        {
          id: '1',
          title: 'Mathematics Quiz',
          status: 'running',
          duration: 60,
          totalQuestions: 20,
          startTime: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          createdBy: 'admin1',
          maxScore: 100
        },
        {
          id: '2', 
          title: 'Science Test',
          status: 'upcoming',
          duration: 90,
          totalQuestions: 30,
          startTime: new Date(Date.now() + 3600000).toISOString(),
          createdAt: new Date().toISOString(),
          createdBy: 'admin1',
          maxScore: 150
        }
      ])
      setIsLoading(false)
    }, 1000)
  }

  useEffect(() => {
    loadContests()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-50 border-green-200'
      case 'upcoming': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'completed': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="h-4 w-4" />
      case 'upcoming': return <Clock className="h-4 w-4" />
      case 'completed': return <Trophy className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Student Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.username}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('available')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'available'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Available Contests
            </button>
            <button
              onClick={() => setActiveTab('ongoing')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ongoing'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Ongoing Contests
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'completed'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Completed Contests
            </button>
          </nav>
        </div>

        {/* Content based on active tab */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="p-6">
              {contests.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No {activeTab} contests
                  </h3>
                  <p className="text-gray-500">
                    {activeTab === 'available' && "There are currently no contests available for you to participate in."}
                    {activeTab === 'ongoing' && "You don't have any contests in progress at the moment."}
                    {activeTab === 'completed' && "You haven't completed any contests yet."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {contests.map((contest: any) => (
                    <div key={contest.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{contest.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(contest.status)}`}>
                          {getStatusIcon(contest.status)}
                          <span className="ml-1 capitalize">{contest.status}</span>
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>Duration: {contest.duration} minutes</span>
                        </div>
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-2" />
                          <span>Questions: {contest.totalQuestions}</span>
                        </div>
                      </div>

                      {contest.status === 'running' && (
                        <button className="w-full btn btn-primary">
                          Start Contest
                        </button>
                      )}
                      
                      {contest.status === 'upcoming' && (
                        <button className="w-full btn btn-secondary" disabled>
                          Contest Not Started
                        </button>
                      )}
                      
                      {contest.status === 'completed' && (
                        <button className="w-full btn btn-secondary">
                          View Results
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}



