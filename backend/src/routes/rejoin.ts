import { Router } from 'express';
import { verifyToken, requireStudent, requireAdmin, updateActivity } from '../middleware/auth';
import * as admin from 'firebase-admin';

const router = Router();

/**
 * POST /api/rejoin/request
 * Request to rejoin a contest (student only)
 */
router.post('/request', verifyToken, requireStudent, updateActivity, async (req, res) => {
  try {
    const { contestId, reason } = req.body;
    const { uid } = req.auth!;

    if (!contestId) {
      return res.status(400).json({
        success: false,
        error: 'Contest ID is required'
      });
    }

    // Check if contest exists and is running
    const contestDoc = await admin.firestore()
      .collection('contests')
      .doc(contestId)
      .get();

    if (!contestDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Contest not found'
      });
    }

    const contest = contestDoc.data();
    if (contest?.status !== 'running') {
      return res.status(400).json({
        success: false,
        error: 'Contest is not running'
      });
    }

    // Check if student has already requested rejoin
    const existingRequest = await admin.firestore()
      .collection('contests')
      .doc(contestId)
      .collection('rejoinRequests')
      .doc(uid)
      .get();

    if (existingRequest.exists) {
      const existingData = existingRequest.data();
      if (existingData?.status === 'pending') {
        return res.status(400).json({
          success: false,
          error: 'Rejoin request already pending'
        });
      }
    }

    // Create rejoin request
    const rejoinRequestData = {
      studentId: uid,
      contestId,
      reason: reason || 'No reason provided',
      status: 'pending',
      requestedAt: admin.firestore.FieldValue.serverTimestamp(),
      approvedAt: null,
      approvedBy: null
    };

    await admin.firestore()
      .collection('contests')
      .doc(contestId)
      .collection('rejoinRequests')
      .doc(uid)
      .set(rejoinRequestData);

    res.json({
      success: true,
      message: 'Rejoin request submitted successfully'
    });
  } catch (error) {
    console.error('Error creating rejoin request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit rejoin request'
    });
  }
});

/**
 * GET /api/rejoin/requests/:contestId
 * Get rejoin requests for a specific contest (admin only)
 */
router.get('/requests/:contestId', verifyToken, requireAdmin, updateActivity, async (req, res) => {
  try {
    const { contestId } = req.params;
    const { status = 'pending' } = req.query;

    const rejoinRequestsSnapshot = await admin.firestore()
      .collection('contests')
      .doc(contestId)
      .collection('rejoinRequests')
      .where('status', '==', status)
      .orderBy('requestedAt', 'desc')
      .get();

    const requests = rejoinRequestsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
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

/**
 * PUT /api/rejoin/approve/:contestId/:studentId
 * Approve rejoin request (admin only)
 */
router.put('/approve/:contestId/:studentId', verifyToken, requireAdmin, updateActivity, async (req, res) => {
  try {
    const { contestId, studentId } = req.params;
    const { uid } = req.auth!;

    // Update rejoin request status
    await admin.firestore()
      .collection('contests')
      .doc(contestId)
      .collection('rejoinRequests')
      .doc(studentId)
      .update({
        status: 'approved',
        approvedAt: admin.firestore.FieldValue.serverTimestamp(),
        approvedBy: uid
      });

    // Reset student's session to allow rejoin
    await admin.firestore()
      .collection('sessions')
      .where('userId', '==', studentId)
      .get()
      .then(snapshot => {
        const batch = admin.firestore().batch();
        snapshot.docs.forEach(doc => {
          batch.update(doc.ref, {
            isActive: false,
            endedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        });
        return batch.commit();
      });

    res.json({
      success: true,
      message: 'Rejoin request approved successfully'
    });
  } catch (error) {
    console.error('Error approving rejoin request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve rejoin request'
    });
  }
});

/**
 * PUT /api/rejoin/reject/:contestId/:studentId
 * Reject rejoin request (admin only)
 */
router.put('/reject/:contestId/:studentId', verifyToken, requireAdmin, updateActivity, async (req, res) => {
  try {
    const { contestId, studentId } = req.params;
    const { uid } = req.auth!;

    // Update rejoin request status
    await admin.firestore()
      .collection('contests')
      .doc(contestId)
      .collection('rejoinRequests')
      .doc(studentId)
      .update({
        status: 'rejected',
        approvedAt: admin.firestore.FieldValue.serverTimestamp(),
        approvedBy: uid
      });

    res.json({
      success: true,
      message: 'Rejoin request rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting rejoin request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject rejoin request'
    });
  }
});

/**
 * GET /api/rejoin/status/:contestId
 * Get student's rejoin status for a contest (student only)
 */
router.get('/status/:contestId', verifyToken, requireStudent, updateActivity, async (req, res) => {
  try {
    const { contestId } = req.params;
    const { uid } = req.auth!;

    const rejoinRequestDoc = await admin.firestore()
      .collection('contests')
      .doc(contestId)
      .collection('rejoinRequests')
      .doc(uid)
      .get();

    if (!rejoinRequestDoc.exists) {
      return res.json({
        success: true,
        data: {
          hasRequested: false,
          status: null
        }
      });
    }

    const requestData = rejoinRequestDoc.data();
    res.json({
      success: true,
      data: {
        hasRequested: true,
        status: requestData?.status,
        reason: requestData?.reason,
        requestedAt: requestData?.requestedAt,
        approvedAt: requestData?.approvedAt
      }
    });
  } catch (error) {
    console.error('Error fetching rejoin status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rejoin status'
    });
  }
});

export { router as rejoinRoutes };