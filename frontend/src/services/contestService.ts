import { Contest, Question, CreateContestForm, ApiResponse, DashboardStats, LeaderboardEntry, ContestStats } from '../types'
import { authService } from './authService'

class ContestService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = await authService.getCurrentFirebaseUser()?.getIdToken()
    
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async getContests(params: { status?: string; limit?: number; offset?: number } = {}): Promise<ApiResponse<Contest[]>> {
    const queryParams = new URLSearchParams()
    if (params.status) queryParams.append('status', params.status)
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.offset) queryParams.append('offset', params.offset.toString())

    return this.makeRequest<Contest[]>(`/api/contests?${queryParams}`)
  }

  async getContest(contestId: string): Promise<ApiResponse<Contest>> {
    return this.makeRequest<Contest>(`/api/contests/${contestId}`)
  }

  async createContest(contestData: CreateContestForm): Promise<ApiResponse<{ contestId: string }>> {
    return this.makeRequest<{ contestId: string }>('/api/contests', {
      method: 'POST',
      body: JSON.stringify(contestData)
    })
  }

  async startContest(contestId: string): Promise<ApiResponse> {
    return this.makeRequest(`/api/contests/${contestId}/start`, {
      method: 'POST'
    })
  }

  async stopContest(contestId: string): Promise<ApiResponse> {
    return this.makeRequest(`/api/contests/${contestId}/stop`, {
      method: 'POST'
    })
  }

  async getContestQuestions(contestId: string): Promise<ApiResponse<Question[]>> {
    return this.makeRequest<Question[]>(`/api/contests/${contestId}/questions`)
  }

  async submitAnswer(contestId: string, questionId: string, answer: number): Promise<ApiResponse> {
    return this.makeRequest(`/api/contests/${contestId}/answers`, {
      method: 'POST',
      body: JSON.stringify({ questionId, answer })
    })
  }

  async submitContest(contestId: string): Promise<ApiResponse> {
    return this.makeRequest(`/api/contests/${contestId}/submit`, {
      method: 'POST'
    })
  }

  async getContestResults(contestId: string): Promise<ApiResponse<{ results: LeaderboardEntry[]; stats: ContestStats }>> {
    return this.makeRequest<{ results: LeaderboardEntry[]; stats: ContestStats }>(`/api/contests/${contestId}/results`)
  }

  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.makeRequest<DashboardStats>('/api/admin/dashboard')
  }

  async getContestStatus(contestId: string): Promise<ApiResponse<{
    contest: Contest
    participation: {
      hasStarted: boolean
      isSubmitted: boolean
      rejoinStatus: string | null
    }
  }>> {
    return this.makeRequest(`/api/students/contests/${contestId}/status`)
  }

  async getContestProgress(contestId: string): Promise<ApiResponse<{
    answers: Record<string, number>
    lastSaved: Date | null
    isSubmitted: boolean
    timeSpent: number
  }>> {
    return this.makeRequest(`/api/students/contests/${contestId}/progress`)
  }
}

export const contestService = new ContestService()
