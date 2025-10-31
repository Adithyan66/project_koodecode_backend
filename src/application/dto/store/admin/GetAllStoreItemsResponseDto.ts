import { StoreItemAdminResponseDto } from './StoreItemAdminResponseDto';

export class GetAllStoreItemsResponseDto {
    items: StoreItemAdminResponseDto[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };

    constructor(data: {
        items: StoreItemAdminResponseDto[];
        total: number;
        page: number;
        limit: number;
    }) {
        this.items = data.items;
        this.pagination = {
            total: data.total,
            page: data.page,
            limit: data.limit,
            totalPages: Math.ceil(data.total / data.limit)
        };
    }
}

