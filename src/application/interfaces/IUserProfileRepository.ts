

import { UserProfile } from '../../domain/entities/UserProfile';

export interface IUserProfileRepository {
    
    create(profile: UserProfile): Promise<UserProfile>;
    findByUserId(userId: string): Promise<UserProfile | null>;
    update(userId: string, updates: Partial<UserProfile>): Promise<UserProfile>;
    updateStats(userId: string, stats: Partial<UserProfile>): Promise<void>;
    getLeaderboard(limit?: number): Promise<UserProfile[]>;
    findByRanking(start: number, end: number): Promise<UserProfile[]>;
    updateActivities(userId: string, activities: any[]): Promise<void>;
    addBadge(userId: string, badge: any): Promise<void>;
}
