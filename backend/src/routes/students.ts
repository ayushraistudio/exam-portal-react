import { Router } from 'express';
import { verifyToken, requireStudent, updateActivity } from '../middleware/auth';
import { ContestService } from '../services/contestService';

const router = Router();
const contestService = new ContestService();

/**
 * GET /api/students/contests
 * Get available contests for student
 */
router.get('/contests', verifyToken, requireStudent, updateActivity, async (req, res) => {
  try {
    const { status = 'running' } = req.query;

    const contestsSnapshot = await contestService.db
      .collection('contests')
      .where('status', '==', status)
      .orderBy('createdAt', 'desc')
      .get();

    const contests = contestsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      data: contests
    });
  } catch (error) {
    console.error('Error fetching student contests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contests'
    });
  }
});

/**
 * GET /api/students/contests/:id/status
 * Get contest status and student's participation status
 */
router.get('/contests/:id/status', verifyToken, requireStudent, updateActivity, async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.auth!;

    const contest = await contestService.getContest(id);
    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Contest not found'
      });
    }

    // Check if student has started the contest
    const answerDoc = await contestService.db
      .collection('contests')
      .doc(id)
      .collection('answers')
      .doc(uid)
      .get();

    const hasStarted = answerDoc.exists;
    const isSubmitted = answerDoc.exists ? answerDoc.data()?.isSubmitted : false;

    // Check for rejoin request
    const rejoinDoc = await contestService.db
      .collection('contests')
      .doc(id)
      .collection('rejoinRequests')
      .doc(uid)
      .get();

    const rejoinStatus = rejoinDoc.exists ? rejoinDoc.data()?.status : null;

    res.json({
      success: true,
      data: {
        contest: {
          id: contest.id,
          title: contest.title,
          status: contest.status,
          startTime: contest.startTime,
          endTime: contest.endTime,
          duration: contest.duration
        },
        participation: {
          hasStarted,
          isSubmitted,
          rejoinStatus
        }
      }
    });
  } catch (error) {
    console.error('Error fetching contest status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contest status'
    });
  }
});

/**
 * GET /api/students/contests/:id/progress
 * Get student's contest progress
 */
router.get('/contests/:id/progress', verifyToken, requireStudent, updateActivity, async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.auth!;

    const answerDoc = await contestService.db
      .collection('contests')
      .doc(id)
      .collection('answers')
      .doc(uid)
      .get();

    if (!answerDoc.exists) {
      return res.json({
        success: true,
        data: {
          answers: {},
          lastSaved: null,
          isSubmitted: false,
          timeSpent: 0
        }
      });
    }

    const answerData = answerDoc.data();
    res.json({
      success: true,
      data: {
        answers: answerData?.answers || {},
        lastSaved: answerData?.lastSaved || null,
        isSubmitted: answerData?.isSubmitted || false,
        timeSpent: answerData?.timeSpent || 0
      }
    });
  } catch (error) {
    console.error('Error fetching contest progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contest progress'
    });
  }
});

export { router as studentRoutes };