import { Contest, Question, ContestStats, LeaderboardEntry } from '../types';
export declare class ContestService {
    private db;
    /**
     * Create a new contest
     */
    createContest(contestData: Omit<Contest, 'id' | 'createdAt' | 'totalQuestions' | 'maxScore'>, questions: Omit<Question, 'id' | 'contestId' | 'createdAt'>[]): Promise<string>;
    /**
     * Start a contest
     */
    startContest(contestId: string): Promise<void>;
    /**
     * Stop a contest
     */
    stopContest(contestId: string): Promise<void>;
    /**
     * Get contest details
     */
    getContest(contestId: string): Promise<Contest | null>;
    /**
     * Get contest questions
     */
    getContestQuestions(contestId: string): Promise<Question[]>;
    /**
     * Save student answer
     */
    saveAnswer(userId: string, contestId: string, questionId: string, answer: number): Promise<void>;
    /**
     * Submit contest answers
     */
    submitAnswers(userId: string, contestId: string): Promise<void>;
    /**
     * Finalize contest and calculate results
     */
    finalizeContest(contestId: string): Promise<void>;
    /**
     * Get contest results
     */
    getContestResults(contestId: string): Promise<LeaderboardEntry[]>;
    /**
     * Get contest statistics
     */
    getContestStats(contestId: string): Promise<ContestStats>;
    /**
     * Schedule contest finalization
     */
    private scheduleContestFinalization;
}
//# sourceMappingURL=contestService.d.ts.map