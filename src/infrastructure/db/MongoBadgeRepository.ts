

import { Badge, BadgeCategory } from '../../domain/entities/Badge';
import { BadgeCriteria, BadgeType } from '../../domain/entities/UserProfile';
import { IBadgeRepository } from '../../domain/interfaces/repositories/IBadgeRepository';
import { BadgeModel } from './models/BadgeModel';

export class MongoBadgeRepository implements IBadgeRepository {
    async findAll(): Promise<Badge[]> {
        const badges = await BadgeModel.find({ isActive: true });
        return badges.map(badge => this.mapDocumentToEntity(badge));
    }

    async findByType(type: BadgeType): Promise<Badge[]> {
        const badges = await BadgeModel.find({ type, isActive: true });
        return badges.map(badge => this.mapDocumentToEntity(badge));
    }

    async findById(id: string): Promise<Badge | null> {
        const badge = await BadgeModel.findById(id);
        if (!badge) return null;
        
        return this.mapDocumentToEntity(badge);
    }

    async create(badge: Badge): Promise<Badge> {
        const newBadge = new BadgeModel({
            name: badge.name,
            description: badge.description,
            type: badge.type,
            iconUrl: badge.iconUrl,
            category: badge.category,
            rarity: badge.rarity,
            criteria: badge.criteria,
            isActive: badge.isActive
        });

        const saved = await newBadge.save();
        badge.id = saved.id.toString();
        badge.createdAt = saved.createdAt;
        badge.updatedAt = saved.updatedAt;
        
        return badge;
    }

    async update(id: string, updates: Partial<Badge>): Promise<Badge> {
        const updated = await BadgeModel.findByIdAndUpdate(id, updates, { new: true });
        if (!updated) throw new Error('Badge not found');
        
        return this.mapDocumentToEntity(updated);
    }

    async delete(id: string): Promise<boolean> {
        const result = await BadgeModel.findByIdAndUpdate(id, { isActive: false });
        return !!result;
    }

    async findActiveByCategory(category: BadgeCategory): Promise<Badge[]> {
        const badges = await BadgeModel.find({ category, isActive: true });
        return badges.map(badge => this.mapDocumentToEntity(badge));
    }

    private mapDocumentToEntity(badge: any): Badge {
        const criteria = badge.criteria
            ? new BadgeCriteria(
                badge.criteria.type,
                badge.criteria.threshold,
                badge.criteria.description,
                badge.criteria.metadata
            )
            : new BadgeCriteria('', 0, '');

        return new Badge(
            badge.name,
            badge.description,
            badge.type as BadgeType,
            badge.iconUrl,
            criteria,
            badge.category as BadgeCategory,
            badge.rarity as any,
            badge.isActive,
            badge.id?.toString(),
            badge.createdAt,
            badge.updatedAt
        );
    }
}
