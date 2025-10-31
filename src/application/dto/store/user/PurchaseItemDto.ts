
export class PurchaseItemDto {
    itemId: string;
    quantity?: number;

    constructor(itemId: string, quantity: number = 1) {
        this.itemId = itemId;
        this.quantity = quantity;
    }
}
