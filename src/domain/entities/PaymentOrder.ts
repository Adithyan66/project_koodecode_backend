


export class PaymentOrder {
    public orderId: string;
    public amount: number;
    public currency: string;
    public receipt: string;
    public metadata?: Record<string, any>;
    public key: string;

    constructor({
        orderId,
        amount,
        currency,
        receipt,
        metadata,
        key
    }: {
        orderId: string;
        amount: number;
        currency: string;
        receipt: string;
        metadata?: Record<string, any>;
        key: string
    }) {
        this.orderId = orderId;
        this.amount = amount;
        this.currency = currency;
        this.receipt = receipt;
        this.metadata = metadata;
        this.key = key
    }
}
