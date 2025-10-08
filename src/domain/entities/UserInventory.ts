

export class UserInventory {
    public id?: string;
    public userId: string;
    public itemId: string;
    public quantity: number;
    public purchasedAt: Date;
    public lastUsedAt?: Date;

    constructor({
        id,
        userId,
        itemId,
        quantity = 1,
        purchasedAt = new Date(),
        lastUsedAt
    }: {
        id?: string;
        userId: string;
        itemId: string;
        quantity?: number;
        purchasedAt?: Date;
        lastUsedAt?: Date;
    }) {
        this.id = id;
        this.userId = userId;
        this.itemId = itemId;
        this.quantity = quantity;
        this.purchasedAt = purchasedAt;
        this.lastUsedAt = lastUsedAt;
    }

    public use(amount: number = 1): void {
        if (this.quantity < amount) {
            throw new Error('Insufficient quantity');
        }
        this.quantity -= amount;
        this.lastUsedAt = new Date();
    }

    public hasQuantity(amount: number = 1): boolean {
        return this.quantity >= amount;
    }
}
