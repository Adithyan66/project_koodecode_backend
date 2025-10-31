import { inject, injectable } from 'tsyringe';
import { IStoreItemRepository } from '../../../../domain/interfaces/repositories/IStoreItemRepository';
import { GetAllStoreItemsRequestDto } from '../../../dto/store/admin/GetAllStoreItemsRequestDto';
import { GetAllStoreItemsResponseDto } from '../../../dto/store/admin/GetAllStoreItemsResponseDto';
import { StoreItemAdminResponseDto } from '../../../dto/store/admin/StoreItemAdminResponseDto';
import { IGetAllStoreItemsForAdminUseCase } from '../../../interfaces/IStoreUseCase';

@injectable()
export class GetAllStoreItemsForAdminUseCase implements IGetAllStoreItemsForAdminUseCase {
    constructor(
        @inject('IStoreItemRepository') private storeItemRepository: IStoreItemRepository
    ) {}

    async execute(request: GetAllStoreItemsRequestDto): Promise<GetAllStoreItemsResponseDto> {
        const { items, total } = await this.storeItemRepository.findAllWithPagination(
            request.page,
            request.limit
        );

        const adminItems = items.map(item => new StoreItemAdminResponseDto({
            id: item.id!,
            name: item.name,
            type: item.type,
            price: item.price,
            description: item.description,
            imageUrl: item.imageUrl,
            isActive: item.isActive,
            componentId: item.componentId,
            metadata: item.metadata,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
        }));

        return new GetAllStoreItemsResponseDto({
            items: adminItems,
            total,
            page: request.page,
            limit: request.limit
        });
    }
}

