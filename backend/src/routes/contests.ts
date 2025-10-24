import { Router } from 'express';
import { verifyToken, requireAdmin, requireStudent, updateActivity } from '../middleware/auth';
import { ContestService } from '../services/contestService';
import { CreateContestRequest, StartContestRequest, SubmitAnswerRequest } from '../types';

const router = Router();
const contestService = new ContestService();

/**
 * GET /api/contests
 * Get all contests (admin) or available contests (student)
 */
router.get('/', verifyToken, updateActivity, async (req, res) => {
  try {
    const { role } = req.auth!;
    const { status, limit = 10, offset = 0 } = req.query;

    let query = contestService.db.collection('contests');
    
    if (role === 'student') {
      // Students can only see running or completed contests
      query = query.where('status', 'in', ['running', 'completed']);
    } else if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string))
      .get();

    const contests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      data: contests
    });
  } catch (error) {
    console.error('Error fetching contests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contests'
    });
  }
});

/**
 * GET /api/contests/:id
 * Get specific contest details
 */
router.get('/:id', verifyToken, updateActivity, async (req, res) => {
  try {
    const { id } = req.params;
    const contest = await contestService.getContest(id);

    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Contest not found'
      });
    }

    // Students can only see running contests
    if (req.auth!.role === 'student' && contest.status !== 'running') {
      return res.status(403).json({
        success: false,
        error: 'Contest not accessible'
      });
    }

    res.json({
      success: true,
      data: contest
    });
  } catch (error) {
    console.error('Error fetching contest:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contest'
    });
  }
});

/**
 * GET /api/contests/:id/questions
 * Get contest questions
 */
router.get('/:id/questions', verifyToken, updateActivity, async (req, res) => {
  try {
    const { id } = req.params;
    const questions = await contestService.getContestQuestions(id);

    res.json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error('Error fetching contest questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch questions'
    });
  }
});

/**
 * POST /api/contests/:id/start
 * Start contest (admin only)
 */
router.post('/:id/start', verifyToken, requireAdmin, updateActivity, async (req, res) => {
  try {
    const { id } = req.params;
    await contestService.startContest(id);

    res.json({
      success: true,
      message: 'Contest started successfully'
    });
  } catch (error) {
    console.error('Error starting contest:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start contest'
    });
  }
});

/**
 * POST /api/contests/:id/stop
 * Stop contest (admin only)
 */
router.post('/:id/stop', verifyToken, requireAdmin, updateActivity, async (req, res) => {
  try {
    const { id } = req.params;
    await contestService.stopContest(id);

    res.json({
      success: true,
      message: 'Contest stopped successfully'
    });
  } catch (error) {
    console.error('Error stopping contest:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to stop contest'
    });
  }
});

/**
 * POST /api/contests/:id/answers
 * Submit answer (student only)
 */
router.post('/:id/answers', verifyToken, requireStudent, updateActivity, async (req, res) => {
  try {
    const { id } = req.params;
    const answerData: SubmitAnswerRequest = req.body;
    
    await contestService.submitAnswer(id, req.auth!.userId, answerData);

    res.json({
      success: true,
      message: 'Answer submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit answer'
    });
  }
});

/**
 * POST /api/contests/:id/submit
 * Submit contest (student only)
 */
router.post('/:id/submit', verifyToken, requireStudent, updateActivity, async (req, res) => {
  try {
    const { id } = req.params;
    await contestService.submitContest(id, req.auth!.userId);

    res.json({
      success: true,
      message: 'Contest submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting contest:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit contest'
    });
  }
});

/**
 * GET /api/contests/:id/results
 * Get contest results
 */
router.get('/:id/results', verifyToken, updateActivity, async (req, res) => {
  try {
    const { id } = req.params;
    const results = await contestService.getContestResults(id);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching contest results:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch results'
    });
  }
});

/**
 * POST /api/contests
 * Create new contest (admin only)
 */
router.post('/', verifyToken, requireAdmin, updateActivity, async (req, res) => {
  try {
    const contestData: CreateContestRequest = req.body;
    
    // Validate required fields
    if (!contestData.title || !contestData.duration || !contestData.questions) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Validate duration (1 or 2 hours)
    if (contestData.duration !== 3600 && contestData.duration !== 7200) {
      return res.status(400).json({
        success: false,
        error: 'Duration must be 1 hour (3600s) or 2 hours (7200s)'
      });
    }

    // Validate questions
    if (contestData.questions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Contest must have at least one question'
      });
    }

    const contestId = await contestService.createContest(
      {
        title: contestData.title,
        description: contestData.description,
        duration: contestData.duration,
        status: 'draft',
        createdBy: req.auth!.uid
      },
      contestData.questions
    );

    res.status(201).json({
      success: true,
      data: { contestId },
      message: 'Contest created successfully'
    });
  } catch (error) {
    console.error('Error creating contest:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create contest'
    });
  }
});

/**
 * POST /api/contests/:id/start
 * Start contest (admin only)
 */
router.post('/:id/start', verifyToken, requireAdmin, updateActivity, async (req, res) => {
  try {
    const { id } = req.params;
    await contestService.startContest(id);

    res.json({
      success: true,
      message: 'Contest started successfully'
    });
  } catch (error) {
    console.error('Error starting contest:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start contest'
    });
  }
});

/**
 * POST /api/contests/:id/stop
 * Stop contest (admin only)
 */
router.post('/:id/stop', verifyToken, requireAdmin, updateActivity, async (req, res) => {
  try {
    const { id } = req.params;
    await contestService.stopContest(id);

    res.json({
      success: true,
      message: 'Contest stopped successfully'
    });
  } catch (error) {
    console.error('Error stopping contest:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to stop contest'
    });
  }
});

/**
 * GET /api/contests/:id/questions
 * Get contest questions (students only during running contest)
 */
router.get('/:id/questions', verifyToken, requireStudent, updateActivity, async (req, res) => {
  try {
    const { id } = req.params;
    const contest = await contestService.getContest(id);

    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Contest not found'
      });
    }

    if (contest.status !== 'running') {
      return res.status(403).json({
        success: false,
        error: 'Contest is not running'
      });
    }

    const questions = await contestService.getContestQuestions(id);
    
    // Remove correct answers for students
    const studentQuestions = questions.map(q => ({
      id: q.id,
      order: q.order,
      text: q.text,
      imageUrl: q.imageUrl,
      options: q.options
      // correctAnswer is intentionally omitted
    }));

    res.json({
      success: true,
      data: studentQuestions
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch questions'
    });
  }
});

/**
 * POST /api/contests/:id/answers
 * Submit answer (students only)
 */
router.post('/:id/answers', verifyToken, requireStudent, updateActivity, async (req, res) => {
  try {
    const { id } = req.params;
    const { questionId, answer }: SubmitAnswerRequest = req.body;

    if (!questionId || answer === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing questionId or answer'
      });
    }

    const contest = await contestService.getContest(id);
    if (!contest || contest.status !== 'running') {
      return res.status(403).json({
        success: false,
        error: 'Contest is not running'
      });
    }

    await contestService.saveAnswer(req.auth!.uid, id, questionId, answer);

    res.json({
      success: true,
      message: 'Answer saved successfully'
    });
  } catch (error) {
    console.error('Error saving answer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save answer'
    });
  }
});

/**
 * POST /api/contests/:id/submit
 * Submit contest (students only)
 */
router.post('/:id/submit', verifyToken, requireStudent, updateActivity, async (req, res) => {
  try {
    const { id } = req.params;
    const contest = await contestService.getContest(id);

    if (!contest || contest.status !== 'running') {
      return res.status(403).json({
        success: false,
        error: 'Contest is not running'
      });
    }

    await contestService.submitAnswers(req.auth!.uid, id);

    res.json({
      success: true,
      message: 'Contest submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting contest:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit contest'
    });
  }
});

/**
 * GET /api/contests/:id/results
 * Get contest results (admin only)
 */
router.get('/:id/results', verifyToken, requireAdmin, updateActivity, async (req, res) => {
  try {
    const { id } = req.params;
    const results = await contestService.getContestResults(id);
    const stats = await contestService.getContestStats(id);

    res.json({
      success: true,
      data: {
        results,
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch results'
    });
  }
});

export { router as contestRoutes };
