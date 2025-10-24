import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, 
  BookOpen, 
  Clock, 
  BarChart3,
  Play,
  Pause,
  AlertCircle
} from 'lucide-react'
import { DashboardStats, Contest } from '../../types'
import { contestService } from '../../services/contestService'
import LoadingSpinner from '../LoadingSpinner'

export default function AdminHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activeContests, setActiveContests] = useState<Contest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const [statsData, contestsData] = await Promise.all([
        contestService.getDashboardStats(),
        contestService.getContests({ status: 'running' })
      ])
      
      setStats(statsData.data || null)
      setActiveContests(contestsData.data || [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // const handleStartContest = async (contestId: string) => {
  //   try {
  //     await contestService.startContest(contestId)
  //     loadDashboardData() // Refresh data
  //   } catch (error) {
  //     console.error('Error starting contest:', error)
  //   }
  // }

  const handleStopContest = async (contestId: string) => {
    try {
      await contestService.stopContest(contestId)
      loadDashboardData() // Refresh data
    } catch (error) {
      console.error('Error stopping contest:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your MCQ competition portal
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Contests
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.totalContests || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Play className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Contests
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.activeContests || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Students
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.totalStudents || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-warning-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Sessions
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.activeSessions || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Contests */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Active Contests</h3>
          <p className="text-sm text-gray-500">
            Currently running contests that need monitoring
          </p>
        </div>
        <div className="card-content">
          {activeContests.length === 0 ? (
            <div className="text-center py-6">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No active contests</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start by creating a new contest.
              </p>
              <div className="mt-6">
                <Link
                  to="/admin/contests"
                  className="btn btn-primary"
                >
                  Create Contest
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {activeContests.map((contest) => (
                <div
                  key={contest.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {contest.title}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Duration: {Math.floor(contest.duration / 3600)} hour(s)
                    </p>
                    <p className="text-sm text-gray-500">
                      Questions: {contest.totalQuestions}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                      Running
                    </span>
                    <button
                      onClick={() => handleStopContest(contest.id)}
                      className="btn btn-danger btn-sm"
                    >
                      <Pause className="h-4 w-4 mr-1" />
                      Stop
                    </button>
                    <Link
                      to={`/admin/results/${contest.id}`}
                      className="btn btn-secondary btn-sm"
                    >
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Results
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/admin/students"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="card-content">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Manage Students</h3>
                <p className="text-sm text-gray-500">Create and manage student accounts</p>
              </div>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/contests"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="card-content">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Manage Contests</h3>
                <p className="text-sm text-gray-500">Create and manage contests</p>
              </div>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/rejoin-requests"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="card-content">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-warning-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Rejoin Requests</h3>
                <p className="text-sm text-gray-500">Review student rejoin requests</p>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
