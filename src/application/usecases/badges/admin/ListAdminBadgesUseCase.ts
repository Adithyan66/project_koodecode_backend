import { inject, injectable } from 'tsyringe';
import { IBadgeRepository } from '../../../../domain/interfaces/repositories/IBadgeRepository';
import { AdminBadgeListRequestDto, AdminBadgeListResponseDto, AdminBadgeListItemDto } from '../../../dto/badges/admin/AdminBadgeDtos';
import { IAdminListBadgesUseCase } from '../../../interfaces/IBadgeUseCase';

@injectable()
export class ListAdminBadgesUseCase implements IAdminListBadgesUseCase {
    constructor(
        @inject('IBadgeRepository') private readonly badgeRepository: IBadgeRepository,
    ) {}

    async execute(request: AdminBadgeListRequestDto): Promise<AdminBadgeListResponseDto> {
        const {
            page = 1,
            limit = 20,
            search,
            categories,
            rarities,
            types,
            includeInactive,
            sortField = 'createdAt',
            sortOrder = 'desc'
        } = request;

        const filters = {
            search,
            categories,
            rarities,
            types,
            isActive: includeInactive ? undefined : true
        };

        const result = await this.badgeRepository.findPaginated({
            filters,
            page,
            limit,
            sortField,
            sortOrder
        });

        const items: AdminBadgeListItemDto[] = result.items.map(badge => ({
            id: badge.id!,
            name: badge.name,
            description: badge.description,
            type: badge.type,
            category: badge.category,
            rarity: badge.rarity,
            iconUrl: badge.iconUrl,
            isActive: badge.isActive,
            createdAt: badge.createdAt,
            updatedAt: badge.updatedAt
        }));

        return {
            items,
            total: result.total,
            page: result.page,
            limit: result.limit
        };
    }
}
