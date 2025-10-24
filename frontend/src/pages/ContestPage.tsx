import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { ArrowLeft, Clock, Save, CheckCircle, AlertTriangle } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import QuestionCanvas from '../components/QuestionCanvas'
import Watermark from '../components/Watermark'

export default function ContestPage() {
  const { contestId } = useParams<{ contestId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [timeLeft, setTimeLeft] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [contest, setContest] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadContestData()
  }, [contestId])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (timeLeft === 0 && contest) {
      // Auto submit when time runs out
      handleSubmit()
    }
  }, [timeLeft])

  const loadContestData = async () => {
    setIsLoading(true)
    // Mock data for now - will be replaced with API calls
    setTimeout(() => {
      setContest({
        id: contestId,
        title: 'Mathematics Quiz',
        duration: 3600, // 1 hour in seconds
        totalQuestions: 5,
        status: 'running'
      })
      setQuestions([
        {
          id: '1',
          order: 1,
          text: 'What is 2 + 2?',
          options: ['3', '4', '5', '6'],
          points: 10
        },
        {
          id: '2',
          order: 2,
          text: 'What is the capital of India?',
          options: ['Mumbai', 'Delhi', 'Kolkata', 'Chennai'],
          points: 10
        },
        {
          id: '3',
          order: 3,
          text: 'Which planet is closest to the Sun?',
          options: ['Venus', 'Mercury', 'Earth', 'Mars'],
          points: 10
        },
        {
          id: '4',
          order: 4,
          text: 'What is 10 × 5?',
          options: ['45', '50', '55', '60'],
          points: 10
        },
        {
          id: '5',
          order: 5,
          text: 'Which is the largest ocean?',
          options: ['Atlantic', 'Pacific', 'Indian', 'Arctic'],
          points: 10
        }
      ])
      setTimeLeft(3600) // 1 hour
      setIsLoading(false)
    }, 1000)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerChange = (questionIndex: number, answer: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }))
  }

  const handleSave = async () => {
    try {
      // Mock save - will be replaced with API call
      console.log('Saving answers:', answers)
      // await contestService.saveAnswers(contestId, answers)
    } catch (error) {
      console.error('Error saving answers:', error)
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    try {
      // Mock submit - will be replaced with API call
      console.log('Submitting contest:', answers)
      // await contestService.submitContest(contestId)
      
      // Navigate to results
      navigate(`/results/${contestId}`)
    } catch (error) {
      console.error('Error submitting contest:', error)
      setIsSubmitting(false)
    }
  }

  const getTimerColor = () => {
    if (timeLeft < 300) return 'text-red-600' // Less than 5 minutes
    if (timeLeft < 900) return 'text-yellow-600' // Less than 15 minutes
    return 'text-green-600'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!contest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Contest Not Found</h2>
          <p className="text-gray-600 mb-4">The contest you're looking for doesn't exist or has ended.</p>
          <button
            onClick={() => navigate('/student')}
            className="btn btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 exam-mode">
      <Watermark contestId={contestId} text={`${user?.username} | ${contestId}`} />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/student')}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {contest.title}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center ${getTimerColor()}`}>
                <Clock className="h-5 w-5 mr-2" />
                <span className="font-mono text-lg">
                  {formatTime(timeLeft)}
                </span>
              </div>
              <button
                onClick={handleSave}
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-500">
              {Object.keys(answers).length} answered
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {questions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Question {currentQuestion + 1}
              </h2>
              <QuestionCanvas
                question={questions[currentQuestion]}
                selectedAnswer={typeof answers[currentQuestion] === 'number' ? answers[currentQuestion] : undefined}
                onAnswerChange={(answer: number) => handleAnswerChange(currentQuestion, answer)}
              />
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="btn btn-secondary"
              >
                Previous
              </button>
              
              <div className="flex space-x-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-8 h-8 rounded-full text-sm font-medium ${
                      index === currentQuestion
                        ? 'bg-primary-600 text-white'
                        : answers[index]
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                disabled={currentQuestion === questions.length - 1}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn btn-primary btn-lg"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Submit Contest
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  )
}



