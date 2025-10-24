import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { ArrowLeft, Trophy, Award, Target, Clock, BarChart3, Download } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

export default function ResultsPage() {
  const { contestId } = useParams<{ contestId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [results, setResults] = useState({
    score: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    timeTaken: 0,
    rank: 0,
    totalParticipants: 0,
    contest: null as any,
    answers: [] as any[]
  })

  useEffect(() => {
    loadResults()
  }, [contestId])

  const loadResults = async () => {
    setIsLoading(true)
    // Mock data for now - will be replaced with API calls
    setTimeout(() => {
      setResults({
        score: 85,
        totalQuestions: 5,
        correctAnswers: 4,
        timeTaken: 1800, // 30 minutes in seconds
        rank: 3,
        totalParticipants: 150,
        contest: {
          id: contestId,
          title: 'Mathematics Quiz',
          duration: 3600,
          totalQuestions: 5
        },
        answers: [
          { question: 'What is 2 + 2?', correctAnswer: '4', userAnswer: '4', isCorrect: true },
          { question: 'What is the capital of India?', correctAnswer: 'Delhi', userAnswer: 'Delhi', isCorrect: true },
          { question: 'Which planet is closest to the Sun?', correctAnswer: 'Mercury', userAnswer: 'Venus', isCorrect: false },
          { question: 'What is 10 × 5?', correctAnswer: '50', userAnswer: '50', isCorrect: true },
          { question: 'Which is the largest ocean?', correctAnswer: 'Pacific', userAnswer: 'Pacific', isCorrect: true }
        ]
      })
      setIsLoading(false)
    }, 1000)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-50 border-green-200'
    if (score >= 70) return 'bg-blue-50 border-blue-200'
    if (score >= 50) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  const handleDownloadResults = () => {
    // Mock download functionality
    console.log('Downloading results...')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/student')}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Contest Results
              </h1>
            </div>
            <button
              onClick={handleDownloadResults}
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score Card */}
        <div className={`rounded-lg border-2 p-8 mb-8 ${getScoreBgColor(results.score)}`}>
          <div className="text-center">
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Contest Completed!
            </h2>
            <div className={`text-6xl font-bold mb-4 ${getScoreColor(results.score)}`}>
              {results.score}%
            </div>
            <p className="text-lg text-gray-600">
              You scored {results.correctAnswers} out of {results.totalQuestions} questions correctly
            </p>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <Target className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">{results.correctAnswers}</div>
            <div className="text-sm text-gray-600">Correct Answers</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <Award className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">#{results.rank}</div>
            <div className="text-sm text-gray-600">Your Rank</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <Clock className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">{formatTime(results.timeTaken)}</div>
            <div className="text-sm text-gray-600">Time Taken</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <BarChart3 className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">{results.totalParticipants}</div>
            <div className="text-sm text-gray-600">Total Participants</div>
          </div>
        </div>

        {/* Question-wise Results */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Question-wise Results</h3>
          <div className="space-y-4">
            {results.answers.map((answer, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                answer.isCorrect 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Question {index + 1}: {answer.question}
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-24">Your Answer:</span>
                        <span className={`font-medium ${
                          answer.isCorrect ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {answer.userAnswer}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-24">Correct Answer:</span>
                        <span className="text-gray-900">{answer.correctAnswer}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`ml-4 px-2 py-1 rounded-full text-xs font-medium ${
                    answer.isCorrect 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {answer.isCorrect ? 'Correct' : 'Incorrect'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contest Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contest Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Contest ID:</span> {results.contest?.id}
            </div>
            <div>
              <span className="font-medium">Contest Title:</span> {results.contest?.title}
            </div>
            <div>
              <span className="font-medium">Participant:</span> {user?.username}
            </div>
            <div>
              <span className="font-medium">Completion Date:</span> {new Date().toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Total Questions:</span> {results.contest?.totalQuestions}
            </div>
            <div>
              <span className="font-medium">Contest Duration:</span> {formatTime(results.contest?.duration || 0)}
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> These are sample results. The actual results will be displayed when the Firebase API is integrated and real contest data is available.
          </p>
        </div>
      </main>
    </div>
  )
}




