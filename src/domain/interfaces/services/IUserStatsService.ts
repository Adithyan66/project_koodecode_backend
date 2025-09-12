

import { UserProfile, ActivityType } from '../../entities/UserProfile';

export interface IUserStatsService {

    updateProblemStats(userId: string, difficulty: 'Easy' | 'Medium' | 'Hard'): Promise<void>;
    updateStreak(userId: string, isActive: boolean): Promise<void>;
    addActivity(userId: string, activityType: ActivityType, count?: number): Promise<void>;
    calculateAcceptanceRate(userId: string, totalSubmissions: number, acceptedSubmissions: number): Promise<void>;
    checkAndAwardBadges(userId: string): Promise<void>;
    getActivityCalendar(userId: string, year: number): Promise<Map<string, number>>;
    initializeUserProfile(userId: string): Promise<UserProfile>;

}
