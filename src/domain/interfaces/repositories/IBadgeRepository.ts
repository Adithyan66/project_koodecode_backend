import { Badge, BadgeCategory } from '../../entities/Badge';
import { BadgeType } from '../../entities/UserProfile';


export interface IBadgeRepository {
    findAll(): Promise<Badge[]>;
    findByType(type: BadgeType): Promise<Badge[]>;
    findById(id: string): Promise<Badge | null>;
    create(badge: Badge): Promise<Badge>;
    update(id: string, updates: Partial<Badge>): Promise<Badge>;
    delete(id: string): Promise<boolean>;
    findActiveByCategory(category: BadgeCategory): Promise<Badge[]>;
}
