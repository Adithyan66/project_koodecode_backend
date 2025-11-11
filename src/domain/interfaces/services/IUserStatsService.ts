

import { UserProfile, ActivityType } from '../../entities/UserProfile';

export interface IUserStatsService {

    updateProblemStats(userId: string, difficulty: 'Easy' | 'Medium' | 'Hard'): Promise<void>;
    updateStreak(userId: string, isActive: boolean, isFirstActivityToday?: boolean): Promise<void>;
    addActivity(userId: string, activityType: ActivityType, count?: number, profile?: UserProfile): Promise<boolean>;
    calculateAcceptanceRate(userId: string, totalSubmissions: number, acceptedSubmissions: number): Promise<void>;
    checkAndAwardBadges(userId: string): Promise<void>;
    getActivityCalendar(userId: string, year: number): Promise<Map<string, number>>;
    initializeUserProfile(userId: string): Promise<UserProfile>;
    updateSubmissionStats(userId: string, problemId: string, isAccepted: boolean, difficulty: 'easy' | 'medium' | 'hard', languageId: number): Promise<void>;
    trackProblemAttempt(userId: string, problemId: string): Promise<void>;
    trackProblemSolve(userId: string, problemId: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<void>;

}
