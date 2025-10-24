import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Trophy, Award, Target, BarChart3, Download, Users, TrendingUp } from 'lucide-react'
import LoadingSpinner from '../LoadingSpinner'

export default function ContestResults() {
  const { contestId } = useParams<{ contestId: string }>()
  const [isLoading, setIsLoading] = useState(false)
  const [contest, setContest] = useState(null as any)
  const [results, setResults] = useState([] as any[])
  const [stats, setStats] = useState({
    totalParticipants: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
    completionRate: 0
  })

  useEffect(() => {
    loadContestResults()
  }, [contestId])

  const loadContestResults = async () => {
    setIsLoading(true)
    // Mock data for now - will be replaced with API calls
    setTimeout(() => {
      setContest({
        id: contestId,
        title: 'Mathematics Quiz',
        description: 'Basic mathematics questions',
        duration: 60,
        totalQuestions: 20,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString()
      })
      
      setResults([
        {
          id: '1',
          studentId: 'student1',
          studentName: 'John Doe',
          score: 95,
          correctAnswers: 19,
          totalQuestions: 20,
          timeTaken: 1800, // 30 minutes
          submittedAt: new Date().toISOString(),
          rank: 1
        },
        {
          id: '2',
          studentId: 'student2',
          studentName: 'Jane Smith',
          score: 85,
          correctAnswers: 17,
          totalQuestions: 20,
          timeTaken: 2100, // 35 minutes
          submittedAt: new Date().toISOString(),
          rank: 2
        },
        {
          id: '3',
          studentId: 'student3',
          studentName: 'Mike Johnson',
          score: 75,
          correctAnswers: 15,
          totalQuestions: 20,
          timeTaken: 2400, // 40 minutes
          submittedAt: new Date().toISOString(),
          rank: 3
        },
        {
          id: '4',
          studentId: 'student4',
          studentName: 'Sarah Wilson',
          score: 70,
          correctAnswers: 14,
          totalQuestions: 20,
          timeTaken: 2700, // 45 minutes
          submittedAt: new Date().toISOString(),
          rank: 4
        },
        {
          id: '5',
          studentId: 'student5',
          studentName: 'David Brown',
          score: 60,
          correctAnswers: 12,
          totalQuestions: 20,
          timeTaken: 3000, // 50 minutes
          submittedAt: new Date().toISOString(),
          rank: 5
        }
      ])
      
      setStats({
        totalParticipants: 5,
        averageScore: 77,
        highestScore: 95,
        lowestScore: 60,
        completionRate: 100
      })
      
      setIsLoading(false)
    }, 1000)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString()
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleDownloadResults = () => {
    // Mock download functionality
    console.log('Downloading results...')
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contest Results</h1>
          <p className="text-gray-600">{contest?.title}</p>
        </div>
        <button
          onClick={handleDownloadResults}
          className="btn btn-primary"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Results
        </button>
      </div>

      {/* Contest Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Contest Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Contest ID:</span>
            <p className="text-gray-900">{contest?.id}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Duration:</span>
            <p className="text-gray-900">{contest?.duration} minutes</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Total Questions:</span>
            <p className="text-gray-900">{contest?.totalQuestions}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Start Time:</span>
            <p className="text-gray-900">{contest?.startTime ? formatDate(contest.startTime) : 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Participants</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalParticipants}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Trophy className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Highest Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.highestScore}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Lowest Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.lowestScore}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Leaderboard</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Correct Answers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Taken
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((result: any) => (
                <tr key={result.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {result.rank === 1 && <Trophy className="h-5 w-5 text-yellow-500 mr-2" />}
                      {result.rank === 2 && <Award className="h-5 w-5 text-gray-400 mr-2" />}
                      {result.rank === 3 && <Award className="h-5 w-5 text-orange-500 mr-2" />}
                      <span className="text-sm font-medium text-gray-900">
                        #{result.rank}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {result.studentName}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {result.studentId}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-bold ${getScoreColor(result.score)}`}>
                      {result.score}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {result.correctAnswers}/{result.totalQuestions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatTime(result.timeTaken)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(result.submittedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Analysis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Score Distribution</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">90-100%</span>
                <span className="text-sm font-medium text-gray-900">
                  {results.filter(r => r.score >= 90).length} students
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">70-89%</span>
                <span className="text-sm font-medium text-gray-900">
                  {results.filter(r => r.score >= 70 && r.score < 90).length} students
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">50-69%</span>
                <span className="text-sm font-medium text-gray-900">
                  {results.filter(r => r.score >= 50 && r.score < 70).length} students
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Below 50%</span>
                <span className="text-sm font-medium text-gray-900">
                  {results.filter(r => r.score < 50).length} students
                </span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Time Analysis</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Time</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatTime(Math.round(results.reduce((acc, r) => acc + r.timeTaken, 0) / results.length))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Fastest Completion</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatTime(Math.min(...results.map(r => r.timeTaken)))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Slowest Completion</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatTime(Math.max(...results.map(r => r.timeTaken)))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



