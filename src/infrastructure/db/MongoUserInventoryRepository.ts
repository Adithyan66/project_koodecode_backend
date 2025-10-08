

import { IUserInventoryRepository } from '../../domain/interfaces/repositories/IUserInventoryRepository';
import { UserInventory } from '../../domain/entities/UserInventory';
import { UserInventoryModel } from './models/UserInventoryModel';

export class MongoUserInventoryRepository implements IUserInventoryRepository {
    async findByUserId(userId: string): Promise<UserInventory[]> {
        const items = await UserInventoryModel.find({ userId }).sort({ purchasedAt: -1 });
        return items.map(this.mapToEntity);
    }

    async findByUserIdAndItemId(userId: string, itemId: string): Promise<UserInventory | null> {
        const item = await UserInventoryModel.findOne({ userId, itemId });
        return item ? this.mapToEntity(item) : null;
    }

    async create(userInventory: UserInventory): Promise<UserInventory> {
        const item = new UserInventoryModel(userInventory);
        const savedItem = await item.save();
        return this.mapToEntity(savedItem);
    }

    async update(id: string, userInventory: Partial<UserInventory>): Promise<UserInventory | null> {
        const updatedItem = await UserInventoryModel.findByIdAndUpdate(id, userInventory, { new: true });
        return updatedItem ? this.mapToEntity(updatedItem) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await UserInventoryModel.findByIdAndDelete(id);
        return !!result;
    }

    async updateQuantity(userId: string, itemId: string, quantity: number): Promise<boolean> {
        const result = await UserInventoryModel.updateOne(
            { userId, itemId },
            { quantity, lastUsedAt: new Date() }
        );
        return result.modifiedCount > 0;
    }

    private mapToEntity(doc: any): UserInventory {
        return new UserInventory({
            id: doc._id.toString(),
            userId: doc.userId,
            itemId: doc.itemId,
            quantity: doc.quantity,
            purchasedAt: doc.purchasedAt,
            lastUsedAt: doc.lastUsedAt
        });
    }
}
