import * as admin from 'firebase-admin';
import { Contest, Question, Answer, Result, ContestStats, LeaderboardEntry } from '../types';

export class ContestService {
  private db = admin.firestore();

  /**
   * Create a new contest
   */
  async createContest(contestData: Omit<Contest, 'id' | 'createdAt' | 'totalQuestions' | 'maxScore'>, questions: Omit<Question, 'id' | 'contestId' | 'createdAt'>[]): Promise<string> {
    const contestRef = this.db.collection('contests').doc();
    const contestId = contestRef.id;

    const contest: Contest = {
      id: contestId,
      ...contestData,
      createdAt: admin.firestore.FieldValue.serverTimestamp() as any,
      totalQuestions: questions.length,
      maxScore: questions.reduce((sum, q) => sum + q.points, 0)
    };

    // Create contest document
    await contestRef.set(contest);

    // Create questions
    const batch = this.db.batch();
    questions.forEach((question, index) => {
      const questionRef = this.db.collection('contests').doc(contestId).collection('questions').doc();
      batch.set(questionRef, {
        ...question,
        id: questionRef.id,
        contestId,
        order: index + 1,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();
    return contestId;
  }

  /**
   * Start a contest
   */
  async startContest(contestId: string): Promise<void> {
    const contestRef = this.db.collection('contests').doc(contestId);
    const contestDoc = await contestRef.get();

    if (!contestDoc.exists) {
      throw new Error('Contest not found');
    }

    const contest = contestDoc.data() as Contest;
    
    if (contest.status !== 'draft' && contest.status !== 'scheduled') {
      throw new Error('Contest cannot be started');
    }

    const startTime = admin.firestore.Timestamp.now();
    const endTime = new admin.firestore.Timestamp(
      startTime.seconds + contest.duration,
      startTime.nanoseconds
    );

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
  async stopContest(contestId: string): Promise<void> {
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
  async getContest(contestId: string): Promise<Contest | null> {
    const contestDoc = await this.db.collection('contests').doc(contestId).get();
    
    if (!contestDoc.exists) {
      return null;
    }

    return { id: contestDoc.id, ...contestDoc.data() } as Contest;
  }

  /**
   * Get contest questions
   */
  async getContestQuestions(contestId: string): Promise<Question[]> {
    const questionsSnapshot = await this.db
      .collection('contests')
      .doc(contestId)
      .collection('questions')
      .orderBy('order')
      .get();

    return questionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Question[];
  }

  /**
   * Save student answer
   */
  async saveAnswer(userId: string, contestId: string, questionId: string, answer: number): Promise<void> {
    const answerRef = this.db
      .collection('contests')
      .doc(contestId)
      .collection('answers')
      .doc(userId);

    const answerDoc = await answerRef.get();
    
    if (answerDoc.exists) {
      const existingAnswer = answerDoc.data() as Answer;
      await answerRef.update({
        answers: {
          ...existingAnswer.answers,
          [questionId]: answer
        },
        lastSaved: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
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
  async submitAnswers(userId: string, contestId: string): Promise<void> {
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
  async finalizeContest(contestId: string): Promise<void> {
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

    const results: Result[] = [];
    const batch = this.db.batch();

    // Calculate results for each student
    for (const answerDoc of answersSnapshot.docs) {
      const answer = answerDoc.data() as Answer;
      const userDoc = await this.db.collection('users').doc(answer.userId).get();
      
      if (!userDoc.exists) continue;

      const userData = userDoc.data();
      let score = 0;
      const detailedAnswers: Record<string, any> = {};

      // Calculate score
      questions.forEach(question => {
        const selectedAnswer = answer.answers[question.id];
        const isCorrect = selectedAnswer === question.correctAnswer;
        const points = isCorrect ? question.points : 0;
        
        score += points;
        detailedAnswers[question.id] = {
          questionId: question.id,
          selectedAnswer: selectedAnswer ?? -1,
          correctAnswer: question.correctAnswer,
          isCorrect,
          points
        };
      });

      const result: Result = {
        userId: answer.userId,
        contestId,
        username: userData?.username || 'Unknown',
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
      if (b.score !== a.score) return b.score - a.score;
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
  async getContestResults(contestId: string): Promise<LeaderboardEntry[]> {
    const resultsSnapshot = await this.db
      .collection('contests')
      .doc(contestId)
      .collection('results')
      .orderBy('score', 'desc')
      .orderBy('timeTaken', 'asc')
      .get();

    return resultsSnapshot.docs.map((doc, index) => {
      const data = doc.data() as Result;
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
  async getContestStats(contestId: string): Promise<ContestStats> {
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
    const maxPossibleScore = contest?.maxScore || 1;

    return {
      totalParticipants: results.length,
      averageScore: totalScore / results.length,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      completionRate: (results.length / (contest?.totalQuestions || 1)) * 100
    };
  }

  /**
   * Schedule contest finalization
   */
  private async scheduleContestFinalization(contestId: string, endTime: admin.firestore.Timestamp): Promise<void> {
    // This would typically use Cloud Scheduler or a similar service
    // For now, we'll use a simple setTimeout (not recommended for production)
    const delay = (endTime.seconds * 1000) - Date.now();
    
    if (delay > 0) {
      setTimeout(async () => {
        try {
          await this.finalizeContest(contestId);
        } catch (error) {
          console.error('Failed to finalize contest:', error);
        }
      }, delay);
    }
  }
}
