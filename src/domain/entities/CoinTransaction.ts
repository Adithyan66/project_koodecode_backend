


export class CoinTransaction {
    public id?: string;
    public userId: string;
    public amount: number;
    public type: CoinTransactionType;
    public source: CoinTransactionSource;
    public description: string;
    public metadata?: Record<string, any>;
    public createdAt: Date;

    constructor({
        id,
        userId,
        amount,
        type,
        source,
        description,
        metadata,
        createdAt = new Date()
    }: {
        id?: string;
        userId: string;
        amount: number;
        type: CoinTransactionType;
        source: CoinTransactionSource;
        description: string;
        metadata?: Record<string, any>;
        createdAt?: Date;
    }) {
        this.id = id;
        this.userId = userId;
        this.amount = amount;
        this.type = type;
        this.source = source;
        this.description = description;
        this.metadata = metadata;
        this.createdAt = createdAt;
    }

    public isEarn(): boolean {
        return this.type === CoinTransactionType.EARN;
    }

    public isSpend(): boolean {
        return this.type === CoinTransactionType.SPEND;
    }

    public getDisplayAmount(): string {
        return this.isEarn() ? `+${this.amount}` : `-${this.amount}`;
    }
}

export enum CoinTransactionType {
    EARN = "earn",
    SPEND = "spend"
}

export enum CoinTransactionSource {
    DAILY_LOGIN = "daily_login",
    CONTEST_PARTICIPATION = "contest_participation",
    CONTEST_WIN = "contest_win",
    PROBLEM_SOLVED = "problem_solved",
    STREAK_BONUS = "streak_bonus",
    ADMIN_REWARD = "admin_reward",
    STORE_PURCHASE = "store_purchase",
    PREMIUM_UPGRADE = "premium_upgrade",
    HINT_PURCHASE = "hint_purchase",
    REFUND = "refund"
}
