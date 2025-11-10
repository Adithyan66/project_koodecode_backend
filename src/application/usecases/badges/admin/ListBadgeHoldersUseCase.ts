import { inject, injectable } from 'tsyringe';
import { IUserProfileRepository } from '../../../../domain/interfaces/repositories/IUserProfileRepository';
import { IUserRepository } from '../../../../domain/interfaces/repositories/IUserRepository';
import { AdminBadgeHolderListResponseDto, AdminBadgeHolderDto } from '../../../dto/badges/admin/AdminBadgeDtos';
import { IAdminListBadgeHoldersUseCase } from '../../../interfaces/IBadgeUseCase';

@injectable()
export class ListBadgeHoldersUseCase implements IAdminListBadgeHoldersUseCase {
    constructor(
        @inject('IUserProfileRepository') private readonly userProfileRepository: IUserProfileRepository,
        @inject('IUserRepository') private readonly userRepository: IUserRepository
    ) {}

    async execute(badgeId: string, page: number = 1, limit: number = 20): Promise<AdminBadgeHolderListResponseDto> {
        const holderResult = await this.userProfileRepository.findBadgeHolders({
            badgeId,
            page,
            limit
        });

        if (holderResult.total === 0) {
            return {
                badgeId,
                items: [],
                total: 0,
                page,
                limit
            };
        }

        const userIds = holderResult.holders.map(holder => holder.userId);
        const users = await this.userRepository.findByIds(userIds);
        const userMap = new Map(users.map(user => [user.id, user]));

        const items: AdminBadgeHolderDto[] = holderResult.holders.map(holder => {
            const user = userMap.get(holder.userId);
            return {
                userId: holder.userId,
                fullName: user?.fullName ?? '',
                email: user?.email ?? '',
                userName: user?.userName ?? '',
                awardedAt: holder.awardedAt
            };
        });

        return {
            badgeId,
            items,
            total: holderResult.total,
            page: holderResult.page,
            limit: holderResult.limit
        };
    }
}
