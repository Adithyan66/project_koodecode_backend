
import { StoreItemType } from '../../../domain/entities/StoreItem';

export class UserInventoryItemDto {
    id: string;
    itemId: string;
    name: string;
    type: StoreItemType;
    componentId: string;
    quantity: number;
    purchasedAt: Date;
    lastUsedAt?: Date;

    constructor(data: {
        id: string;
        itemId: string;
        name: string;
        type: StoreItemType;
        componentId: string;
        quantity: number;
        purchasedAt: Date;
        lastUsedAt?: Date;
    }) {
        this.id = data.id;
        this.itemId = data.itemId;
        this.name = data.name;
        this.type = data.type;
        this.componentId = data.componentId;
        this.quantity = data.quantity;
        this.purchasedAt = data.purchasedAt;
        this.lastUsedAt = data.lastUsedAt;
    }
}

export class UserInventoryResponseDto {
    items: UserInventoryItemDto[];
    totalItems: number;

    constructor(items: UserInventoryItemDto[]) {
        this.items = items;
        this.totalItems = items.length;
    }
}
