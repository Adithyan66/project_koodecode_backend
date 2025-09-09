import { IUserRepository } from '../../interfaces/IUserRepository';
import { IUserProfileRepository } from '../../interfaces/IUserProfileRepository';
import { IUserConnectionRepository } from '../../interfaces/IUserConnectionRepository';
import { User } from '../../../domain/entities/User';
import { UserProfile } from '../../../domain/entities/UserProfile';
import { UserProfileResponseDto } from '../../dto/users/UserProfileDto';


export class GetUserProfileUseCase {
    constructor(
        private userRepository: IUserRepository,
        private profileRepository: IUserProfileRepository,
        private connectionRepository: IUserConnectionRepository
    ) {}

    async execute(userId: string, year: number = new Date().getFullYear()): Promise<UserProfileResponseDto> {

        const user = await this.userRepository.findById(userId);
        
        if (!user) {
            throw new Error('User not found');
        }

        let profile = await this.profileRepository.findByUserId(userId);

        if (!profile) {
            profile = new UserProfile(userId);
            await this.profileRepository.create(profile);
        }

        const [followersCount, followingCount] = await Promise.all([
            this.connectionRepository.getFollowersCount(userId),
            this.connectionRepository.getFollowingCount(userId)
        ]);

        const activities: Record<string, number> = {};
        const yearPrefix = year.toString();
        
        profile.activities
            .filter(activity => activity.date.startsWith(yearPrefix))
            .forEach(activity => {
                activities[activity.date] = activity.count;
            });

        // Get recent badges (last 5)
        const recentBadges = profile.badges
            .sort((a, b) => b.awardedAt.getTime() - a.awardedAt.getTime())
            .slice(0, 5)
            .map(badge => ({
                badgeId: badge.badgeId,
                name: badge.name,
                description: badge.description,
                iconUrl: badge.iconUrl,
                badgeType: badge.badgeType,
                rarity: 'common', 
                awardedAt: badge.awardedAt.toISOString()
            }));

        return {
            user: {
                id: user.id!,
                fullName: user.fullName,
                userName: user.userName,
                email: user.email,
                profilePicUrl: user.profilePicUrl
            },
            profile: {
                bio: profile.bio,
                location: profile.location,
                birthdate: profile.birthdate?.toISOString(),
                gender: profile.gender,
                githubUrl: profile.githubUrl,
                linkedinUrl: profile.linkedinUrl,
                isPremium: profile.isPremium,
                ranking: profile.ranking,
                coinBalance: profile.coinBalance
            },
            stats: {
                followersCount,
                followingCount,
                totalProblems: profile.totalProblems,
                problemsByDifficulty: {
                    easy: profile.easyProblems,
                    medium: profile.mediumProblems,
                    hard: profile.hardProblems
                },
                streak: {
                    current: profile.streak.currentCount,
                    max: profile.streak.maxCount,
                    lastActiveDate: profile.streak.lastActiveDate?.toISOString()
                },
                badges: profile.badges.length,
                acceptanceRate: profile.acceptanceRate,
                contestRating: profile.contestRating,
                activeDays: profile.activeDays
            },
            activities,
            recentBadges
        };
    }
}
