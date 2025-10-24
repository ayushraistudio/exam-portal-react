import { RejoinRequest, ApiResponse } from '../types'
import { authService } from './authService'

class RejoinService {
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

  async requestRejoin(contestId: string, reason?: string): Promise<ApiResponse> {
    return this.makeRequest('/api/rejoin/request', {
      method: 'POST',
      body: JSON.stringify({ contestId, reason })
    })
  }

  async getRejoinRequests(params: { contestId?: string; status?: string } = {}): Promise<ApiResponse<RejoinRequest[]>> {
    const queryParams = new URLSearchParams()
    if (params.contestId) queryParams.append('contestId', params.contestId)
    if (params.status) queryParams.append('status', params.status)

    return this.makeRequest<RejoinRequest[]>(`/api/rejoin/requests?${queryParams}`)
  }

  async approveRejoin(contestId: string, userId: string, action: 'approve' | 'reject', reason?: string): Promise<ApiResponse> {
    return this.makeRequest('/api/rejoin/approve', {
      method: 'POST',
      body: JSON.stringify({ contestId, userId, action, reason })
    })
  }

  async getRejoinStatus(contestId: string): Promise<ApiResponse<{
    hasRequest: boolean
    status: string | null
    requestedAt?: Date
    approvedAt?: Date
    reason?: string
  }>> {
    return this.makeRequest(`/api/rejoin/status/${contestId}`)
  }
}

export const rejoinService = new RejoinService()
