import { Router } from 'express';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken, updateActivity } from '../middleware/auth';

const router = Router();

/**
 * POST /api/auth/login
 * Login user with username/password and create session
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password, userType } = req.body;

    if (!username || !password || !userType) {
      return res.status(400).json({
        success: false,
        error: 'Username, password, and userType are required'
      });
    }

    // Find user by username and role
    const usersSnapshot = await admin.firestore()
      .collection('users')
      .where('username', '==', username)
      .where('role', '==', userType)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();

    // Simple password verification (in production, use proper hashing)
    if (userData.password !== password) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Create new session
    const sessionId = uuidv4();
    const sessionData = {
      sessionId,
      userId: userDoc.id,
      role: userData.role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastActivity: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    // Save session
    await admin.firestore()
      .collection('sessions')
      .doc(sessionId)
      .set(sessionData);

    // Update user with new session ID
    await admin.firestore()
      .collection('users')
      .doc(userDoc.id)
      .update({
        sessionId,
        lastLoginAt: admin.firestore.FieldValue.serverTimestamp()
      });

    // Invalidate old sessions for single session enforcement
    if (userData.sessionId && userData.sessionId !== sessionId) {
      await admin.firestore()
        .collection('sessions')
        .doc(userData.sessionId)
        .update({ isActive: false });
    }

    res.json({
      success: true,
      data: {
        user: {
          uid: userDoc.id,
          username: userData.username,
          role: userData.role,
          email: userData.email
        },
        sessionId
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
});

/**
 * POST /api/auth/login-token
 * Login user with Firebase ID token and create session
 */
router.post('/login-token', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'ID token is required'
      });
    }

    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Get user data from Firestore
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(decodedToken.uid)
      .get();

    if (!userDoc.exists) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    const userData = userDoc.data();
    
    if (!userData?.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is inactive'
      });
    }

    // Create new session
    const sessionId = uuidv4();
    const sessionData = {
      sessionId,
      userId: decodedToken.uid,
      role: userData.role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastActivity: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    // Save session
    await admin.firestore()
      .collection('sessions')
      .doc(sessionId)
      .set(sessionData);

    // Update user with new session ID
    await admin.firestore()
      .collection('users')
      .doc(decodedToken.uid)
      .update({
        sessionId,
        lastLoginAt: admin.firestore.FieldValue.serverTimestamp()
      });

    // Invalidate old sessions for single session enforcement
    if (userData.sessionId && userData.sessionId !== sessionId) {
      await admin.firestore()
        .collection('sessions')
        .doc(userData.sessionId)
        .update({ isActive: false });
    }

    res.json({
      success: true,
      data: {
        user: {
          uid: decodedToken.uid,
          username: userData.username,
          role: userData.role,
          email: userData.email
        },
        sessionId
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user and invalidate session
 */
router.post('/logout', verifyToken, updateActivity, async (req, res) => {
  try {
    const { sessionId } = req.auth!;

    // Invalidate session
    await admin.firestore()
      .collection('sessions')
      .doc(sessionId)
      .update({ isActive: false });

    // Clear session ID from user
    await admin.firestore()
      .collection('users')
      .doc(req.auth!.uid)
      .update({ sessionId: admin.firestore.FieldValue.delete() });

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to logout'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', verifyToken, updateActivity, async (req, res) => {
  try {
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(req.auth!.uid)
      .get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const userData = userDoc.data();

    res.json({
      success: true,
      data: {
        uid: req.auth!.uid,
        username: userData?.username,
        role: userData?.role,
        email: userData?.email,
        createdAt: userData?.createdAt,
        lastLoginAt: userData?.lastLoginAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user info'
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh session activity
 */
router.post('/refresh', verifyToken, updateActivity, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Session refreshed'
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh session'
    });
  }
});

export { router as authRoutes };
