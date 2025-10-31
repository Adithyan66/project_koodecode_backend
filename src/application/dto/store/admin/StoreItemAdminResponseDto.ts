import { StoreItemType } from '../../../../domain/entities/StoreItem';

export class StoreItemAdminResponseDto {
    id: string;
    name: string;
    type: StoreItemType;
    price: number;
    description: string;
    imageUrl: string;
    isActive: boolean;
    componentId: string;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;

    constructor(data: {
        id: string;
        name: string;
        type: StoreItemType;
        price: number;
        description: string;
        imageUrl: string;
        isActive: boolean;
        componentId: string;
        metadata?: Record<string, any>;
        createdAt: Date;
        updatedAt: Date;
    }) {
        this.id = data.id;
        this.name = data.name;
        this.type = data.type;
        this.price = data.price;
        this.description = data.description;
        this.imageUrl = data.imageUrl;
        this.isActive = data.isActive;
        this.componentId = data.componentId;
        this.metadata = data.metadata;
        this.createdAt = data.createdAt.toISOString();
        this.updatedAt = data.updatedAt.toISOString();
    }
}

