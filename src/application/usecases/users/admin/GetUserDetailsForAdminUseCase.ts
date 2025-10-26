import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '../../../../domain/interfaces/repositories/IUserRepository';
import { GetUserProfileResponseDto, UserBadgeDto, UserStreakDto } from '../../../dto/users/admin/GetUserProfileResponseDto';
import { IGetUserDetailForAdminUseCase } from '../../../interfaces/IUserUseCase';
import { NotFoundError } from '../../../errors/AppErrors';


@injectable()
export class GetUserDetailsForAdminUseCase implements IGetUserDetailForAdminUseCase {

  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository
  ) { }

  async execute(userId: string): Promise<GetUserProfileResponseDto> {

    const userData = await this.userRepository.findUserWithProfileAndBadges(userId);

    if (!userData) {
      throw new NotFoundError('User not found');
    }

    const { user, profile, badges } = userData;

    const badgeDtos: UserBadgeDto[] = badges.map((badge: any) => ({
      badgeId: badge.badgeId?.toString() || '',
      badgeType: badge.badgeType || '',
      name: badge.name || '',
      description: badge.description || '',
      iconUrl: badge.iconUrl || '',
      awardedAt: badge.awardedAt?.toISOString() || new Date().toISOString(),
      criteria: badge.criteria ? {
        type: badge.criteria.type || '',
        threshold: badge.criteria.threshold || 0,
        description: badge.criteria.description || '',
        metadata: badge.criteria.metadata || {}
      } : undefined
    }));

    // Map streak
    const streakDto: UserStreakDto = {
      currentCount: profile.streak?.currentCount || 0,
      maxCount: profile.streak?.maxCount || 0,
      lastActiveDate: profile.streak?.lastActiveDate?.toISOString()
    };

    return {
      // Basic User Info
      user: {
        id: user.id!,
        fullName: user.fullName,
        userName: user.userName,
        email: user.email,
        googleId: user.googleId,
        githubId: user.githubId,
        emailVerified: user.emailVerified,
        profilePicKey: user.profilePicKey,
        createdAt: user.createdAt!.toISOString(),
        updatedAt: user.updatedAt!.toISOString(),
      },
      // Extended Profile Info
      UserProfile: {
        bio: profile.bio,
        location: profile.location,
        birthdate: profile.birthdate?.toISOString(),
        gender: profile.gender,
        githubUrl: profile.githubUrl,
        linkedinUrl: profile.linkedinUrl,
        coinBalance: profile.coinBalance || 0,
      },
      // Performance Metrics
      ranking: profile.ranking,
      acceptanceRate: profile.acceptanceRate || 0,
      contestRating: profile.contestRating || 0,
      totalProblems: profile.totalProblems || 0,
      easyProblems: profile.easyProblems || 0,
      mediumProblems: profile.mediumProblems || 0,
      hardProblems: profile.hardProblems || 0,
      activeDays: profile.activeDays || 0,

      stats: {
        followersCount: 0,
        followingCount: 0,
        totalProblems: profile.totalProblems || 0,
        problemsByDifficulty: {
          easy: profile.easyProblems || 0,
          medium: profile.mediumProblems || 0,
          hard: profile.hardProblems || 0,
        },
        streak: streakDto,
        badges: 0,
        acceptanceRate: profile.acceptanceRate || 0,
        contestRating: profile.contestRating || 0,
        activeDays: 10
      },


      // Status
      isBlocked: user.isBlocked || false,
      lastLogin: profile.lastLogin?.toISOString(),

      // Streak Data
      // streak: streakDto,

      // Badges
      // badges: badgeDtos
    };
  }
}
