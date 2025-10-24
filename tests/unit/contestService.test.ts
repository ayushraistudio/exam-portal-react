import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { contestService } from '../../frontend/src/services/contestService'
import { Contest, Question } from '../../frontend/src/types'

// Mock authService
jest.mock('../../frontend/src/services/authService', () => ({
  authService: {
    getCurrentFirebaseUser: jest.fn(() => ({
      getIdToken: jest.fn().mockResolvedValue('mock-token')
    }))
  }
}))

// Mock fetch
global.fetch = jest.fn()

describe('ContestService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getContests', () => {
    it('should fetch contests successfully', async () => {
      const mockContests: Contest[] = [
        {
          id: 'contest-1',
          title: 'Math Quiz',
          description: 'Basic math questions',
          duration: 3600,
          status: 'running',
          createdAt: new Date(),
          createdBy: 'admin-1',
          totalQuestions: 10,
          maxScore: 100
        }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockContests
        })
      })

      const result = await contestService.getContests()

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.data?.[0].title).toBe('Math Quiz')
    })

    it('should handle API errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'API Error' })
      })

      await expect(contestService.getContests()).rejects.toThrow('API Error')
    })
  })

  describe('createContest', () => {
    it('should create contest successfully', async () => {
      const contestData = {
        title: 'New Quiz',
        description: 'Test quiz',
        duration: 3600,
        questions: [
          {
            text: 'What is 2+2?',
            options: ['3', '4', '5', '6'],
            correctAnswer: 1,
            points: 10
          }
        ]
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: { contestId: 'new-contest-id' }
        })
      })

      const result = await contestService.createContest(contestData)

      expect(result.success).toBe(true)
      expect(result.data?.contestId).toBe('new-contest-id')
    })
  })

  describe('startContest', () => {
    it('should start contest successfully', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          message: 'Contest started successfully'
        })
      })

      const result = await contestService.startContest('contest-1')

      expect(result.success).toBe(true)
      expect(result.message).toBe('Contest started successfully')
    })
  })

  describe('submitAnswer', () => {
    it('should submit answer successfully', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          message: 'Answer saved successfully'
        })
      })

      const result = await contestService.submitAnswer('contest-1', 'question-1', 1)

      expect(result.success).toBe(true)
      expect(result.message).toBe('Answer saved successfully')
    })
  })

  describe('getContestQuestions', () => {
    it('should fetch contest questions successfully', async () => {
      const mockQuestions: Question[] = [
        {
          id: 'q1',
          contestId: 'contest-1',
          order: 1,
          text: 'What is 2+2?',
          options: ['3', '4', '5', '6'],
          points: 10,
          createdAt: new Date()
        }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockQuestions
        })
      })

      const result = await contestService.getContestQuestions('contest-1')

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.data?.[0].text).toBe('What is 2+2?')
    })
  })
})
