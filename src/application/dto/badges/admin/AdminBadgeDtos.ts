import { BadgeCategory, BadgeRarity } from '../../../../domain/entities/Badge';
import { BadgeCriteria, BadgeType } from '../../../../domain/entities/UserProfile';
import { BadgeSortField, SortOrder } from '../../../../domain/interfaces/repositories/IBadgeRepository';

export interface AdminBadgeListRequestDto {
    page?: number;
    limit?: number;
    search?: string;
    types?: BadgeType[];
    categories?: BadgeCategory[];
    rarities?: BadgeRarity[];
    includeInactive?: boolean;
    sortField?: BadgeSortField;
    sortOrder?: SortOrder;
}

export interface AdminBadgeListItemDto {
    id: string;
    name: string;
    description: string;
    type: BadgeType;
    category: BadgeCategory;
    rarity: BadgeRarity;
    iconUrl: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface AdminBadgeListResponseDto {
    items: AdminBadgeListItemDto[];
    total: number;
    page: number;
    limit: number;
}

export interface AdminBadgeDetailDto {
    id: string;
    name: string;
    description: string;
    type: BadgeType;
    category: BadgeCategory;
    rarity: BadgeRarity;
    iconUrl: string;
    criteria: BadgeCriteria;
    isActive: boolean;
    holderCount: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface AdminBadgeUpdateDto {
    name?: string;
    description?: string;
    type?: BadgeType;
    category?: BadgeCategory;
    rarity?: BadgeRarity;
    iconUrl?: string;
    isActive?: boolean;
    criteria?: BadgeCriteria;
}

export interface AdminBadgeToggleStatusDto {
    isActive: boolean;
}

export interface AdminBadgeHolderDto {
    userId: string;
    fullName: string;
    email: string;
    userName: string;
    awardedAt: Date;
}

export interface AdminBadgeHolderListResponseDto {
    badgeId: string;
    items: AdminBadgeHolderDto[];
    total: number;
    page: number;
    limit: number;
}
