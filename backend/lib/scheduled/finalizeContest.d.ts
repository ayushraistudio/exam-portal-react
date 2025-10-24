import * as functions from 'firebase-functions';
/**
 * Scheduled function to finalize contests at their end time
 * This function runs every minute to check for contests that need to be finalized
 */
export declare const finalizeContest: functions.CloudFunction<unknown>;
/**
 * HTTP function to manually finalize a contest (admin only)
 */
export declare const manualFinalizeContest: functions.HttpsFunction & functions.Runnable<any>;
/**
 * Function to handle contest auto-submission
 * This is triggered when a contest ends and automatically submits all pending answers
 */
export declare const autoSubmitContest: functions.CloudFunction<functions.Change<functions.firestore.QueryDocumentSnapshot>>;
//# sourceMappingURL=finalizeContest.d.ts.map