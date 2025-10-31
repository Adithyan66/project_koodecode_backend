

import { inject, injectable } from 'tsyringe';
import { IStoreItemRepository } from '../../../../domain/interfaces/repositories/IStoreItemRepository';
import { IUserInventoryRepository } from '../../../../domain/interfaces/repositories/IUserInventoryRepository';
import { StoreItemResponseDto } from '../../../dto/store/user/StoreItemResponseDto';
import { IGetStoreItemsUseCase } from '../../../interfaces/IStoreUseCase';


@injectable()
export class GetStoreItemsUseCase implements IGetStoreItemsUseCase {

    constructor(
        @inject('IStoreItemRepository') private storeItemRepository: IStoreItemRepository,
        @inject('IUserInventoryRepository') private userInventoryRepository: IUserInventoryRepository
    ) { }

    async execute(userId?: string): Promise<StoreItemResponseDto[]> {

        const storeItems = await this.storeItemRepository.findActiveItems();

        if (!userId) {
            return storeItems.map(item => new StoreItemResponseDto({
                id: item.id!,
                name: item.name,
                type: item.type,
                price: item.price,
                description: item.description,
                imageUrl: item.imageUrl,
                componentId: item.componentId,
                metadata: item.metadata
            }));
        }

        // const userInventory = await this.userInventoryRepository.findByUserId(userId);
        // const inventoryMap = new Map(userInventory.map(inv => [inv.itemId, inv]));

        return storeItems.map(item => {
            // const userItem = inventoryMap.get(item.id!);
            return new StoreItemResponseDto({
                id: item.id!,
                name: item.name,
                type: item.type,
                price: item.price,
                description: item.description,
                imageUrl: item.imageUrl,
                componentId: item.componentId,
                metadata: item.metadata,
                // isOwned: !!userItem,
                // quantity: userItem?.quantity || 0
            });
        });
    }
}
