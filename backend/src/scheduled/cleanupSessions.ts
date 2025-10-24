import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Scheduled function to cleanup expired sessions
 * Runs every hour to remove inactive sessions
 */
export const cleanupSessions = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    console.log('Running session cleanup...');

    try {
      const now = admin.firestore.Timestamp.now();
      const oneHourAgo = new admin.firestore.Timestamp(
        now.seconds - 3600, // 1 hour ago
        now.nanoseconds
      );

      // Find inactive sessions
      const inactiveSessionsSnapshot = await admin.firestore()
        .collection('sessions')
        .where('isActive', '==', true)
        .where('lastActivity', '<', oneHourAgo)
        .get();

      console.log(`Found ${inactiveSessionsSnapshot.size} inactive sessions to cleanup`);

      if (inactiveSessionsSnapshot.size === 0) {
        console.log('No inactive sessions to cleanup');
        return;
      }

      // Deactivate sessions and clear session IDs from users
      const batch = admin.firestore().batch();
      const userIds = new Set<string>();

      inactiveSessionsSnapshot.docs.forEach(doc => {
        const sessionData = doc.data();
        userIds.add(sessionData.userId);
        
        // Mark session as inactive
        batch.update(doc.ref, { isActive: false });
      });

      // Clear session IDs from users
      for (const userId of userIds) {
        const userRef = admin.firestore().collection('users').doc(userId);
        batch.update(userRef, { sessionId: admin.firestore.FieldValue.delete() });
      }

      await batch.commit();
      console.log(`Cleaned up ${inactiveSessionsSnapshot.size} inactive sessions`);
    } catch (error) {
      console.error('Error in session cleanup:', error);
    }
  });

/**
 * Function to handle session invalidation when user logs in from another device
 */
export const invalidateOldSessions = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const userId = context.params.userId;

    // Check if session ID changed (new login)
    if (before.sessionId !== after.sessionId && before.sessionId) {
      console.log(`Invalidating old session for user ${userId}`);

      try {
        // Invalidate old session
        await admin.firestore()
          .collection('sessions')
          .doc(before.sessionId)
          .update({ isActive: false });

        console.log(`Invalidated old session ${before.sessionId} for user ${userId}`);
      } catch (error) {
        console.error(`Error invalidating old session for user ${userId}:`, error);
      }
    }
  });

/**
 * HTTP function to manually cleanup sessions (admin only)
 */
export const manualCleanupSessions = functions.https.onCall(async (data, context) => {
  // Verify admin authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  const userDoc = await admin.firestore()
    .collection('users')
    .doc(context.auth.uid)
    .get();

  if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }

  try {
    const now = admin.firestore.Timestamp.now();
    const oneHourAgo = new admin.firestore.Timestamp(
      now.seconds - 3600,
      now.nanoseconds
    );

    // Find inactive sessions
    const inactiveSessionsSnapshot = await admin.firestore()
      .collection('sessions')
      .where('isActive', '==', true)
      .where('lastActivity', '<', oneHourAgo)
      .get();

    if (inactiveSessionsSnapshot.size === 0) {
      return { success: true, message: 'No inactive sessions to cleanup', count: 0 };
    }

    // Deactivate sessions
    const batch = admin.firestore().batch();
    inactiveSessionsSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, { isActive: false });
    });

    await batch.commit();

    return { 
      success: true, 
      message: `Cleaned up ${inactiveSessionsSnapshot.size} inactive sessions`,
      count: inactiveSessionsSnapshot.size
    };
  } catch (error) {
    console.error('Error in manual session cleanup:', error);
    throw new functions.https.HttpsError('internal', 'Failed to cleanup sessions');
  }
});
