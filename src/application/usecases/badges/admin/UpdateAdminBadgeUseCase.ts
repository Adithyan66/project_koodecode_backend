import { inject, injectable } from 'tsyringe';
import { Badge } from '../../../../domain/entities/Badge';
import { IBadgeRepository } from '../../../../domain/interfaces/repositories/IBadgeRepository';
import { IUserProfileRepository } from '../../../../domain/interfaces/repositories/IUserProfileRepository';
import { BadgeCriteria } from '../../../../domain/entities/UserProfile';
import { AdminBadgeDetailDto, AdminBadgeUpdateDto } from '../../../dto/badges/admin/AdminBadgeDtos';
import { AppError } from '../../../errors/AppError';
import { IAdminUpdateBadgeUseCase } from '../../../interfaces/IBadgeUseCase';

@injectable()
export class UpdateAdminBadgeUseCase implements IAdminUpdateBadgeUseCase {
    constructor(
        @inject('IBadgeRepository') private readonly badgeRepository: IBadgeRepository,
        @inject('IUserProfileRepository') private readonly userProfileRepository: IUserProfileRepository
    ) {}

    async execute(badgeId: string, payload: AdminBadgeUpdateDto): Promise<AdminBadgeDetailDto> {
        const existingBadge = await this.badgeRepository.findById(badgeId);

        if (!existingBadge) {
            throw new AppError('Badge not found', 404);
        }

        const updates: Partial<Badge> = {};

        if (payload.name !== undefined) updates.name = payload.name;
        if (payload.description !== undefined) updates.description = payload.description;
        if (payload.type !== undefined) updates.type = payload.type;
        if (payload.category !== undefined) updates.category = payload.category;
        if (payload.rarity !== undefined) updates.rarity = payload.rarity;
        if (payload.iconUrl !== undefined) updates.iconUrl = payload.iconUrl;
        if (payload.isActive !== undefined) updates.isActive = payload.isActive;
        if (payload.criteria) {
            updates.criteria = new BadgeCriteria(
                payload.criteria.type,
                payload.criteria.threshold,
                payload.criteria.description,
                payload.criteria.metadata
            );
        }

        const updatedBadge = await this.badgeRepository.update(badgeId, updates);

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
