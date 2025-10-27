

export class CreateCoinPurchaseOrderDto {
    coins: number;

    constructor(coins: number) {
        this.coins = coins;
    }
}

export class CoinPurchaseOrderResponseDto {
    purchaseId: string;
    orderId: string;
    amount: number;
    coins: number;
    currency: string;
    key:string

    constructor(data: {
        purchaseId: string;
        orderId: string;
        amount: number;
        coins: number;
        currency: string;
        key:string;
    }) {
        this.purchaseId = data.purchaseId;
        this.orderId = data.orderId;
        this.amount = data.amount;
        this.coins = data.coins;
        this.currency = data.currency;
        this.key = data.key
    }
}

export class CompletePurchaseDto {
    orderId: string;
    paymentId: string;
    signature: string;
    ipAddress?: string;
    userAgent?: string;

    constructor(orderId: string, paymentId: string, signature: string, ipAddress?: string, userAgent?: string) {
        this.orderId = orderId;
        this.paymentId = paymentId;
        this.signature = signature;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
    }
}
