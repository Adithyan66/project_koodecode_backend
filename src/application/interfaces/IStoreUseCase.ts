import { PurchaseItemDto } from "../dto/store/PurchaseItemDto";
import { StoreItemResponseDto } from "../dto/store/StoreItemResponseDto";
import { UserInventoryResponseDto } from "../dto/store/UserInventoryResponseDto";


export interface IGetStoreItemsUseCase {
    execute(userId?: string): Promise<StoreItemResponseDto[]>;
}

export interface IPurchaseStoreItemUseCase {
    execute(userId: string, purchaseData: PurchaseItemDto): Promise<{ success: boolean; message: string }>;
}


export interface IGetUserInventoryUseCase {
    execute(userId: string): Promise<UserInventoryResponseDto>;
}


export interface ICheckItemOwnershipUseCase {
    execute(userId: string, itemId: string, requiredQuantity?: number): Promise<boolean>;
}
