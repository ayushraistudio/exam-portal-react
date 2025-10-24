export interface User {
  id: string
  uid: string
  username: string
  role: 'admin' | 'student'
  email?: string
  createdAt: Date | string
  lastLoginAt?: Date | string | null
  sessionId?: string
  isActive: boolean
}

export interface Contest {
  id: string
  title: string
  description?: string
  duration: number // Duration in seconds
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'cancelled' | 'upcoming'
  startTime?: Date | string
  endTime?: Date | string
  createdAt: Date | string
  createdBy: string // Admin UID
  totalQuestions: number
  maxScore: number
  participants?: number
}

export interface Question {
  id: string
  contestId: string
  order: number
  text: string
  imageUrl?: string
  options: string[]
  correctAnswer?: number // Only available for admins
  points: number
  createdAt: Date
}

export interface Answer {
  userId: string
  contestId: string
  answers: Record<string, number> // {questionId: selectedOptionIndex}
  lastSaved: Date
  submittedAt?: Date
  isSubmitted: boolean
  timeSpent: number // Total time spent in seconds
}

export interface RejoinRequest {
  id: string
  userId: string
  studentId: string
  studentName: string
  contestId: string
  contestTitle: string
  status: 'pending' | 'approved' | 'rejected'
  requestedAt: Date | string
  approvedBy?: string | null
  approvedAt?: Date | string | null
  reason?: string
}

export interface Result {
  userId: string
  contestId: string
  username: string
  score: number
  totalQuestions: number
  percentage: number
  rank?: number
  timeTaken: number
  submittedAt: Date
  answers: Record<string, {
    questionId: string
    selectedAnswer: number
    correctAnswer: number
    isCorrect: boolean
    points: number
  }>
}

export interface ContestStats {
  totalParticipants: number
  averageScore: number
  highestScore: number
  lowestScore: number
  completionRate: number
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  score: number
  totalQuestions: number
  percentage: number
  timeTaken: number
  submittedAt: Date
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form types
export interface LoginForm {
  userType: 'admin' | 'student'
  username: string
  password: string
}

export interface CreateStudentForm {
  username: string
  password: string
  email?: string
}

export interface CreateContestForm {
  title: string
  description?: string
  duration: number
  questions: Omit<Question, 'id' | 'contestId' | 'createdAt'>[]
}

export interface CreateQuestionForm {
  text: string
  imageUrl?: string
  options: string[]
  correctAnswer: number
  points: number
}

// Contest participation types
export interface ContestParticipation {
  hasStarted: boolean
  isSubmitted: boolean
  rejoinStatus: 'pending' | 'approved' | 'rejected' | null
  currentQuestion?: number
  answers: Record<string, number>
  timeSpent: number
}

// Timer types
export interface TimerState {
  timeLeft: number
  isRunning: boolean
  isWarning: boolean
  isDanger: boolean
}

// Security types
export interface SecurityState {
  isMinimized: boolean
  minimizeCount: number
  lastActivity: Date
  isExamMode: boolean
}

// Navigation types
export interface NavItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: number
}

// Dashboard types
export interface DashboardStats {
  totalContests: number
  activeContests: number
  totalStudents: number
  activeSessions: number
  recentContests: Contest[]
}

// Error types
export interface AppError {
  code: string
  message: string
  details?: any
}

// Notification types
export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
}
