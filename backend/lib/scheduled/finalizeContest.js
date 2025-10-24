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
exports.autoSubmitContest = exports.manualFinalizeContest = exports.finalizeContest = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const contestService_1 = require("../services/contestService");
const contestService = new contestService_1.ContestService();
/**
 * Scheduled function to finalize contests at their end time
 * This function runs every minute to check for contests that need to be finalized
 */
exports.finalizeContest = functions.pubsub
    .schedule('every 1 minutes')
    .onRun(async (context) => {
    console.log('Running contest finalization check...');
    try {
        // Find contests that should be finalized
        const now = admin.firestore.Timestamp.now();
        const contestsSnapshot = await admin.firestore()
            .collection('contests')
            .where('status', '==', 'running')
            .where('endTime', '<=', now)
            .get();
        console.log(`Found ${contestsSnapshot.size} contests to finalize`);
        // Finalize each contest
        for (const contestDoc of contestsSnapshot.docs) {
            const contestId = contestDoc.id;
            const contest = contestDoc.data();
            console.log(`Finalizing contest: ${contest.title} (${contestId})`);
            try {
                await contestService.finalizeContest(contestId);
                console.log(`Successfully finalized contest: ${contestId}`);
            }
            catch (error) {
                console.error(`Failed to finalize contest ${contestId}:`, error);
                // Mark contest as failed to finalize
                await admin.firestore()
                    .collection('contests')
                    .doc(contestId)
                    .update({
                    status: 'completed',
                    finalizationError: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
        console.log('Contest finalization check completed');
    }
    catch (error) {
        console.error('Error in contest finalization:', error);
    }
});
/**
 * HTTP function to manually finalize a contest (admin only)
 */
exports.manualFinalizeContest = functions.https.onCall(async (data, context) => {
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
    const { contestId } = data;
    if (!contestId) {
        throw new functions.https.HttpsError('invalid-argument', 'Contest ID is required');
    }
    try {
        await contestService.finalizeContest(contestId);
        return { success: true, message: 'Contest finalized successfully' };
    }
    catch (error) {
        console.error('Error finalizing contest:', error);
        throw new functions.https.HttpsError('internal', 'Failed to finalize contest');
    }
});
/**
 * Function to handle contest auto-submission
 * This is triggered when a contest ends and automatically submits all pending answers
 */
exports.autoSubmitContest = functions.firestore
    .document('contests/{contestId}')
    .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const contestId = context.params.contestId;
    // Check if contest status changed to completed
    if (before.status !== 'completed' && after.status === 'completed') {
        console.log(`Contest ${contestId} completed, auto-submitting pending answers`);
        try {
            // Get all pending answers for this contest
            const answersSnapshot = await admin.firestore()
                .collection('contests')
                .doc(contestId)
                .collection('answers')
                .where('isSubmitted', '==', false)
                .get();
            console.log(`Found ${answersSnapshot.size} pending answers to auto-submit`);
            // Auto-submit each pending answer
            const batch = admin.firestore().batch();
            const now = admin.firestore.FieldValue.serverTimestamp();
            answersSnapshot.docs.forEach(doc => {
                batch.update(doc.ref, {
                    isSubmitted: true,
                    submittedAt: now,
                    autoSubmitted: true
                });
            });
            await batch.commit();
            console.log(`Auto-submitted ${answersSnapshot.size} answers for contest ${contestId}`);
        }
        catch (error) {
            console.error(`Error auto-submitting answers for contest ${contestId}:`, error);
        }
    }
});
//# sourceMappingURL=finalizeContest.js.map