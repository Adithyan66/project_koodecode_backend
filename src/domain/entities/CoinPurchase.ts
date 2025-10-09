


export class CoinPurchase {
    public id?: string;
    public userId: string;
    public coins: number;
    public amount: number;
    public currency: string;
    public status: PurchaseStatus;
    public paymentMethod: PaymentMethod;
    public externalOrderId?: string;
    public externalPaymentId?: string;
    public createdAt: Date;
    public updatedAt: Date;

    constructor({
        id,
        userId,
        coins,
        amount,
        currency = 'INR',
        status = PurchaseStatus.PENDING,
        paymentMethod,
        externalOrderId,
        externalPaymentId,
        createdAt = new Date(),
        updatedAt = new Date()
    }: {
        id?: string;
        userId: string;
        coins: number;
        amount: number;
        currency?: string;
        status?: PurchaseStatus;
        paymentMethod: PaymentMethod;
        externalOrderId?: string;
        externalPaymentId?: string;
        createdAt?: Date;
        updatedAt?: Date;
    }) {
        this.id = id;
        this.userId = userId;
        this.coins = coins;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
        this.paymentMethod = paymentMethod;
        this.externalOrderId = externalOrderId;
        this.externalPaymentId = externalPaymentId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public markAsCompleted(): void {
        this.status = PurchaseStatus.COMPLETED;
        this.updatedAt = new Date();
    }

    public markAsFailed(): void {
        this.status = PurchaseStatus.FAILED;
        this.updatedAt = new Date();
    }

    public isCompleted(): boolean {
        return this.status === PurchaseStatus.COMPLETED;
    }

    public isPending(): boolean {
        return this.status === PurchaseStatus.PENDING;
    }
}

export enum PurchaseStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled'
}

export enum PaymentMethod {
    UPI = 'upi',
    CARD = 'card',
    NET_BANKING = 'net_banking',
    WALLET = 'wallet'
}
