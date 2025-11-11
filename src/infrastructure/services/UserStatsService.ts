

import { IUserStatsService } from '../../domain/interfaces/services/IUserStatsService';
import { IUserRepository } from '../../domain/interfaces/repositories/IUserRepository';
import { IUserProfileRepository } from '../../domain/interfaces/repositories/IUserProfileRepository';
import { IBadgeRepository } from '../../domain/interfaces/repositories/IBadgeRepository';
import { ActivityType, BadgeType, UserProfile, UserStreak } from '../../domain/entities/UserProfile';
import { Badge } from '../../domain/entities/Badge';
import { inject, injectable } from 'tsyringe';


@injectable()
export class UserStatsService implements IUserStatsService {

    constructor(
        @inject('IUserRepository') private userRepository: IUserRepository,
        @inject('IUserProfileRepository') private profileRepository: IUserProfileRepository,
        @inject('IBadgeRepository') private badgeRepository: IBadgeRepository
    ) { }

    async initializeUserProfile(userId: string): Promise<UserProfile> {
        const existingProfile = await this.profileRepository.findByUserId(userId);
        if (existingProfile) {
            return existingProfile;
        }

        const newProfile = new UserProfile({
            userId,
            acceptanceRate: 0,
            contestRating: 0,
            coinBalance: 0,
            totalProblems: 0,
            easyProblems: 0,
            mediumProblems: 0,
            hardProblems: 0,
            totalSubmissions: 0,
            acceptedSubmissions: 0,
            rejectedSubmissions: 0,
            problemsAttempted: [],
            problemsSolved: [],
            languagesUsed: {},
            streak: new UserStreak(),
            activeDays: 0,
            isPremium: false,
            isBlocked: false,
            badges: [],
            hints: [],
            activities: []
        });
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
        const isFirstActivityToday = await this.addActivity(userId, ActivityType.PROBLEM_SOLVED, 1, profile);

        // Update streak
        await this.updateStreak(userId, true, isFirstActivityToday);

        // Check for badges
        await this.checkAndAwardBadges(userId);
    }

    async updateStreak(userId: string, isActive: boolean, isFirstActivityToday: boolean = false): Promise<void> {
        let profile = await this.profileRepository.findByUserId(userId);
        if (!profile) {
            profile = await this.initializeUserProfile(userId);
        }

        const currentDate = new Date();
        profile.streak.updateStreak(isActive, currentDate);

        if (isActive && isFirstActivityToday) {
            profile.activeDays += 1;
        }

        await this.profileRepository.update(userId, {
            streak: profile.streak,
            activeDays: profile.activeDays
        });

        if (isActive) {
            await this.addActivity(userId, ActivityType.STREAK_MAINTAINED, 1, profile);
        }
    }

    async addActivity(userId: string, activityType: ActivityType, count: number = 1, profile?: UserProfile): Promise<boolean> {
        let workingProfile = profile;
        if (!workingProfile) {
            workingProfile = await this.profileRepository.findByUserId(userId);
            if (!workingProfile) {
                workingProfile = await this.initializeUserProfile(userId);
            }
        }

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const hadActivityToday = workingProfile.activities.some((a: any) => a.date === todayStr);

        workingProfile.addActivity(today, activityType, count);

        await this.profileRepository.updateActivities(userId, workingProfile.activities);
        return !hadActivityToday;
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
        const earnedBadgeIds = new Set(
            (profile.badges || []).map((b: any) => b.badgeId?.toString())
        );

        for (const badge of availableBadges) {
            const badgeId = badge.id?.toString();
            if (!badgeId) continue;
            if (earnedBadgeIds.has(badgeId)) continue;

            const shouldAward = this.checkBadgeCriteria(profile, badge);

            if (shouldAward) {
                const userBadge = {
                    badgeId,
                    badgeType: badge.type,
                    name: badge.name,
                    description: badge.description,
                    iconUrl: badge.iconUrl,
                    awardedAt: new Date(),
                    criteria: badge.criteria
                };

                await this.profileRepository.addBadge(userId, userBadge);
                await this.addActivity(userId, ActivityType.BADGE_EARNED, 1, profile);
                earnedBadgeIds.add(badgeId);
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

    async updateSubmissionStats(
        userId: string,
        problemId: string,
        isAccepted: boolean,
        difficulty: 'easy' | 'medium' | 'hard',
        languageId: number)
        : Promise<void> {

        console.log(`updateSubmissionStats called for user ${userId}, problem ${problemId}, isAccepted: ${isAccepted}`);

        let profile = await this.profileRepository.findByUserId(userId);

        if (!profile) {
            profile = await this.initializeUserProfile(userId);
        }

        const beforeTotalProblems = profile.totalProblems;
        const beforeProblemsSolved = profile.problemsSolved.length;

        profile.incrementSubmissionStats(isAccepted);

        profile.addProblemAttempt(problemId);

        profile.trackLanguageUsage(languageId);

        if (isAccepted) {
            profile.addProblemSolved(problemId, difficulty);
        }

        console.log(`Before: totalProblems=${beforeTotalProblems}, problemsSolved=${beforeProblemsSolved}`);
        console.log(`After: totalProblems=${profile.totalProblems}, problemsSolved=${profile.problemsSolved.length}`);

        await this.profileRepository.update(userId, {
            totalSubmissions: profile.totalSubmissions,
            acceptedSubmissions: profile.acceptedSubmissions,
            rejectedSubmissions: profile.rejectedSubmissions,
            problemsAttempted: profile.problemsAttempted,
            problemsSolved: profile.problemsSolved,
            totalProblems: profile.totalProblems,
            easyProblems: profile.easyProblems,
            mediumProblems: profile.mediumProblems,
            hardProblems: profile.hardProblems,
            acceptanceRate: profile.acceptanceRate,
            languagesUsed: profile.languagesUsed,
            firstSolveDate: profile.firstSolveDate,
            lastSolveDate: profile.lastSolveDate
        });

        // Add activity
        const isFirstActivityToday = await this.addActivity(userId, ActivityType.PROBLEM_SOLVED, 1, profile);

        // Update streak
        await this.updateStreak(userId, true, isFirstActivityToday);

        // Check for badges
        await this.checkAndAwardBadges(userId);
    }

    async trackProblemAttempt(userId: string, problemId: string): Promise<void> {
        let profile = await this.profileRepository.findByUserId(userId);
        if (!profile) {
            profile = await this.initializeUserProfile(userId);
        }

        profile.addProblemAttempt(problemId);

        await this.profileRepository.update(userId, {
            problemsAttempted: profile.problemsAttempted
        });
    }

    async trackProblemSolve(userId: string, problemId: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<void> {
        let profile = await this.profileRepository.findByUserId(userId);
        if (!profile) {
            profile = await this.initializeUserProfile(userId);
        }

        profile.addProblemSolved(problemId, difficulty);

        await this.profileRepository.update(userId, {
            problemsSolved: profile.problemsSolved,
            totalProblems: profile.totalProblems,
            easyProblems: profile.easyProblems,
            mediumProblems: profile.mediumProblems,
            hardProblems: profile.hardProblems,
            firstSolveDate: profile.firstSolveDate,
            lastSolveDate: profile.lastSolveDate
        });

        // Add activity
        const isFirstActivityToday = await this.addActivity(userId, ActivityType.PROBLEM_SOLVED, 1, profile);

        // Update streak
        await this.updateStreak(userId, true, isFirstActivityToday);

        // Check for badges
        await this.checkAndAwardBadges(userId);
    }
}
