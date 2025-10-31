

import { StoreItemType } from '../../../../domain/entities/StoreItem';

export class StoreItemResponseDto {
    id: string;
    name: string;
    type: StoreItemType;
    price: number;
    description: string;
    imageUrl: string;
    componentId: string;
    metadata?: Record<string, any>;
    isOwned?: boolean;
    quantity?: number;

    constructor(data: {
        id: string;
        name: string;
        type: StoreItemType;
        price: number;
        description: string;
        imageUrl: string;
        componentId: string;
        metadata?: Record<string, any>;
        isOwned?: boolean;
        quantity?: number;
    }) {
        this.id = data.id;
        this.name = data.name;
        this.type = data.type;
        this.price = data.price;
        this.description = data.description;
        this.imageUrl = data.imageUrl;
        this.componentId = data.componentId;
        this.metadata = data.metadata;
        this.isOwned = data.isOwned;
        this.quantity = data.quantity;
    }
}
