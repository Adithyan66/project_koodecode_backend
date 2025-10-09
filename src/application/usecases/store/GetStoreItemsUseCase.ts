

import { IStoreItemRepository } from '../../../domain/interfaces/repositories/IStoreItemRepository';
import { IUserInventoryRepository } from '../../../domain/interfaces/repositories/IUserInventoryRepository';
import { StoreItemResponseDto } from '../../dto/store/StoreItemResponseDto';

export class GetStoreItemsUseCase {
    constructor(
        private storeItemRepository: IStoreItemRepository,
        private userInventoryRepository: IUserInventoryRepository
    ) {}

    async execute(userId?: string): Promise<StoreItemResponseDto[]> {
        
        const storeItems = await this.storeItemRepository.findActiveItems();
        
        if (!userId) {
            return storeItems.map(item => new StoreItemResponseDto({
                id: item.id!,
                name: item.name,
                type: item.type,
                price: item.price,
                description: item.description,
                componentId: item.componentId,
                metadata: item.metadata
            }));
        }

        const userInventory = await this.userInventoryRepository.findByUserId(userId);
        const inventoryMap = new Map(userInventory.map(inv => [inv.itemId, inv]));

        return storeItems.map(item => {
            const userItem = inventoryMap.get(item.id!);
            return new StoreItemResponseDto({
                id: item.id!,
                name: item.name,
                type: item.type,
                price: item.price,
                description: item.description,
                componentId: item.componentId,
                metadata: item.metadata,
                isOwned: !!userItem,
                quantity: userItem?.quantity || 0
            });
        });
    }
}
