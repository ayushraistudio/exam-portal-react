import * as functions from 'firebase-functions';
/**
 * Scheduled function to cleanup expired sessions
 * Runs every hour to remove inactive sessions
 */
export declare const cleanupSessions: functions.CloudFunction<unknown>;
/**
 * Function to handle session invalidation when user logs in from another device
 */
export declare const invalidateOldSessions: functions.CloudFunction<functions.Change<functions.firestore.QueryDocumentSnapshot>>;
/**
 * HTTP function to manually cleanup sessions (admin only)
 */
export declare const manualCleanupSessions: functions.HttpsFunction & functions.Runnable<any>;
//# sourceMappingURL=cleanupSessions.d.ts.map