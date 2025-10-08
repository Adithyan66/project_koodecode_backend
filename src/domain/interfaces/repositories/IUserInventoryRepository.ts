import { UserInventory } from '../../entities/UserInventory';

export interface IUserInventoryRepository {
    findByUserId(userId: string): Promise<UserInventory[]>;
    findByUserIdAndItemId(userId: string, itemId: string): Promise<UserInventory | null>;
    create(userInventory: UserInventory): Promise<UserInventory>;
    update(id: string, userInventory: Partial<UserInventory>): Promise<UserInventory | null>;
    delete(id: string): Promise<boolean>;
    updateQuantity(userId: string, itemId: string, quantity: number): Promise<boolean>;
}
