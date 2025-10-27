


export class CoinPurchase {
    public id?: string;
    public userId: string;
    public coins: number;
    public amount: number;
    public currency: string;
    public status: PurchaseStatus;
    public paymentMethod?: PaymentMethod;
    public externalOrderId?: string;
    public externalPaymentId?: string;
    public receipt?: string;
    public completedAt?: Date;
    public failedAt?: Date;
    public failureReason?: string;
    public paymentMethodDetails?: Record<string, any>;
    public ipAddress?: string;
    public userAgent?: string;
    public razorpayOrderStatus?: string;
    public webhookVerified?: boolean;
    public reconciliationNotes?: string;
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
        receipt,
        completedAt,
        failedAt,
        failureReason,
        paymentMethodDetails,
        ipAddress,
        userAgent,
        razorpayOrderStatus,
        webhookVerified,
        reconciliationNotes,
        createdAt = new Date(),
        updatedAt = new Date()
    }: {
        id?: string;
        userId: string;
        coins: number;
        amount: number;
        currency?: string;
        status?: PurchaseStatus;
        paymentMethod?: PaymentMethod;
        externalOrderId?: string;
        externalPaymentId?: string;
        receipt?: string;
        completedAt?: Date;
        failedAt?: Date;
        failureReason?: string;
        paymentMethodDetails?: Record<string, any>;
        ipAddress?: string;
        userAgent?: string;
        razorpayOrderStatus?: string;
        webhookVerified?: boolean;
        reconciliationNotes?: string;
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
        this.receipt = receipt;
        this.completedAt = completedAt;
        this.failedAt = failedAt;
        this.failureReason = failureReason;
        this.paymentMethodDetails = paymentMethodDetails;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.razorpayOrderStatus = razorpayOrderStatus;
        this.webhookVerified = webhookVerified;
        this.reconciliationNotes = reconciliationNotes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public markAsCompleted(): void {
        this.status = PurchaseStatus.COMPLETED;
        this.completedAt = new Date();
        this.updatedAt = new Date();
    }

    public markAsFailed(reason?: string): void {
        this.status = PurchaseStatus.FAILED;
        this.failedAt = new Date();
        this.failureReason = reason;
        this.updatedAt = new Date();
    }

    public isCompleted(): boolean {
        return this.status === PurchaseStatus.COMPLETED;
    }

    public isPending(): boolean {
        return this.status === PurchaseStatus.PENDING;
    }

    public canBeReconciled(): boolean {
        // Allow reconciliation for pending purchases older than 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return this.status === PurchaseStatus.PENDING && this.createdAt < fiveMinutesAgo;
    }

    public isStale(): boolean {
        // Consider a purchase stale after 30 minutes
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        return this.status === PurchaseStatus.PENDING && this.createdAt < thirtyMinutesAgo;
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
    WALLET = 'wallet',
    EMI = 'emi',
}
