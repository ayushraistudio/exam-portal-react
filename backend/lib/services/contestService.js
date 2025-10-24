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
exports.ContestService = void 0;
const admin = __importStar(require("firebase-admin"));
class ContestService {
    constructor() {
        this.db = admin.firestore();
    }
    /**
     * Create a new contest
     */
    async createContest(contestData, questions) {
        const contestRef = this.db.collection('contests').doc();
        const contestId = contestRef.id;
        const contest = Object.assign(Object.assign({ id: contestId }, contestData), { createdAt: admin.firestore.FieldValue.serverTimestamp(), totalQuestions: questions.length, maxScore: questions.reduce((sum, q) => sum + q.points, 0) });
        // Create contest document
        await contestRef.set(contest);
        // Create questions
        const batch = this.db.batch();
        questions.forEach((question, index) => {
            const questionRef = this.db.collection('contests').doc(contestId).collection('questions').doc();
            batch.set(questionRef, Object.assign(Object.assign({}, question), { id: questionRef.id, contestId, order: index + 1, createdAt: admin.firestore.FieldValue.serverTimestamp() }));
        });
        await batch.commit();
        return contestId;
    }
    /**
     * Start a contest
     */
    async startContest(contestId) {
        const contestRef = this.db.collection('contests').doc(contestId);
        const contestDoc = await contestRef.get();
        if (!contestDoc.exists) {
            throw new Error('Contest not found');
        }
        const contest = contestDoc.data();
        if (contest.status !== 'draft' && contest.status !== 'scheduled') {
            throw new Error('Contest cannot be started');
        }
        const startTime = admin.firestore.Timestamp.now();
        const endTime = new admin.firestore.Timestamp(startTime.seconds + contest.duration, startTime.nanoseconds);
        await contestRef.update({
            status: 'running',
            startTime,
            endTime
        });
        // Schedule auto-finalization
        await this.scheduleContestFinalization(contestId, endTime);
    }
    /**
     * Stop a contest
     */
    async stopContest(contestId) {
        const contestRef = this.db.collection('contests').doc(contestId);
        await contestRef.update({
            status: 'completed',
            endTime: admin.firestore.FieldValue.serverTimestamp()
        });
        // Finalize immediately
        await this.finalizeContest(contestId);
    }
    /**
     * Get contest details
     */
    async getContest(contestId) {
        const contestDoc = await this.db.collection('contests').doc(contestId).get();
        if (!contestDoc.exists) {
            return null;
        }
        return Object.assign({ id: contestDoc.id }, contestDoc.data());
    }
    /**
     * Get contest questions
     */
    async getContestQuestions(contestId) {
        const questionsSnapshot = await this.db
            .collection('contests')
            .doc(contestId)
            .collection('questions')
            .orderBy('order')
            .get();
        return questionsSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
    }
    /**
     * Save student answer
     */
    async saveAnswer(userId, contestId, questionId, answer) {
        const answerRef = this.db
            .collection('contests')
            .doc(contestId)
            .collection('answers')
            .doc(userId);
        const answerDoc = await answerRef.get();
        if (answerDoc.exists) {
            const existingAnswer = answerDoc.data();
            await answerRef.update({
                answers: Object.assign(Object.assign({}, existingAnswer.answers), { [questionId]: answer }),
                lastSaved: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        else {
            await answerRef.set({
                userId,
                contestId,
                answers: { [questionId]: answer },
                lastSaved: admin.firestore.FieldValue.serverTimestamp(),
                isSubmitted: false,
                timeSpent: 0
            });
        }
    }
    /**
     * Submit contest answers
     */
    async submitAnswers(userId, contestId) {
        const answerRef = this.db
            .collection('contests')
            .doc(contestId)
            .collection('answers')
            .doc(userId);
        await answerRef.update({
            isSubmitted: true,
            submittedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }
    /**
     * Finalize contest and calculate results
     */
    async finalizeContest(contestId) {
        const contest = await this.getContest(contestId);
        if (!contest) {
            throw new Error('Contest not found');
        }
        const questions = await this.getContestQuestions(contestId);
        const answersSnapshot = await this.db
            .collection('contests')
            .doc(contestId)
            .collection('answers')
            .get();
        const results = [];
        const batch = this.db.batch();
        // Calculate results for each student
        for (const answerDoc of answersSnapshot.docs) {
            const answer = answerDoc.data();
            const userDoc = await this.db.collection('users').doc(answer.userId).get();
            if (!userDoc.exists)
                continue;
            const userData = userDoc.data();
            let score = 0;
            const detailedAnswers = {};
            // Calculate score
            questions.forEach(question => {
                const selectedAnswer = answer.answers[question.id];
                const isCorrect = selectedAnswer === question.correctAnswer;
                const points = isCorrect ? question.points : 0;
                score += points;
                detailedAnswers[question.id] = {
                    questionId: question.id,
                    selectedAnswer: selectedAnswer !== null && selectedAnswer !== void 0 ? selectedAnswer : -1,
                    correctAnswer: question.correctAnswer,
                    isCorrect,
                    points
                };
            });
            const result = {
                userId: answer.userId,
                contestId,
                username: (userData === null || userData === void 0 ? void 0 : userData.username) || 'Unknown',
                score,
                totalQuestions: questions.length,
                percentage: questions.length > 0 ? (score / contest.maxScore) * 100 : 0,
                timeTaken: answer.timeSpent,
                submittedAt: answer.submittedAt || admin.firestore.Timestamp.now(),
                answers: detailedAnswers
            };
            results.push(result);
            // Save result to Firestore
            const resultRef = this.db
                .collection('contests')
                .doc(contestId)
                .collection('results')
                .doc(answer.userId);
            batch.set(resultRef, result);
        }
        // Calculate ranks
        results.sort((a, b) => {
            if (b.score !== a.score)
                return b.score - a.score;
            return a.timeTaken - b.timeTaken; // Faster completion wins ties
        });
        results.forEach((result, index) => {
            result.rank = index + 1;
        });
        // Update ranks in batch
        results.forEach(result => {
            const resultRef = this.db
                .collection('contests')
                .doc(contestId)
                .collection('results')
                .doc(result.userId);
            batch.update(resultRef, { rank: result.rank });
        });
        await batch.commit();
        // Update contest status
        await this.db.collection('contests').doc(contestId).update({
            status: 'completed'
        });
    }
    /**
     * Get contest results
     */
    async getContestResults(contestId) {
        const resultsSnapshot = await this.db
            .collection('contests')
            .doc(contestId)
            .collection('results')
            .orderBy('score', 'desc')
            .orderBy('timeTaken', 'asc')
            .get();
        return resultsSnapshot.docs.map((doc, index) => {
            const data = doc.data();
            return {
                rank: index + 1,
                userId: data.userId,
                username: data.username,
                score: data.score,
                totalQuestions: data.totalQuestions,
                percentage: data.percentage,
                timeTaken: data.timeTaken,
                submittedAt: data.submittedAt
            };
        });
    }
    /**
     * Get contest statistics
     */
    async getContestStats(contestId) {
        const results = await this.getContestResults(contestId);
        if (results.length === 0) {
            return {
                totalParticipants: 0,
                averageScore: 0,
                highestScore: 0,
                lowestScore: 0,
                completionRate: 0
            };
        }
        const scores = results.map(r => r.score);
        const totalScore = scores.reduce((sum, score) => sum + score, 0);
        const contest = await this.getContest(contestId);
        const maxPossibleScore = (contest === null || contest === void 0 ? void 0 : contest.maxScore) || 1;
        return {
            totalParticipants: results.length,
            averageScore: totalScore / results.length,
            highestScore: Math.max(...scores),
            lowestScore: Math.min(...scores),
            completionRate: (results.length / ((contest === null || contest === void 0 ? void 0 : contest.totalQuestions) || 1)) * 100
        };
    }
    /**
     * Schedule contest finalization
     */
    async scheduleContestFinalization(contestId, endTime) {
        // This would typically use Cloud Scheduler or a similar service
        // For now, we'll use a simple setTimeout (not recommended for production)
        const delay = (endTime.seconds * 1000) - Date.now();
        if (delay > 0) {
            setTimeout(async () => {
                try {
                    await this.finalizeContest(contestId);
                }
                catch (error) {
                    console.error('Failed to finalize contest:', error);
                }
            }, delay);
        }
    }
}
exports.ContestService = ContestService;
//# sourceMappingURL=contestService.js.map