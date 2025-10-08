import { IUserInventoryRepository } from '../../../domain/interfaces/repositories/IUserInventoryRepository';
import { IStoreItemRepository } from '../../../domain/interfaces/repositories/IStoreItemRepository';
import { UserInventoryResponseDto, UserInventoryItemDto } from '../../dto/store/UserInventoryResponseDto';

export class GetUserInventoryUseCase {
    constructor(
        private userInventoryRepository: IUserInventoryRepository,
        private storeItemRepository: IStoreItemRepository
    ) {}

    async execute(userId: string): Promise<UserInventoryResponseDto> {
        const userInventory = await this.userInventoryRepository.findByUserId(userId);
        
        const inventoryItems: UserInventoryItemDto[] = [];
        
        for (const inventoryItem of userInventory) {
            const storeItem = await this.storeItemRepository.findById(inventoryItem.itemId);
            if (storeItem) {
                inventoryItems.push(new UserInventoryItemDto({
                    id: inventoryItem.id!,
                    itemId: inventoryItem.itemId,
                    name: storeItem.name,
                    type: storeItem.type,
                    componentId: storeItem.componentId,
                    quantity: inventoryItem.quantity,
                    purchasedAt: inventoryItem.purchasedAt,
                    lastUsedAt: inventoryItem.lastUsedAt
                }));
            }
        }

        return new UserInventoryResponseDto(inventoryItems);
    }
}
