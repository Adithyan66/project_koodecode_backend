import { inject, injectable } from 'tsyringe';
import { IBadgeRepository } from '../../../../domain/interfaces/repositories/IBadgeRepository';
import { IUserProfileRepository } from '../../../../domain/interfaces/repositories/IUserProfileRepository';
import { AppError } from '../../../errors/AppError';
import { AdminBadgeDetailDto } from '../../../dto/badges/admin/AdminBadgeDtos';
import { IAdminToggleBadgeStatusUseCase } from '../../../interfaces/IBadgeUseCase';

@injectable()
export class ToggleAdminBadgeStatusUseCase implements IAdminToggleBadgeStatusUseCase {
    constructor(
        @inject('IBadgeRepository') private readonly badgeRepository: IBadgeRepository,
        @inject('IUserProfileRepository') private readonly userProfileRepository: IUserProfileRepository
    ) {}

    async execute(badgeId: string, isActive: boolean): Promise<AdminBadgeDetailDto> {
        const existing = await this.badgeRepository.findById(badgeId);

        if (!existing) {
            throw new AppError('Badge not found', 404);
        }

        const updatedBadge = await this.badgeRepository.setActiveStatus(badgeId, isActive);

        const holderStats = await this.userProfileRepository.findBadgeHolders({
            badgeId,
            page: 1,
            limit: 1
        });

        return {
            id: updatedBadge.id!,
            name: updatedBadge.name,
            description: updatedBadge.description,
            type: updatedBadge.type,
            category: updatedBadge.category,
            rarity: updatedBadge.rarity,
            iconUrl: updatedBadge.iconUrl,
            criteria: updatedBadge.criteria,
            isActive: updatedBadge.isActive,
            holderCount: holderStats.total,
            createdAt: updatedBadge.createdAt,
            updatedAt: updatedBadge.updatedAt
        };
    }
}
