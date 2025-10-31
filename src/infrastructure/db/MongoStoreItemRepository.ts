import { IStoreItemRepository } from '../../domain/interfaces/repositories/IStoreItemRepository';
import { StoreItem, StoreItemType } from '../../domain/entities/StoreItem';
import { StoreItemModel } from './models/StoreItemModel';

export class MongoStoreItemRepository implements IStoreItemRepository {
    async findAll(): Promise<StoreItem[]> {
        const items = await StoreItemModel.find().sort({ createdAt: -1 });
        return items.map(this.mapToEntity);
    }

    async findById(id: string): Promise<StoreItem | null> {
        const item = await StoreItemModel.findById(id);
        return item ? this.mapToEntity(item) : null;
    }

    async findByType(type: StoreItemType): Promise<StoreItem[]> {
        const items = await StoreItemModel.find({ type }).sort({ createdAt: -1 });
        return items.map(this.mapToEntity);
    }

    async findActiveItems(): Promise<StoreItem[]> {
        const items = await StoreItemModel.find({ isActive: true }).sort({ createdAt: -1 });
        return items.map(this.mapToEntity);
    }

    async findAllWithPagination(page: number, limit: number): Promise<{ items: StoreItem[]; total: number }> {
        const skip = (page - 1) * limit;
        
        const [items, total] = await Promise.all([
            StoreItemModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            StoreItemModel.countDocuments()
        ]);

        return {
            items: items.map(this.mapToEntity),
            total
        };
    }

    async create(storeItem: StoreItem): Promise<StoreItem> {
        const item = new StoreItemModel(storeItem);
        const savedItem = await item.save();
        return this.mapToEntity(savedItem);
    }

    async update(id: string, storeItem: Partial<StoreItem>): Promise<StoreItem | null> {
        const updatedItem = await StoreItemModel.findByIdAndUpdate(
            id,
            { ...storeItem, updatedAt: new Date() },
            { new: true }
        );
        return updatedItem ? this.mapToEntity(updatedItem) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await StoreItemModel.findByIdAndDelete(id);
        return !!result;
    }

    private mapToEntity(doc: any): StoreItem {
        return new StoreItem({
            id: doc._id.toString(),
            name: doc.name,
            type: doc.type,
            price: doc.price,
            description: doc.description,
            imageUrl: doc.imageUrl,
            isActive: doc.isActive,
            componentId: doc.componentId,
            metadata: doc.metadata,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }
}
