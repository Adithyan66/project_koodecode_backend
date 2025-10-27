export interface UserStoreDataDto {
  purchasedItems: Array<{
    itemId: string;
    itemName: string;
    itemType: string;
    purchasePrice: number;
    purchasedAt: string;
  }>;
  inventory: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    acquiredAt: string;
  }>;
}

