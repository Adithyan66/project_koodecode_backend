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

        const profileImageKey = user.profilePicKey || 'default_profile_BnM0aD0IW.jpg';

        const languages = Object.entries(profile.languagesUsed).map(([id, count]) => {
            const langInfo = ProgrammingLanguage.getLanguageInfo(parseInt(id));
            return { 
                name: langInfo?.name || `Language ${id}`, 
                count 
            };
        }).sort((a, b) => b.count - a.count);
        console.log("jiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii",languages);            

        const heatmapData = profile.activities
            .filter(activity => activity.date.startsWith(year.toString()))
            .map(activity => ({
                date: activity.date,
                count: activity.count
            }));

        const badgesList = sortedBadges.map((userBadge, idx) => {
            const badgeInfo = badgeInfoList[idx];
            return {
                id: userBadge.badgeId,
                imageUrl: badgeInfo?.iconUrl || userBadge.iconUrl
            };
        });

        const recentBadge = sortedBadges[0] ? {
            imageUrl: badgeInfoList[0]?.iconUrl || sortedBadges[0].iconUrl,
            title: sortedBadges[0].name,
            year: new Date(sortedBadges[0].awardedAt).getFullYear()
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
                total: profile.badges.length,
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
