
import { IStoreItemRepository } from '../../../domain/interfaces/repositories/IStoreItemRepository';
import { IUserInventoryRepository } from '../../../domain/interfaces/repositories/IUserInventoryRepository';
import { IUserProfileRepository } from '../../../domain/interfaces/repositories/IUserProfileRepository';
import { ICoinTransactionRepository } from '../../../domain/interfaces/repositories/ICoinTransactionRepository';
import { PurchaseItemDto } from '../../dto/store/PurchaseItemDto';
import { AppError } from '../../../shared/exceptions/AppError';
import { HTTP_STATUS } from '../../../shared/constants/httpStatus';
import { UserInventory } from '../../../domain/entities/UserInventory';
import { CoinTransaction, CoinTransactionType, CoinTransactionSource } from '../../../domain/entities/CoinTransaction';

export class PurchaseStoreItemUseCase {
    constructor(
        private storeItemRepository: IStoreItemRepository,
        private userInventoryRepository: IUserInventoryRepository,
        private userProfileRepository: IUserProfileRepository,
        private coinTransactionRepository: ICoinTransactionRepository
    ) {}

    async execute(userId: string, purchaseData: PurchaseItemDto): Promise<{ success: boolean; message: string }> {
        // Get store item
        const storeItem = await this.storeItemRepository.findById(purchaseData.itemId);
        if (!storeItem || !storeItem.isActive) {
            throw new AppError('Store item not found', HTTP_STATUS.NOT_FOUND);
        }

        const quantity = purchaseData.quantity || 1;
        const totalCost = storeItem.price * quantity;

        // Get user profile
        const userProfile = await this.userProfileRepository.findByUserId(userId);
        if (!userProfile) {
            throw new AppError('User profile not found', HTTP_STATUS.NOT_FOUND);
        }

        // Check sufficient balance
        if (userProfile.coinBalance < totalCost) {
            throw new AppError('Insufficient coin balance', HTTP_STATUS.BAD_REQUEST);
        }

        // Check if user already owns permanent items
        if (storeItem.isPermanent()) {
            const existingItem = await this.userInventoryRepository.findByUserIdAndItemId(userId, storeItem.id!);
            if (existingItem) {
                throw new AppError('You already own this item', HTTP_STATUS.BAD_REQUEST);
            }
        }

        // Deduct coins from user
        userProfile.coinBalance -= totalCost;
        await this.userProfileRepository.update(userId, { coinBalance: userProfile.coinBalance });

        // Create coin transaction
        const coinTransaction = new CoinTransaction({
            userId,
            amount: totalCost,
            type: CoinTransactionType.SPEND,
            source: CoinTransactionSource.STORE_PURCHASE,
            description: `Purchased ${storeItem.name}${quantity > 1 ? ` x${quantity}` : ''}`,
            metadata: {
                itemId: storeItem.id,
                itemName: storeItem.name,
                quantity: quantity
            }
        });
        await this.coinTransactionRepository.create(coinTransaction);

        // Add item to user inventory
        const existingInventoryItem = await this.userInventoryRepository.findByUserIdAndItemId(userId, storeItem.id!);
        
        if (existingInventoryItem) {
            // Update quantity for consumable items
            await this.userInventoryRepository.updateQuantity(userId, storeItem.id!, existingInventoryItem.quantity + quantity);
        } else {
            // Create new inventory item
            const userInventoryItem = new UserInventory({
                userId,
                itemId: storeItem.id!,
                quantity
            });
            await this.userInventoryRepository.create(userInventoryItem);
        }

        return {
            success: true,
            message: `Successfully purchased ${storeItem.name}${quantity > 1 ? ` x${quantity}` : ''}`
        };
    }
}
