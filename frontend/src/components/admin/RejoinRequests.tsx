import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, User, AlertTriangle, Filter } from 'lucide-react'
import LoadingSpinner from '../LoadingSpinner'
import { RejoinRequest } from '../../types'

export default function RejoinRequests() {
  const [requests, setRequests] = useState<RejoinRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState('all') // all, pending, approved, rejected

  useEffect(() => {
    loadRejoinRequests()
  }, [])

  const loadRejoinRequests = async () => {
    setIsLoading(true)
    // Mock data for now - will be replaced with API calls
    setTimeout(() => {
      setRequests([
        {
          id: '1',
          userId: 'user1',
          studentId: 'student1',
          studentName: 'John Doe',
          contestId: 'contest1',
          contestTitle: 'Mathematics Quiz',
          reason: 'Browser crashed during exam',
          status: 'pending',
          requestedAt: new Date().toISOString(),
          approvedAt: null,
          approvedBy: null
        },
        {
          id: '2',
          userId: 'user2',
          studentId: 'student2',
          studentName: 'Jane Smith',
          contestId: 'contest1',
          contestTitle: 'Mathematics Quiz',
          reason: 'Internet connection lost',
          status: 'approved',
          requestedAt: new Date(Date.now() - 3600000).toISOString(),
          approvedAt: new Date(Date.now() - 1800000).toISOString(),
          approvedBy: 'admin1'
        },
        {
          id: '3',
          userId: 'user3',
          studentId: 'student3',
          studentName: 'Mike Johnson',
          contestId: 'contest2',
          contestTitle: 'Science Test',
          reason: 'Computer restarted unexpectedly',
          status: 'rejected',
          requestedAt: new Date(Date.now() - 7200000).toISOString(),
          approvedAt: new Date(Date.now() - 3600000).toISOString(),
          approvedBy: 'admin1'
        }
      ])
      setIsLoading(false)
    }, 1000)
  }

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true
    return request.status === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  const handleApproveRequest = async (requestId: string) => {
    if (window.confirm('Are you sure you want to approve this rejoin request?')) {
      // Mock approve - will be replaced with API call
      console.log('Approving request:', requestId)
      loadRejoinRequests()
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    if (window.confirm('Are you sure you want to reject this rejoin request?')) {
      // Mock reject - will be replaced with API call
      console.log('Rejecting request:', requestId)
      loadRejoinRequests()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rejoin Requests</h1>
          <p className="text-gray-600">Review and manage student rejoin requests</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter(r => r.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter(r => r.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <div className="flex space-x-2">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === status
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests Table */}
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
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request: any) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {request.studentName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {request.studentId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {request.contestTitle}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {request.contestId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {request.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(request.requestedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {request.status === 'pending' && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleApproveRequest(request.id)}
                            className="text-green-600 hover:text-green-900 flex items-center"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className="text-red-600 hover:text-red-900 flex items-center"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </button>
                        </div>
                      )}
                      {request.status !== 'pending' && (
                        <div className="text-sm text-gray-500">
                          {request.approvedAt && `Processed on ${formatDate(request.approvedAt)}`}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredRequests.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No rejoin requests found
          </h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? "There are no rejoin requests at the moment."
              : `There are no ${filter} rejoin requests.`
            }
          </p>
        </div>
      )}
    </div>
  )
}



