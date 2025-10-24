import { Timestamp } from 'firebase-admin/firestore';

export interface User {
  uid: string;
  username: string;
  role: 'admin' | 'student';
  email?: string;
  createdAt: Timestamp;
  lastLoginAt?: Timestamp;
  sessionId?: string;
  isActive: boolean;
}

export interface Contest {
  id: string;
  title: string;
  description?: string;
  duration: number; // Duration in seconds
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'cancelled';
  startTime?: Timestamp;
  endTime?: Timestamp;
  createdAt: Timestamp;
  createdBy: string; // Admin UID
  totalQuestions: number;
  maxScore: number;
}

export interface Question {
  id: string;
  contestId: string;
  order: number;
  text: string;
  imageUrl?: string;
  options: string[];
  correctAnswer: number; // Index of correct answer (0-based)
  points: number;
  createdAt: Timestamp;
}

export interface Answer {
  userId: string;
  contestId: string;
  answers: Record<string, number>; // {questionId: selectedOptionIndex}
  lastSaved: Timestamp;
  submittedAt?: Timestamp;
  isSubmitted: boolean;
  timeSpent: number; // Total time spent in seconds
}

export interface RejoinRequest {
  userId: string;
  contestId: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Timestamp;
  approvedBy?: string;
  approvedAt?: Timestamp;
  reason?: string;
}

export interface Result {
  userId: string;
  contestId: string;
  username: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  rank?: number;
  timeTaken: number;
  submittedAt: Timestamp;
  answers: Record<string, {
    questionId: string;
    selectedAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    points: number;
  }>;
}

export interface Session {
  sessionId: string;
  userId: string;
  role: 'admin' | 'student';
  createdAt: Timestamp;
  lastActivity: Timestamp;
  isActive: boolean;
  ipAddress?: string;
  userAgent?: string;
}

// Request/Response types
export interface CreateStudentRequest {
  username: string;
  password: string;
  email?: string;
}

export interface CreateContestRequest {
  title: string;
  description?: string;
  duration: number;
  questions: Omit<Question, 'id' | 'contestId' | 'createdAt'>[];
}

export interface StartContestRequest {
  contestId: string;
}

export interface SubmitAnswerRequest {
  contestId: string;
  questionId: string;
  answer: number;
}

export interface RequestRejoinRequest {
  contestId: string;
  reason?: string;
}

export interface ApproveRejoinRequest {
  contestId: string;
  userId: string;
  action: 'approve' | 'reject';
  reason?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Authentication context
export interface AuthContext {
  uid: string;
  role: 'admin' | 'student';
  sessionId: string;
}

// Contest statistics
export interface ContestStats {
  totalParticipants: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  completionRate: number;
}

// Leaderboard entry
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeTaken: number;
  submittedAt: Timestamp;
}
