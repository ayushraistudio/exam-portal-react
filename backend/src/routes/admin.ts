import { Router } from 'express';
import { verifyToken, requireAdmin, updateActivity } from '../middleware/auth';
import { ContestService } from '../services/contestService';
import * as admin from 'firebase-admin';

const router = Router();
const contestService = new ContestService();

/**
 * GET /api/admin/dashboard
 * Get admin dashboard statistics
 */
router.get('/dashboard', verifyToken, requireAdmin, updateActivity, async (req, res) => {
  try {
    // Get total students
    const studentsSnapshot = await admin.firestore()
      .collection('users')
      .where('role', '==', 'student')
      .get();

    // Get total contests
    const contestsSnapshot = await admin.firestore()
      .collection('contests')
      .get();

    // Get running contests
    const runningContestsSnapshot = await admin.firestore()
      .collection('contests')
      .where('status', '==', 'running')
      .get();

    // Get pending rejoin requests
    const rejoinRequestsSnapshot = await admin.firestore()
      .collectionGroup('rejoinRequests')
      .where('status', '==', 'pending')
      .get();

    const stats = {
      totalStudents: studentsSnapshot.size,
      totalContests: contestsSnapshot.size,
      runningContests: runningContestsSnapshot.size,
      pendingRejoinRequests: rejoinRequestsSnapshot.size
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
});

/**
 * GET /api/admin/students
 * Get all students (admin only)
 */
router.get('/students', verifyToken, requireAdmin, updateActivity, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const studentsSnapshot = await admin.firestore()
      .collection('users')
      .where('role', '==', 'student')
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string))
      .get();

    const students = studentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch students'
    });
  }
});

/**
 * POST /api/admin/students
 * Create new student (admin only)
 */
router.post('/students', verifyToken, requireAdmin, updateActivity, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username, email, and password are required'
      });
    }

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: username
    });

    // Create user document in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      username,
      email,
      role: 'student',
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      data: {
        userId: userRecord.uid,
        username,
        email
      }
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create student'
    });
  }
});

/**
 * PUT /api/admin/students/:id
 * Update student (admin only)
 */
router.put('/students/:id', verifyToken, requireAdmin, updateActivity, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, isActive } = req.body;

    const updateData: any = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    await admin.firestore().collection('users').doc(id).update(updateData);

    res.json({
      success: true,
      message: 'Student updated successfully'
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update student'
    });
  }
});

/**
 * DELETE /api/admin/students/:id
 * Delete student (admin only)
 */
router.delete('/students/:id', verifyToken, requireAdmin, updateActivity, async (req, res) => {
  try {
    const { id } = req.params;

    // Delete from Firebase Auth
    await admin.auth().deleteUser(id);

    // Delete from Firestore
    await admin.firestore().collection('users').doc(id).delete();

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete student'
    });
  }
});

/**
 * GET /api/admin/contests
 * Get all contests (admin only)
 */
router.get('/contests', verifyToken, requireAdmin, updateActivity, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let query = admin.firestore().collection('contests');

    if (status) {
      query = query.where('status', '==', status);
    }

    const contestsSnapshot = await query
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string))
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
    console.error('Error fetching contests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contests'
    });
  }
});

/**
 * GET /api/admin/rejoin-requests
 * Get all rejoin requests (admin only)
 */
router.get('/rejoin-requests', verifyToken, requireAdmin, updateActivity, async (req, res) => {
  try {
    const { status = 'pending', limit = 50, offset = 0 } = req.query;

    const rejoinRequestsSnapshot = await admin.firestore()
      .collectionGroup('rejoinRequests')
      .where('status', '==', status)
      .orderBy('requestedAt', 'desc')
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string))
      .get();

    const requests = rejoinRequestsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      contestId: doc.ref.parent.parent?.id
    }));

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching rejoin requests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rejoin requests'
    });
  }
});

export { router as adminRoutes };