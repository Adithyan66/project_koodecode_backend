import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '../../../../domain/interfaces/repositories/IUserRepository';
import { GetUserProfileResponseDto, UserBadgeDto, UserStreakDto } from '../../../dto/users/admin/GetUserProfileResponseDto';
import { IGetUserProfileUseCase } from '../../../interfaces/IUserUseCase';
import { NotFoundError } from '../../../errors/AppErrors';

@injectable()
export class GetUserProfileUseCase implements IGetUserProfileUseCase {
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository
  ) {}

  async execute(userId: string): Promise<GetUserProfileResponseDto> {
    const userData = await this.userRepository.findUserWithProfileAndBadges(userId);
    
    if (!userData) {
      throw new NotFoundError('User not found');
    }

    const { user, profile, badges } = userData;

    // Map badges
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
      
      // Extended Profile Info
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
      isBlocked: profile.isBlocked || false,
      lastLogin: profile.lastLogin?.toISOString(),
      
      // Streak Data
      streak: streakDto,
      
      // Badges
      badges: badgeDtos
    };
  }
}
