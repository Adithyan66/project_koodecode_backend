import { inject, injectable } from 'tsyringe';
import { IStoreItemRepository } from '../../../../domain/interfaces/repositories/IStoreItemRepository';
import { UpdateStoreItemDto } from '../../../dto/store/admin/UpdateStoreItemDto';
import { StoreItemAdminResponseDto } from '../../../dto/store/admin/StoreItemAdminResponseDto';
import { AppError } from '../../../errors/AppError';
import { HTTP_STATUS } from '../../../../shared/constants/httpStatus';
import { IUpdateStoreItemUseCase } from '../../../interfaces/IStoreUseCase';

@injectable()
export class UpdateStoreItemUseCase implements IUpdateStoreItemUseCase {
    constructor(
        @inject('IStoreItemRepository') private storeItemRepository: IStoreItemRepository
    ) {}

    async execute(itemId: string, updateData: UpdateStoreItemDto): Promise<StoreItemAdminResponseDto> {
        const validation = updateData.validate();
        if (!validation.isValid) {
            throw new AppError(validation.errors.join(', '), HTTP_STATUS.BAD_REQUEST);
        }

        const existingItem = await this.storeItemRepository.findById(itemId);
        if (!existingItem) {
            throw new AppError('Store item not found', HTTP_STATUS.NOT_FOUND);
        }

        const updatePayload: any = {};
        
        if (updateData.price !== undefined) {
            updatePayload.price = updateData.price;
        }
        if (updateData.description !== undefined) {
            updatePayload.description = updateData.description;
        }
        if (updateData.imageUrl !== undefined) {
            updatePayload.imageUrl = updateData.imageUrl;
        }
        if (updateData.isActive !== undefined) {
            updatePayload.isActive = updateData.isActive;
        }
        if (updateData.metadata !== undefined) {
            updatePayload.metadata = updateData.metadata;
        }

        const updatedItem = await this.storeItemRepository.update(itemId, updatePayload);
        
        if (!updatedItem) {
            throw new AppError('Failed to update store item', HTTP_STATUS.INTERNAL_SERVER_ERROR);
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

