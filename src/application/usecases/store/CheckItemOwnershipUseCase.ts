import { IUserInventoryRepository } from '../../../domain/interfaces/repositories/IUserInventoryRepository';

export class CheckItemOwnershipUseCase {
    constructor(private userInventoryRepository: IUserInventoryRepository) {}

    async execute(userId: string, itemId: string, requiredQuantity: number = 1): Promise<boolean> {
        const inventoryItem = await this.userInventoryRepository.findByUserIdAndItemId(userId, itemId);
        
        if (!inventoryItem) {
            return false;
        }

        return inventoryItem.hasQuantity(requiredQuantity);
    }
}
