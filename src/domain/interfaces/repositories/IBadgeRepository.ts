import { Badge, BadgeCategory, BadgeRarity } from '../../entities/Badge';
import { BadgeType } from '../../entities/UserProfile';


export interface IBadgeRepository {
    findAll(): Promise<Badge[]>;
    findByType(type: BadgeType): Promise<Badge[]>;
    findById(id: string): Promise<Badge | null>;
    create(badge: Badge): Promise<Badge>;
    update(id: string, updates: Partial<Badge>): Promise<Badge>;
    delete(id: string): Promise<boolean>;
    findActiveByCategory(category: BadgeCategory): Promise<Badge[]>;
    findPaginated(options: BadgeQueryOptions): Promise<BadgeQueryResult>;
    setActiveStatus(id: string, isActive: boolean): Promise<Badge>;
}

export type BadgeSortField = 'createdAt' | 'name';
export type SortOrder = 'asc' | 'desc';

export interface BadgeFilterOptions {
    search?: string;
    types?: BadgeType[];
    categories?: BadgeCategory[];
    rarities?: BadgeRarity[];
    isActive?: boolean;
}

export interface BadgeQueryOptions {
    filters?: BadgeFilterOptions;
    page?: number;
    limit?: number;
    sortField?: BadgeSortField;
    sortOrder?: SortOrder;
}

export interface BadgeQueryResult {
    items: Badge[];
    total: number;
    page: number;
    limit: number;
}
