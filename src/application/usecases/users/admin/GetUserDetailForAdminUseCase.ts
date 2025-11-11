import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '../../../../domain/interfaces/repositories/IUserRepository';
import { UserDetailDto, Badge } from '../../../dto/users/admin/UserDetailDto';
import { NotFoundError } from '../../../errors/AppErrors';

@injectable()
export class GetUserDetailForAdminUseCase {

    constructor(
        @inject('IUserRepository') private userRepository: IUserRepository
    ) { }

    async execute(userId: string): Promise<UserDetailDto> {
        
        const userData = await this.userRepository.findUserWithProfileAndBadges(userId);

        if (!userData) {
            throw new NotFoundError('User not found');
        }

        const { user, profile, badges } = userData;

        // Transform badges to match frontend expectation
        const transformedBadges = badges?.map(badge => ({
            badgeId: badge.badgeId?.toString() || '',
            badgeType: badge.badgeType || '',
            name: badge.name || '',
            description: badge.description || '',
            iconUrl: badge.iconUrl || '',
            awardedAt: badge.awardedAt?.toISOString() || new Date().toISOString(),
            criteria: {
                type: badge.criteria?.type || '',
                threshold: badge.criteria?.threshold || 0,
                description: badge.criteria?.description || '',
                metadata: badge.criteria?.metadata || {}
            }
        })) || [];

        return {
            // User entity fields (matching frontend User interface)
            id: user.id!,
            fullName: user.fullName,
            userName: user.userName,
            email: user.email,
            createdAt: user.createdAt!.toISOString(),
            updatedAt: user.updatedAt!.toISOString(),
            provider: user.provider,
            emailVerified: user.emailVerified,
            profilePicKey: user.profilePicKey,

            // Extended Profile Info (matching frontend UserDetail interface)
            googleId: user.googleId,
            githubId: user.githubId,
            bio: profile.bio,
            location: profile.location,
            birthdate: profile.birthdate?.toISOString(),
            gender: profile.gender,
            githubUrl: profile.githubUrl,
            linkedinUrl: profile.linkedinUrl,

            // Performance Metrics
            ranking: profile.ranking,
            acceptanceRate: profile.acceptanceRate || 0,
            contestRating: profile.contestRating || 0,
            coinBalance: profile.coinBalance || 0,
            totalProblems: profile.totalProblems || 0,
            easyProblems: profile.easyProblems || 0,
            mediumProblems: profile.mediumProblems || 0,
            hardProblems: profile.hardProblems || 0,
            activeDays: profile.activeDays || 0,

        // Status
        isBlocked: user.isBlocked,
            lastLogin: profile.lastLogin?.toISOString(),

            // Streak Data
            streak: {
                currentCount: profile.streak?.currentCount || 0,
                maxCount: profile.streak?.maxCount || 0,
                lastActiveDate: profile.streak?.lastActiveDate?.toISOString() || new Date().toISOString()
            },

            // Badges (transformed to match frontend Badge interface)
            badges: transformedBadges
        };
    }
}
