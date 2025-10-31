import { inject, injectable } from 'tsyringe';
import { IUserInventoryRepository } from '../../../../domain/interfaces/repositories/IUserInventoryRepository';
import { ICheckItemOwnershipUseCase } from '../../../interfaces/IStoreUseCase';


@injectable()
export class CheckItemOwnershipUseCase implements ICheckItemOwnershipUseCase {

    constructor(
        @inject('IUserInventoryRepository') private userInventoryRepository: IUserInventoryRepository
    ) { }

    async execute(userId: string, itemId: string, requiredQuantity: number = 1): Promise<boolean> {
        const inventoryItem = await this.userInventoryRepository.findByUserIdAndItemId(userId, itemId);

        if (!inventoryItem) {
            return false;
        }

        return inventoryItem.hasQuantity(requiredQuantity);
    }
}
