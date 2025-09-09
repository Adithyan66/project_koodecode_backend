import { Badge, BadgeCategory } from '../../domain/entities/Badge';
import { BadgeType } from '../../domain/entities/UserProfile';


export interface IBadgeRepository {
    findAll(): Promise<Badge[]>;
    findByType(type: BadgeType): Promise<Badge[]>;
    findById(id: string): Promise<Badge | null>;
    create(badge: Badge): Promise<Badge>;
    update(id: string, updates: Partial<Badge>): Promise<Badge>;
    delete(id: string): Promise<boolean>;
    findActiveByCategory(category: BadgeCategory): Promise<Badge[]>;
    seedBadges(): Promise<void>;
}
