import { IUserRepository } from '../../../../domain/interfaces/repositories/IUserRepository';
import { IUserProfileRepository } from '../../../../domain/interfaces/repositories/IUserProfileRepository';
import { IUserConnectionRepository } from '../../../../domain/interfaces/repositories/IUserConnectionRepository';
import { ISubmissionRepository } from '../../../../domain/interfaces/repositories/ISubmissionRepository';
import { IProblemRepository } from '../../../../domain/interfaces/repositories/IProblemRepository';
import { IBadgeRepository } from '../../../../domain/interfaces/repositories/IBadgeRepository';
import { UserProfile } from '../../../../domain/entities/UserProfile';
import { UserProfileResponseDto } from '../../../dto/users/UserProfileDto';
import { IGetUserProfileForUserUseCase } from '../../../interfaces/IProfileUseCase';
import { ProgrammingLanguage } from '../../../../domain/value-objects/ProgrammingLanguage';
import { inject, injectable } from 'tsyringe';


@injectable()
export class GetUserProfileUseCase implements IGetUserProfileForUserUseCase {
    
    constructor(
        @inject('IUserRepository') private userRepository: IUserRepository,
        @inject('IUserProfileRepository') private profileRepository: IUserProfileRepository,
        @inject('IUserConnectionRepository') private connectionRepository: IUserConnectionRepository,
        @inject('ISubmissionRepository') private submissionRepository: ISubmissionRepository,
        @inject('IProblemRepository') private problemRepository: IProblemRepository,
        @inject('IBadgeRepository') private badgeRepository: IBadgeRepository
    ) { }

    async execute(userId: string, year: number = new Date().getFullYear()): Promise<UserProfileResponseDto> {

        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        let profile = await this.profileRepository.findByUserId(userId);

        if (!profile) {
            profile = new UserProfile({ userId });
            await this.profileRepository.create(profile);
        }

        const sortedBadges = profile.badges.sort((a, b) => b.awardedAt.getTime() - a.awardedAt.getTime());

        const [problemStats, recentSubmissions, badgeInfoList] = await Promise.all([
            this.problemRepository.getOverallStats(),
            this.submissionRepository.findByUserIdPaginated(userId, 1, 7, 'problem'),
            Promise.all(sortedBadges.map(badge => this.badgeRepository.findById(badge.badgeId)))
        ]);

        const profileImageKey = user.profilePicKey || null;

        const languages = Object.entries(profile.languagesUsed).map(([id, count]) => {
            const langInfo = ProgrammingLanguage.getLanguageInfo(parseInt(id));
            return { 
                name: langInfo?.name || `Language ${id}`, 
                count 
            };
        }).sort((a, b) => b.count - a.count);

        const heatmapData = profile.activities
            .filter(activity => activity.date.startsWith(year.toString()))
            .map(activity => ({
                date: activity.date,
                count: activity.count
            }));

        type ActiveBadgeEntry = {
            badge: typeof sortedBadges[number];
            info: NonNullable<typeof badgeInfoList[number]>;
        };
        const activeBadgeEntries: ActiveBadgeEntry[] = [];
        sortedBadges.forEach((userBadge, idx) => {
            const badgeInfo = badgeInfoList[idx];
            if (badgeInfo && badgeInfo.isActive) {
                activeBadgeEntries.push({ badge: userBadge, info: badgeInfo });
            }
        });

        const badgesList = activeBadgeEntries.map(({ badge, info }) => ({
            id: badge.badgeId,
            name: badge.name,
            imageUrl: info.iconUrl || badge.iconUrl
        }));

        const recentActiveEntry = activeBadgeEntries[0];
        const recentBadge = recentActiveEntry ? {
            imageUrl: recentActiveEntry.info.iconUrl || recentActiveEntry.badge.iconUrl,
            title: recentActiveEntry.badge.name,
            year: new Date(recentActiveEntry.badge.awardedAt).getFullYear()
        } : undefined;

        const recentSubmissionsWithInfo = recentSubmissions.map((submission: any) => ({
            id: submission.id,
            title: typeof submission.problemId === 'object' && submission.problemId.title 
                ? submission.problemId.title 
                : 'Unknown Problem',
            timeAgo: this.formatTimeAgo(submission.createdAt)
        }));

        const attempting = profile.problemsAttempted.length - profile.problemsSolved.length;

        return {
            user: {
                profileImage: profileImageKey,
                name: user.fullName,
                username: user.userName,
                bio: profile.bio,
                location: profile.location,
                githubUrl: profile.githubUrl,
                linkedinUrl: profile.linkedinUrl,
                languages
            },
            stats: {
                easy: { solved: profile.easyProblems, total: problemStats.easyCount },
                medium: { solved: profile.mediumProblems, total: problemStats.mediumCount },
                hard: { solved: profile.hardProblems, total: problemStats.hardCount },
                attempting
            },
            badges: {
                total: badgesList.length,
                list: badgesList,
                recent: recentBadge
            },
            heatmap: {
                data: heatmapData,
                totalSubmissions: profile.totalSubmissions,
                activeDays: profile.activeDays,
                maxStreak: profile.streak.maxCount,
                currentStreak: profile.streak.currentCount
            },
            recentSubmissions: recentSubmissionsWithInfo
        };
    }

    private formatTimeAgo(date: Date): string {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        const diffWeeks = Math.floor(diffDays / 7);
        const diffMonths = Math.floor(diffDays / 30);
        const diffYears = Math.floor(diffDays / 365);

        if (diffSecs < 60) {
            return 'just now';
        } else if (diffMins < 60) {
            return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
        } else if (diffDays < 7) {
            return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
        } else if (diffWeeks < 4) {
            return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
        } else if (diffMonths < 12) {
            return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
        } else {
            return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
        }
    }
}
