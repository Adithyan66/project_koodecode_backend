import { AdminBadgeDetailDto, AdminBadgeHolderListResponseDto, AdminBadgeListRequestDto, AdminBadgeListResponseDto, AdminBadgeUpdateDto } from '../dto/badges/admin/AdminBadgeDtos';

export interface IAdminListBadgesUseCase {
    execute(request: AdminBadgeListRequestDto): Promise<AdminBadgeListResponseDto>;
}

export interface IAdminGetBadgeDetailUseCase {
    execute(badgeId: string): Promise<AdminBadgeDetailDto>;
}

export interface IAdminUpdateBadgeUseCase {
    execute(badgeId: string, payload: AdminBadgeUpdateDto): Promise<AdminBadgeDetailDto>;
}

export interface IAdminToggleBadgeStatusUseCase {
    execute(badgeId: string, isActive: boolean): Promise<AdminBadgeDetailDto>;
}

export interface IAdminListBadgeHoldersUseCase {
    execute(badgeId: string, page: number, limit: number): Promise<AdminBadgeHolderListResponseDto>;
}
