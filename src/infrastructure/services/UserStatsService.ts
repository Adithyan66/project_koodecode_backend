

import { IUserStatsService } from '../../application/interfaces/IUserStatsService';
import { IUserRepository } from '../../application/interfaces/IUserRepository';
import { IUserProfileRepository } from '../../application/interfaces/IUserProfileRepository';
import { IBadgeRepository } from '../../application/interfaces/IBadgeRepository';
import { ActivityType, BadgeType, UserProfile } from '../../domain/entities/UserProfile';
import { Badge } from '../../domain/entities/Badge';

export class UserStatsService implements IUserStatsService {
    constructor(
        private userRepository: IUserRepository,
        private profileRepository: IUserProfileRepository,
        private badgeRepository: IBadgeRepository
    ) {}

    async initializeUserProfile(userId: string): Promise<UserProfile> {
        const existingProfile = await this.profileRepository.findByUserId(userId);
        if (existingProfile) {
            return existingProfile;
        }

        const newProfile = new UserProfile(userId);
        return await this.profileRepository.create(newProfile);
    }

    async updateProblemStats(userId: string, difficulty: 'Easy' | 'Medium' | 'Hard'): Promise<void> {
        let profile = await this.profileRepository.findByUserId(userId);
        if (!profile) {
            profile = await this.initializeUserProfile(userId);
        }

        profile.totalProblems += 1;
        
        switch (difficulty) {
            case 'Easy':
                profile.easyProblems += 1;
                break;
            case 'Medium':
                profile.mediumProblems += 1;
                break;
            case 'Hard':
                profile.hardProblems += 1;
                break;
        }

        await this.profileRepository.update(userId, {
            totalProblems: profile.totalProblems,
            easyProblems: profile.easyProblems,
            mediumProblems: profile.mediumProblems,
            hardProblems: profile.hardProblems
        });

        // Add activity
        await this.addActivity(userId, ActivityType.PROBLEM_SOLVED);
        
        // Update streak
        await this.updateStreak(userId, true);
        
        // Check for badges
        await this.checkAndAwardBadges(userId);
    }

    async updateStreak(userId: string, isActive: boolean): Promise<void> {
        let profile = await this.profileRepository.findByUserId(userId);
        if (!profile) {
            profile = await this.initializeUserProfile(userId);
        }

        const currentDate = new Date();
        profile.streak.updateStreak(isActive, currentDate);

        if (isActive) {
            const today = currentDate.toISOString().split('T')[0];
            const existingActivity = profile.activities.find(a => a.date === today);
            
            if (!existingActivity) {
                profile.activeDays += 1;
            }
        }

        await this.profileRepository.update(userId, {
            streak: profile.streak,
            activeDays: profile.activeDays
        });

        if (isActive) {
            await this.addActivity(userId, ActivityType.STREAK_MAINTAINED);
        }
    }

    async addActivity(userId: string, activityType: ActivityType, count: number = 1): Promise<void> {
        let profile = await this.profileRepository.findByUserId(userId);
        if (!profile) {
            profile = await this.initializeUserProfile(userId);
        }

        const today = new Date();
        profile.addActivity(today, activityType, count);

        await this.profileRepository.updateActivities(userId, profile.activities);
    }

    async calculateAcceptanceRate(userId: string, totalSubmissions: number, acceptedSubmissions: number): Promise<void> {
        let profile = await this.profileRepository.findByUserId(userId);
        if (!profile) {
            profile = await this.initializeUserProfile(userId);
        }

        const acceptanceRate = profile.calculateAcceptanceRate(totalSubmissions, acceptedSubmissions);
        
        await this.profileRepository.updateStats(userId, {
            acceptanceRate
        });
    }

    async checkAndAwardBadges(userId: string): Promise<void> {
        let profile = await this.profileRepository.findByUserId(userId);
        if (!profile) {
            profile = await this.initializeUserProfile(userId);
        }

        const availableBadges = await this.badgeRepository.findAll();
        const earnedBadgeIds = profile.badges.map(b => b.badgeId);

        for (const badge of availableBadges) {
            if (earnedBadgeIds.includes(badge.id!)) continue;

            const shouldAward = this.checkBadgeCriteria(profile, badge);
            
            if (shouldAward) {
                const userBadge = {
                    badgeId: badge.id!,
                    badgeType: badge.type,
                    name: badge.name,
                    description: badge.description,
                    iconUrl: badge.iconUrl,
                    awardedAt: new Date(),
                    criteria: badge.criteria
                };

                await this.profileRepository.addBadge(userId, userBadge);
                await this.addActivity(userId, ActivityType.BADGE_EARNED);
            }
        }
    }

    private checkBadgeCriteria(profile: UserProfile, badge: Badge): boolean {
        switch (badge.criteria.type) {
            case 'problems_solved':
                return profile.totalProblems >= badge.criteria.threshold;
            case 'easy_problems':
                return profile.easyProblems >= badge.criteria.threshold;
            case 'medium_problems':
                return profile.mediumProblems >= badge.criteria.threshold;
            case 'hard_problems':
                return profile.hardProblems >= badge.criteria.threshold;
            case 'max_streak':
                return profile.streak.maxCount >= badge.criteria.threshold;
            case 'active_days':
                return profile.activeDays >= badge.criteria.threshold;
            default:
                return false;
        }
    }

    async getActivityCalendar(userId: string, year: number): Promise<Map<string, number>> {
        const profile = await this.profileRepository.findByUserId(userId);
        if (!profile) {
            return new Map();
        }

        return profile.getActivityCalendar(year);
    }
}
