import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Edit, Trash2, Play, Pause, Eye, BarChart3 } from 'lucide-react'
import LoadingSpinner from '../LoadingSpinner'
import { Contest } from '../../types'

export default function ContestManagement() {
  const navigate = useNavigate()
  const [contests, setContests] = useState<Contest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null)

  useEffect(() => {
    loadContests()
  }, [])

  const loadContests = async () => {
    setIsLoading(true)
    // Mock data for now - will be replaced with API calls
    setTimeout(() => {
      setContests([
        {
          id: '1',
          title: 'Mathematics Quiz',
          description: 'Basic mathematics questions',
          status: 'running',
          duration: 60,
          totalQuestions: 20,
          participants: 45,
          createdAt: new Date().toISOString(),
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 3600000).toISOString(),
          createdBy: 'admin1',
          maxScore: 100
        },
        {
          id: '2',
          title: 'Science Test',
          description: 'General science questions',
          status: 'upcoming',
          duration: 90,
          totalQuestions: 30,
          participants: 0,
          createdAt: new Date().toISOString(),
          startTime: new Date(Date.now() + 3600000).toISOString(),
          endTime: new Date(Date.now() + 7200000).toISOString(),
          createdBy: 'admin1',
          maxScore: 150
        },
        {
          id: '3',
          title: 'History Quiz',
          description: 'World history questions',
          status: 'completed',
          duration: 45,
          totalQuestions: 15,
          participants: 32,
          createdAt: new Date().toISOString(),
          startTime: new Date(Date.now() - 7200000).toISOString(),
          endTime: new Date(Date.now() - 3600000).toISOString(),
          createdBy: 'admin1',
          maxScore: 75
        }
      ])
      setIsLoading(false)
    }, 1000)
  }

  const filteredContests = contests.filter(contest =>
    contest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contest.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800'
      case 'upcoming': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleAddContest = () => {
    setShowAddModal(true)
  }

  const handleEditContest = (contest: any) => {
    setSelectedContest(contest)
    setShowAddModal(true)
  }

  const handleDeleteContest = async (contestId: string) => {
    if (window.confirm('Are you sure you want to delete this contest?')) {
      // Mock delete - will be replaced with API call
      console.log('Deleting contest:', contestId)
      loadContests()
    }
  }

  const handleStartContest = async (contestId: string) => {
    // Mock start - will be replaced with API call
    console.log('Starting contest:', contestId)
    loadContests()
  }

  const handleStopContest = async (contestId: string) => {
    // Mock stop - will be replaced with API call
    console.log('Stopping contest:', contestId)
    loadContests()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contest Management</h1>
          <p className="text-gray-600">Create and manage contests</p>
        </div>
        <button
          onClick={handleAddContest}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Contest
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Contests</p>
              <p className="text-2xl font-bold text-gray-900">{contests.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Play className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Running</p>
              <p className="text-2xl font-bold text-gray-900">
                {contests.filter(c => c.status === 'running').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Pause className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">
                {contests.filter(c => c.status === 'upcoming').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-gray-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {contests.filter(c => c.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search contests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Contests Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Questions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContests.map((contest: any) => (
                  <tr key={contest.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {contest.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {contest.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contest.status)}`}>
                        {contest.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contest.duration} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contest.totalQuestions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contest.participants}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(contest.startTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditContest(contest)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        {contest.status === 'upcoming' && (
                          <button
                            onClick={() => handleStartContest(contest.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        
                        {contest.status === 'running' && (
                          <button
                            onClick={() => handleStopContest(contest.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Pause className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => navigate(`/admin/results/${contest.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteContest(contest.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedContest ? 'Edit Contest' : 'Create New Contest'}
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    defaultValue={selectedContest?.title || ''}
                    className="input mt-1"
                    placeholder="Enter contest title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    defaultValue={selectedContest?.description || ''}
                    className="input mt-1"
                    rows={3}
                    placeholder="Enter contest description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                  <input
                    type="number"
                    defaultValue={selectedContest?.duration || ''}
                    className="input mt-1"
                    placeholder="Enter duration"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="datetime-local"
                    defaultValue={selectedContest?.startTime ? new Date(selectedContest.startTime).toISOString().slice(0, 16) : ''}
                    className="input mt-1"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setSelectedContest(null)
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {selectedContest ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
