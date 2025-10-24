"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.manualCleanupSessions = exports.invalidateOldSessions = exports.cleanupSessions = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
/**
 * Scheduled function to cleanup expired sessions
 * Runs every hour to remove inactive sessions
 */
exports.cleanupSessions = functions.pubsub
    .schedule('every 1 hours')
    .onRun(async (context) => {
    console.log('Running session cleanup...');
    try {
        const now = admin.firestore.Timestamp.now();
        const oneHourAgo = new admin.firestore.Timestamp(now.seconds - 3600, // 1 hour ago
        now.nanoseconds);
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
        const userIds = new Set();
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
    }
    catch (error) {
        console.error('Error in session cleanup:', error);
    }
});
/**
 * Function to handle session invalidation when user logs in from another device
 */
exports.invalidateOldSessions = functions.firestore
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
        }
        catch (error) {
            console.error(`Error invalidating old session for user ${userId}:`, error);
        }
    }
});
/**
 * HTTP function to manually cleanup sessions (admin only)
 */
exports.manualCleanupSessions = functions.https.onCall(async (data, context) => {
    var _a;
    // Verify admin authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }
    const userDoc = await admin.firestore()
        .collection('users')
        .doc(context.auth.uid)
        .get();
    if (!userDoc.exists || ((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Admin access required');
    }
    try {
        const now = admin.firestore.Timestamp.now();
        const oneHourAgo = new admin.firestore.Timestamp(now.seconds - 3600, now.nanoseconds);
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
    }
    catch (error) {
        console.error('Error in manual session cleanup:', error);
        throw new functions.https.HttpsError('internal', 'Failed to cleanup sessions');
    }
});
//# sourceMappingURL=cleanupSessions.js.map