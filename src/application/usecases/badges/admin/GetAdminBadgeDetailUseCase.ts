import { inject, injectable } from 'tsyringe';
import { IBadgeRepository } from '../../../../domain/interfaces/repositories/IBadgeRepository';
import { IUserProfileRepository } from '../../../../domain/interfaces/repositories/IUserProfileRepository';
import { AppError } from '../../../errors/AppError';
import { AdminBadgeDetailDto } from '../../../dto/badges/admin/AdminBadgeDtos';
import { IAdminGetBadgeDetailUseCase } from '../../../interfaces/IBadgeUseCase';

@injectable()
export class GetAdminBadgeDetailUseCase implements IAdminGetBadgeDetailUseCase {
    constructor(
        @inject('IBadgeRepository') private readonly badgeRepository: IBadgeRepository,
        @inject('IUserProfileRepository') private readonly userProfileRepository: IUserProfileRepository
    ) {}

    async execute(badgeId: string): Promise<AdminBadgeDetailDto> {
        const badge = await this.badgeRepository.findById(badgeId);

        if (!badge) {
            throw new AppError('Badge not found', 404);
        }

        const holderStats = await this.userProfileRepository.findBadgeHolders({
            badgeId,
            page: 1,
            limit: 1
        });

        return {
            id: badge.id!,
            name: badge.name,
            description: badge.description,
            type: badge.type,
            category: badge.category,
            rarity: badge.rarity,
            iconUrl: badge.iconUrl,
            criteria: badge.criteria,
            isActive: badge.isActive,
            holderCount: holderStats.total,
            createdAt: badge.createdAt,
            updatedAt: badge.updatedAt
        };
    }
}
