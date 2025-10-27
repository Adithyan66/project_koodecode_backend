import { inject, injectable } from 'tsyringe';
import { ICoinTransactionRepository } from '../../../../domain/interfaces/repositories/ICoinTransactionRepository';
import { IUserInventoryRepository } from '../../../../domain/interfaces/repositories/IUserInventoryRepository';
import { IStoreItemRepository } from '../../../../domain/interfaces/repositories/IStoreItemRepository';
import { IUserProfileRepository } from '../../../../domain/interfaces/repositories/IUserProfileRepository';
import { IGetUserStoreDataUseCase } from '../../../interfaces/IUserUseCase';
import { UserStoreDataDto } from '../../../dto/users/admin/UserStoreDataDto';
import { NotFoundError } from '../../../errors/AppErrors';
import { CoinTransactionSource, CoinTransactionType } from '../../../../domain/entities/CoinTransaction';

@injectable()
export class GetUserStoreDataUseCase implements IGetUserStoreDataUseCase {
  constructor(
    @inject('ICoinTransactionRepository') private coinTransactionRepository: ICoinTransactionRepository,
    @inject('IUserInventoryRepository') private userInventoryRepository: IUserInventoryRepository,
    @inject('IStoreItemRepository') private storeItemRepository: IStoreItemRepository,
    @inject('IUserProfileRepository') private userProfileRepository: IUserProfileRepository
  ) {}

  async execute(userId: string): Promise<UserStoreDataDto> {

    const userProfile = await this.userProfileRepository.findByUserId(userId);
    if (!userProfile) {
      throw new NotFoundError('User not found');
    }


    const allTransactions = await this.coinTransactionRepository.findByUserId(userId);
    const storePurchases = allTransactions.filter(
      transaction => 
        transaction.type === CoinTransactionType.SPEND && 
        transaction.source === CoinTransactionSource.STORE_PURCHASE
    );


    const purchasedItems = storePurchases.map(transaction => {
      const metadata = transaction.metadata || {};
      return {
        itemId: metadata.itemId || '',
        itemName: metadata.itemName || transaction.description,
        itemType: metadata.itemType || 'unknown',
        purchasePrice: transaction.amount,
        purchasedAt: transaction.createdAt.toISOString()
      };
    });

    // Get current inventory
    const userInventory = await this.userInventoryRepository.findByUserId(userId);

    // Map inventory with item details
    const inventory = await Promise.all(
      userInventory.map(async (inventoryItem) => {
        const storeItem = await this.storeItemRepository.findById(inventoryItem.itemId);
        return {
          itemId: inventoryItem.itemId,
          itemName: storeItem ? storeItem.name : 'Unknown Item',
          quantity: inventoryItem.quantity,
          acquiredAt: inventoryItem.purchasedAt.toISOString()
        };
      })
    );

    return {
      purchasedItems,
      inventory
    };
  }
}

