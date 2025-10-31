import { PurchaseItemDto } from "../dto/store/user/PurchaseItemDto";
import { StoreItemResponseDto } from "../dto/store/user/StoreItemResponseDto";
import { UserInventoryResponseDto } from "../dto/store/user/UserInventoryResponseDto";
import { UseTimeTravelTicketDto } from "../dto/store/user/UseTimeTravelTicketDto";
import { MissedDaysResponseDto } from "../dto/store/user/MissedDaysResponseDto";
import { UpdateStoreItemDto } from "../dto/store/admin/UpdateStoreItemDto";
import { GetAllStoreItemsRequestDto } from "../dto/store/admin/GetAllStoreItemsRequestDto";
import { GetAllStoreItemsResponseDto } from "../dto/store/admin/GetAllStoreItemsResponseDto";
import { StoreItemAdminResponseDto } from "../dto/store/admin/StoreItemAdminResponseDto";


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

export interface IUseTimeTravelTicketUseCase {
    execute(userId: string, useTicketData: UseTimeTravelTicketDto): Promise<{ success: boolean; message: string }>;
}

export interface IGetMissedDaysUseCase {
    execute(userId: string): Promise<MissedDaysResponseDto>;
}

export interface IUpdateStoreItemUseCase {
    execute(itemId: string, updateData: UpdateStoreItemDto): Promise<StoreItemAdminResponseDto>;
}

export interface IToggleStoreItemActiveUseCase {
    execute(itemId: string): Promise<StoreItemAdminResponseDto>;
}

export interface IGetAllStoreItemsForAdminUseCase {
    execute(request: GetAllStoreItemsRequestDto): Promise<GetAllStoreItemsResponseDto>;
}
