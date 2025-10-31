import { inject, injectable } from 'tsyringe';
import { IStoreItemRepository } from '../../../../domain/interfaces/repositories/IStoreItemRepository';
import { StoreItemAdminResponseDto } from '../../../dto/store/admin/StoreItemAdminResponseDto';
import { AppError } from '../../../errors/AppError';
import { HTTP_STATUS } from '../../../../shared/constants/httpStatus';
import { IToggleStoreItemActiveUseCase } from '../../../interfaces/IStoreUseCase';

@injectable()
export class ToggleStoreItemActiveUseCase implements IToggleStoreItemActiveUseCase {
    constructor(
        @inject('IStoreItemRepository') private storeItemRepository: IStoreItemRepository
    ) {}

    async execute(itemId: string): Promise<StoreItemAdminResponseDto> {
        const existingItem = await this.storeItemRepository.findById(itemId);
        if (!existingItem) {
            throw new AppError('Store item not found', HTTP_STATUS.NOT_FOUND);
        }

        const updatedItem = await this.storeItemRepository.update(itemId, {
            isActive: !existingItem.isActive
        });

        if (!updatedItem) {
            throw new AppError('Failed to toggle store item status', HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        return new StoreItemAdminResponseDto({
            id: updatedItem.id!,
            name: updatedItem.name,
            type: updatedItem.type,
            price: updatedItem.price,
            description: updatedItem.description,
            imageUrl: updatedItem.imageUrl,
            isActive: updatedItem.isActive,
            componentId: updatedItem.componentId,
            metadata: updatedItem.metadata,
            createdAt: updatedItem.createdAt,
            updatedAt: updatedItem.updatedAt
        });
    }
}

