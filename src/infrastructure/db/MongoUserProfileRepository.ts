






import { UserBadge, UserProfile, UserStreak } from '../../domain/entities/UserProfile';

import { BadgeHolderQueryParams, BadgeHolderQueryResult, BadgeHolderRecord, IUserProfileRepository } from '../../domain/interfaces/repositories/IUserProfileRepository'; 

import { UserProfileModel } from './models/UserProfileModel';
import { Types } from 'mongoose';

export class MongoUserProfileRepository implements IUserProfileRepository {

    private mapBadgeDocumentToEntity(badge: any): UserBadge {
        return new UserBadge(
            badge?.badgeId?.toString() ?? '',
            badge?.badgeType,
            badge?.name,
            badge?.description,
            badge?.iconUrl,
            badge?.awardedAt,
            badge?.criteria
        );
    }

    private mapBadgesDocumentToEntity(badges: any[] | undefined): UserBadge[] {
        if (!Array.isArray(badges)) {
            return [];
        }

        return badges
            .filter(Boolean)
            .map(badge => this.mapBadgeDocumentToEntity(badge));
    }

    private mapBadgeEntityToDocument(badge: UserBadge | any): Record<string, any> {
        const badgeId = badge?.badgeId;
        const normalizedBadgeId = badgeId && Types.ObjectId.isValid(badgeId)
            ? new Types.ObjectId(badgeId)
            : badgeId;

        return {
            badgeId: normalizedBadgeId,
            badgeType: badge?.badgeType,
            name: badge?.name,
            description: badge?.description,
            iconUrl: badge?.iconUrl,
            awardedAt: badge?.awardedAt,
            criteria: badge?.criteria
        };
    }

    private mapBadgesEntityToDocument(badges: UserBadge[] | any[] | undefined): Record<string, any>[] {
        if (!Array.isArray(badges)) {
            return [];
        }

        return badges
            .filter(Boolean)
            .map(badge => this.mapBadgeEntityToDocument(badge));
    }

    private mapDocumentToEntity(profile: any): UserProfile {
        const streakDoc = profile.streak || {};
        const userId = profile.userId?.toString ? profile.userId.toString() : profile.userId;
        const profileId = profile._id?.toString ? profile._id.toString() : profile._id;

        const streak = new UserStreak(
            streakDoc.currentCount ?? 0,
            streakDoc.maxCount ?? 0,
            streakDoc.lastActiveDate ? new Date(streakDoc.lastActiveDate) : undefined,
            streakDoc.createdAt ? new Date(streakDoc.createdAt) : new Date(),
            streakDoc.updatedAt ? new Date(streakDoc.updatedAt) : new Date()
        );

        return new UserProfile({
            userId,
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
            streak,
            activeDays: profile.activeDays,
            isPremium: profile.isPremium,
            isBlocked: profile.isBlocked,
            badges: this.mapBadgesDocumentToEntity(profile.badges),
            leaderboard: profile.leaderboard,
            hints: profile.hints,
            activities: profile.activities,
            lastLogin: profile.lastLogin,
            id: profileId,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        });
    }


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
            leaderboard: profile.leaderboard,
            hints: profile.hints,
            activities: profile.activities,
            lastLogin: profile.lastLogin,
            badges: this.mapBadgesEntityToDocument(profile.badges),
        });

        const saved = await newProfile.save();

        return this.mapDocumentToEntity(saved);
    }

    async findByUserId(userId: string): Promise<UserProfile | null> {
        const profile = await UserProfileModel.findOne({ userId: new Types.ObjectId(userId) });
        if (!profile) return null;

        return this.mapDocumentToEntity(profile);
    }

    async update(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
        const updatesWithNormalizedBadges = updates.badges
            ? { ...updates, badges: this.mapBadgesEntityToDocument(updates.badges as any[]) }
            : updates;

        const updated = await UserProfileModel.findOneAndUpdate(
            { userId: new Types.ObjectId(userId) },
            updatesWithNormalizedBadges,
            { new: true, upsert: true }
        );

        if (!updated) throw new Error('Profile not found');

        return this.mapDocumentToEntity(updated);
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
        const normalizedBadge = this.mapBadgeEntityToDocument(badge);

        await UserProfileModel.updateOne(
            { userId: new Types.ObjectId(userId) },
            { $push: { badges: normalizedBadge } }
        );
    }

    async findBadgeHolders(params: BadgeHolderQueryParams): Promise<BadgeHolderQueryResult> {
        const { badgeId, page, limit } = params;
        const skip = (page - 1) * limit;

        if (!Types.ObjectId.isValid(badgeId)) {
            return {
                holders: [],
                total: 0,
                page,
                limit
            };
        }

        const badgeObjectId = new Types.ObjectId(badgeId);
        const matchStage = { 'badges.badgeId': badgeObjectId };

        const [documents, total] = await Promise.all([
            UserProfileModel.aggregate([
                { $match: matchStage },
                {
                    $project: {
                        userId: 1,
                        badgeEntry: {
                            $first: {
                                $filter: {
                                    input: '$badges',
                                    as: 'badge',
                                    cond: { $eq: ['$$badge.badgeId', badgeObjectId] }
                                }
                            }
                        }
                    }
                },
                {
                    $project: {
                        userId: 1,
                        badgeId: '$badgeEntry.badgeId',
                        awardedAt: '$badgeEntry.awardedAt'
                    }
                },
                { $sort: { awardedAt: -1, _id: 1 } },
                { $skip: skip },
                { $limit: limit }
            ]),
            UserProfileModel.countDocuments(matchStage)
        ]);

        const holders: BadgeHolderRecord[] = documents
            .filter(doc => doc.badgeId)
            .map(doc => ({
                userId: doc.userId.toString(),
                badgeId: doc.badgeId.toString(),
                awardedAt: doc.awardedAt
            }));

        return {
            holders,
            total,
            page,
            limit
        };
    }

    async getLeaderboard(limit: number = 100): Promise<UserProfile[]> {
        const profiles = await UserProfileModel.find({ isBlocked: false })
            .sort({ totalProblems: -1, acceptanceRate: -1 })
            .limit(limit)
            .populate('userId', 'userName fullName profilePicUrl');

        return profiles.map(profile => this.mapDocumentToEntity(profile));
    }

    async findByRanking(start: number, end: number): Promise<UserProfile[]> {
        const profiles = await UserProfileModel.find({
            ranking: { $gte: start, $lte: end },
            isBlocked: false,
        })
            .sort({ ranking: 1 })
            .populate('userId', 'userName fullName profilePicUrl');

        return profiles.map(profile => this.mapDocumentToEntity(profile));
    }
}
