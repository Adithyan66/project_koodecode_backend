
import { StoreItem, StoreItemType } from '../../entities/StoreItem';

export interface IStoreItemRepository {
    findAll(): Promise<StoreItem[]>;
    findById(id: string): Promise<StoreItem | null>;
    findByType(type: StoreItemType): Promise<StoreItem[]>;
    findActiveItems(): Promise<StoreItem[]>;
    findAllWithPagination(page: number, limit: number): Promise<{ items: StoreItem[]; total: number }>;
    create(storeItem: StoreItem): Promise<StoreItem>;
    update(id: string, storeItem: Partial<StoreItem>): Promise<StoreItem | null>;
    delete(id: string): Promise<boolean>;
}
