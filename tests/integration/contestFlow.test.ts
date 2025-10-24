import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { ContestService } from '../../backend/src/services/contestService'
import * as admin from 'firebase-admin'

// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn()
      })),
      where: jest.fn(() => ({
        get: jest.fn(),
        orderBy: jest.fn(() => ({
          get: jest.fn()
        }))
      })),
      orderBy: jest.fn(() => ({
        get: jest.fn()
      }))
    }))
  })),
  auth: jest.fn(() => ({
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn()
  })),
  firestore: {
    FieldValue: {
      serverTimestamp: jest.fn(() => new Date())
    },
    Timestamp: {
      now: jest.fn(() => new Date())
    }
  }
}))

describe('Contest Flow Integration Tests', () => {
  let contestService: ContestService

  beforeEach(() => {
    contestService = new ContestService()
    jest.clearAllMocks()
  })

  describe('Contest Creation and Management', () => {
    it('should create a contest with questions', async () => {
      const contestData = {
        title: 'Integration Test Quiz',
        description: 'Test quiz for integration testing',
        duration: 3600,
        status: 'draft' as const,
        createdBy: 'admin-1'
      }

      const questions = [
        {
          text: 'What is the capital of France?',
          options: ['London', 'Berlin', 'Paris', 'Madrid'],
          correctAnswer: 2,
          points: 10
        },
        {
          text: 'What is 2 + 2?',
          options: ['3', '4', '5', '6'],
          correctAnswer: 1,
          points: 10
        }
      ]

      // Mock Firestore operations
      const mockDoc = {
        id: 'test-contest-id',
        set: jest.fn().mockResolvedValue(undefined)
      }

      const mockCollection = {
        doc: jest.fn().mockReturnValue(mockDoc),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
          docs: []
        })
      }

      const mockBatch = {
        set: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined)
      }

      ;(admin.firestore as jest.Mock).mockReturnValue({
        collection: jest.fn().mockReturnValue(mockCollection),
        batch: jest.fn().mockReturnValue(mockBatch)
      })

      const contestId = await contestService.createContest(contestData, questions)

      expect(contestId).toBe('test-contest-id')
      expect(mockDoc.set).toHaveBeenCalled()
      expect(mockBatch.commit).toHaveBeenCalled()
    })

    it('should start a contest and set timestamps', async () => {
      const contestId = 'test-contest-id'
      const mockContest = {
        id: contestId,
        title: 'Test Contest',
        duration: 3600,
        status: 'draft'
      }

      const mockDoc = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => mockContest
        }),
        update: jest.fn().mockResolvedValue(undefined)
      }

      const mockCollection = {
        doc: jest.fn().mockReturnValue(mockDoc)
      }

      ;(admin.firestore as jest.Mock).mockReturnValue({
        collection: jest.fn().mockReturnValue(mockCollection)
      })

      await contestService.startContest(contestId)

      expect(mockDoc.update).toHaveBeenCalledWith({
        status: 'running',
        startTime: expect.any(Object),
        endTime: expect.any(Object)
      })
    })
  })

  describe('Answer Submission and Scoring', () => {
    it('should save student answers', async () => {
      const userId = 'student-1'
      const contestId = 'contest-1'
      const questionId = 'question-1'
      const answer = 2

      const mockDoc = {
        get: jest.fn().mockResolvedValue({
          exists: false
        }),
        set: jest.fn().mockResolvedValue(undefined)
      }

      const mockCollection = {
        doc: jest.fn().mockReturnValue(mockDoc)
      }

      ;(admin.firestore as jest.Mock).mockReturnValue({
        collection: jest.fn().mockReturnValue(mockCollection)
      })

      await contestService.saveAnswer(userId, contestId, questionId, answer)

      expect(mockDoc.set).toHaveBeenCalledWith({
        userId,
        contestId,
        answers: { [questionId]: answer },
        lastSaved: expect.any(Object),
        isSubmitted: false,
        timeSpent: 0
      })
    })

    it('should calculate contest results correctly', async () => {
      const contestId = 'contest-1'
      const mockContest = {
        id: contestId,
        maxScore: 20
      }

      const mockQuestions = [
        {
          id: 'q1',
          correctAnswer: 1,
          points: 10
        },
        {
          id: 'q2',
          correctAnswer: 2,
          points: 10
        }
      ]

      const mockAnswers = [
        {
          id: 'student-1',
          data: () => ({
            userId: 'student-1',
            answers: { q1: 1, q2: 2 }, // Both correct
            timeSpent: 1200
          })
        },
        {
          id: 'student-2',
          data: () => ({
            userId: 'student-2',
            answers: { q1: 0, q2: 1 }, // Both incorrect
            timeSpent: 1800
          })
        }
      ]

      const mockUserDocs = [
        {
          data: () => ({ username: 'student1' })
        },
        {
          data: () => ({ username: 'student2' })
        }
      ]

      // Mock Firestore operations
      const mockDoc = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => mockContest
        })
      }

      const mockCollection = {
        doc: jest.fn().mockReturnValue(mockDoc),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
          docs: mockAnswers
        })
      }

      const mockBatch = {
        set: jest.fn(),
        update: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined)
      }

      ;(admin.firestore as jest.Mock).mockReturnValue({
        collection: jest.fn().mockReturnValue(mockCollection),
        batch: jest.fn().mockReturnValue(mockBatch)
      })

      // Mock getContestQuestions
      jest.spyOn(contestService, 'getContestQuestions').mockResolvedValue(mockQuestions as any)

      // Mock user data retrieval
      const mockUserCollection = {
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: mockUserDocs[0]
          })
        })
      }

      ;(admin.firestore as jest.Mock).mockReturnValue({
        collection: jest.fn().mockImplementation((path) => {
          if (path === 'users') return mockUserCollection
          return mockCollection
        }),
        batch: jest.fn().mockReturnValue(mockBatch)
      })

      await contestService.finalizeContest(contestId)

      expect(mockBatch.commit).toHaveBeenCalled()
    })
  })
})
