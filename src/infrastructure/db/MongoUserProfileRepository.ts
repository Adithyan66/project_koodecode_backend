






import { UserProfile, UserStreak } from '../../domain/entities/UserProfile';

import { IUserProfileRepository } from '../../domain/interfaces/repositories/IUserProfileRepository'; 

import { UserProfileModel } from './models/UserProfileModel';
import { Types } from 'mongoose';

export class MongoUserProfileRepository implements IUserProfileRepository {


    async create(profile: UserProfile): Promise<UserProfile> {
        const newProfile = new UserProfileModel({
            userId: new Types.ObjectId(profile.userId),
            bio: profile.bio,
            location: profile.location,
            birthdate: profile.birthdate,
            gender: profile.gender,
            githubUrl: profile.githubUrl,
            linkedinUrl: profile.linkedinUrl,
            ranking: profile.ranking,
            acceptanceRate: profile.acceptanceRate,
            contestRating: profile.contestRating,
            coinBalance: profile.coinBalance,
            totalProblems: profile.totalProblems,
            easyProblems: profile.easyProblems,
            mediumProblems: profile.mediumProblems,
            hardProblems: profile.hardProblems,
            totalSubmissions: profile.totalSubmissions,
            acceptedSubmissions: profile.acceptedSubmissions,
            rejectedSubmissions: profile.rejectedSubmissions,
            problemsAttempted: profile.problemsAttempted,
            problemsSolved: profile.problemsSolved,
            firstSolveDate: profile.firstSolveDate,
            lastSolveDate: profile.lastSolveDate,
            averageSolveTime: profile.averageSolveTime,
            languagesUsed: profile.languagesUsed || {},
            streak: profile.streak,
            activeDays: profile.activeDays,
            isPremium: profile.isPremium,
            isBlocked: profile.isBlocked,
            badges: profile.badges,
            leaderboard: profile.leaderboard,
            hints: profile.hints,
            activities: profile.activities,
            lastLogin: profile.lastLogin,
        });

        const saved = await newProfile.save();

        return new UserProfile({
            ...profile,
            id: saved._id.toString(),
            createdAt: saved.createdAt,
            updatedAt: saved.updatedAt,
        });
    }

    async findByUserId(userId: string): Promise<UserProfile | null> {
        const profile = await UserProfileModel.findOne({ userId: new Types.ObjectId(userId) });
        if (!profile) return null;

        return new UserProfile({
            userId: profile.userId.toString(),
            bio: profile.bio,
            location: profile.location,
            birthdate: profile.birthdate,
            gender: profile.gender,
            githubUrl: profile.githubUrl,
            linkedinUrl: profile.linkedinUrl,
            ranking: profile.ranking,
            acceptanceRate: profile.acceptanceRate,
            contestRating: profile.contestRating,
            coinBalance: profile.coinBalance,
            totalProblems: profile.totalProblems,
            easyProblems: profile.easyProblems,
            mediumProblems: profile.mediumProblems,
            hardProblems: profile.hardProblems,
            totalSubmissions: profile.totalSubmissions,
            acceptedSubmissions: profile.acceptedSubmissions,
            rejectedSubmissions: profile.rejectedSubmissions,
            problemsAttempted: profile.problemsAttempted,
            problemsSolved: profile.problemsSolved,
            firstSolveDate: profile.firstSolveDate,
            lastSolveDate: profile.lastSolveDate,
            averageSolveTime: profile.averageSolveTime,
            languagesUsed: profile.languagesUsed || {},
            streak: new UserStreak(
                profile.streak.currentCount,
                profile.streak.maxCount,
                profile.streak.lastActiveDate,
                profile.streak.createdAt,
                profile.streak.updatedAt
            ),
            activeDays: profile.activeDays,
            isPremium: profile.isPremium,
            isBlocked: profile.isBlocked,
            badges: profile.badges,
            leaderboard: profile.leaderboard,
            hints: profile.hints,
            activities: profile.activities,
            lastLogin: profile.lastLogin,
            id: profile._id.toString(),
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        });
    }

    async update(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
        const updated = await UserProfileModel.findOneAndUpdate(
            { userId: new Types.ObjectId(userId) },
            updates,
            { new: true, upsert: true }
        );

        if (!updated) throw new Error('Profile not found');

        return new UserProfile({
            userId: updated.userId.toString(),
            bio: updated.bio,
            location: updated.location,
            birthdate: updated.birthdate,
            gender: updated.gender,
            githubUrl: updated.githubUrl,
            linkedinUrl: updated.linkedinUrl,
            ranking: updated.ranking,
            acceptanceRate: updated.acceptanceRate,
            contestRating: updated.contestRating,
            coinBalance: updated.coinBalance,
            totalProblems: updated.totalProblems,
            easyProblems: updated.easyProblems,
            mediumProblems: updated.mediumProblems,
            hardProblems: updated.hardProblems,
            totalSubmissions: updated.totalSubmissions,
            acceptedSubmissions: updated.acceptedSubmissions,
            rejectedSubmissions: updated.rejectedSubmissions,
            problemsAttempted: updated.problemsAttempted,
            problemsSolved: updated.problemsSolved,
            firstSolveDate: updated.firstSolveDate,
            lastSolveDate: updated.lastSolveDate,
            averageSolveTime: updated.averageSolveTime,
            languagesUsed: updated.languagesUsed,

            streak: new UserStreak(
                updated.streak.currentCount,
                updated.streak.maxCount,
                updated.streak.lastActiveDate,
                updated.streak.createdAt,
                updated.streak.updatedAt
            ),
            activeDays: updated.activeDays,
            isPremium: updated.isPremium,
            isBlocked: updated.isBlocked,
            badges: updated.badges,
            leaderboard: updated.leaderboard,
            hints: {
                problemId:updated.hints.problemId,
                
            },
            activities: updated.activities,
            lastLogin: updated.lastLogin,
            id: updated._id.toString(),
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
        });
    }

    async updateStats(userId: string, stats: Partial<UserProfile>): Promise<void> {
        await UserProfileModel.updateOne(
            { userId: new Types.ObjectId(userId) },
            { $set: stats }
        );
    }

    async updateActivities(userId: string, activities: any[]): Promise<void> {
        await UserProfileModel.updateOne(
            { userId: new Types.ObjectId(userId) },
            { $set: { activities } }
        );
    }

    async addBadge(userId: string, badge: any): Promise<void> {
        await UserProfileModel.updateOne(
            { userId: new Types.ObjectId(userId) },
            { $push: { badges: badge } }
        );
    }

    async getLeaderboard(limit: number = 100): Promise<UserProfile[]> {
        const profiles = await UserProfileModel.find({ isBlocked: false })
            .sort({ totalProblems: -1, acceptanceRate: -1 })
            .limit(limit)
            .populate('userId', 'userName fullName profilePicUrl');

        return profiles.map(profile => new UserProfile({
            userId: profile.userId.toString(),
            bio: profile.bio,
            location: profile.location,
            birthdate: profile.birthdate,
            gender: profile.gender,
            githubUrl: profile.githubUrl,
            linkedinUrl: profile.linkedinUrl,
            ranking: profile.ranking,
            acceptanceRate: profile.acceptanceRate,
            contestRating: profile.contestRating,
            coinBalance: profile.coinBalance,
            totalProblems: profile.totalProblems,
            easyProblems: profile.easyProblems,
            mediumProblems: profile.mediumProblems,
            hardProblems: profile.hardProblems,
            streak: new UserStreak(
                profile.streak.currentCount,
                profile.streak.maxCount,
                profile.streak.lastActiveDate,
                profile.streak.createdAt,
                profile.streak.updatedAt
            ),
            activeDays: profile.activeDays,
            isPremium: profile.isPremium,
            isBlocked: profile.isBlocked,
            badges: profile.badges,
            leaderboard: profile.leaderboard,
            hints: profile.hints,
            activities: profile.activities,
            lastLogin: profile.lastLogin,
            id: profile._id.toString(),
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        }));
    }

    async findByRanking(start: number, end: number): Promise<UserProfile[]> {
        const profiles = await UserProfileModel.find({
            ranking: { $gte: start, $lte: end },
            isBlocked: false,
        })
            .sort({ ranking: 1 })
            .populate('userId', 'userName fullName profilePicUrl');

        return profiles.map(profile => new UserProfile({
            userId: profile.userId.toString(),
            bio: profile.bio,
            location: profile.location,
            birthdate: profile.birthdate,
            gender: profile.gender,
            githubUrl: profile.githubUrl,
            linkedinUrl: profile.linkedinUrl,
            ranking: profile.ranking,
            acceptanceRate: profile.acceptanceRate,
            contestRating: profile.contestRating,
            coinBalance: profile.coinBalance,
            totalProblems: profile.totalProblems,
            easyProblems: profile.easyProblems,
            mediumProblems: profile.mediumProblems,
            hardProblems: profile.hardProblems,
            streak: new UserStreak(
                profile.streak.currentCount,
                profile.streak.maxCount,
                profile.streak.lastActiveDate,
                profile.streak.createdAt,
                profile.streak.updatedAt
            ),
            activeDays: profile.activeDays,
            isPremium: profile.isPremium,
            isBlocked: profile.isBlocked,
            badges: profile.badges,
            leaderboard: profile.leaderboard,
            hints: profile.hints,
            activities: profile.activities,
            lastLogin: profile.lastLogin,
            id: profile._id.toString(),
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        }));
    }
}
