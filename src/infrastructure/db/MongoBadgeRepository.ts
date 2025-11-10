

import { Badge, BadgeCategory } from '../../domain/entities/Badge';
import { BadgeCriteria, BadgeType } from '../../domain/entities/UserProfile';
import { BadgeFilterOptions, BadgeQueryOptions, BadgeQueryResult, IBadgeRepository } from '../../domain/interfaces/repositories/IBadgeRepository';
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

    async findPaginated(options: BadgeQueryOptions): Promise<BadgeQueryResult> {
        const {
            filters,
            page = 1,
            limit = 20,
            sortField = 'createdAt',
            sortOrder = 'desc'
        } = options;

        const query = this.buildFilter(filters);

        const sort: Record<string, 1 | -1> = {};
        sort[sortField] = sortOrder === 'asc' ? 1 : -1;

        const [items, total] = await Promise.all([
            BadgeModel.find(query)
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit),
            BadgeModel.countDocuments(query)
        ]);

        return {
            items: items.map(doc => this.mapDocumentToEntity(doc)),
            total,
            page,
            limit
        };
    }

    async setActiveStatus(id: string, isActive: boolean): Promise<Badge> {
        const updated = await BadgeModel.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        if (!updated) {
            throw new Error('Badge not found');
        }

        return this.mapDocumentToEntity(updated);
    }

    private buildFilter(filters?: BadgeFilterOptions) {
        const query: Record<string, any> = {};

        if (!filters) {
            return query;
        }

        if (filters.search) {
            const regex = new RegExp(filters.search, 'i');
            query.$or = [
                { name: regex },
                { description: regex }
            ];
        }

        if (filters.types && filters.types.length > 0) {
            query.type = { $in: filters.types };
        }

        if (filters.categories && filters.categories.length > 0) {
            query.category = { $in: filters.categories };
        }

        if (filters.rarities && filters.rarities.length > 0) {
            query.rarity = { $in: filters.rarities };
        }

        if (typeof filters.isActive === 'boolean') {
            query.isActive = filters.isActive;
        }

        return query;
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
            (badge.id ?? badge._id)?.toString(),
            badge.createdAt,
            badge.updatedAt
        );
    }
}
