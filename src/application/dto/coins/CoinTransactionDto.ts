export interface CreateCoinTransactionDto {
    userId: string;
    amount: number;
    source: string;
    description: string;
    metadata?: Record<string, any>;
}

export interface CoinTransactionResponseDto {
    id: string;
    userId: string;
    amount: number;
    type: string;
    source: string;
    description: string;
    metadata?: Record<string, any>;
    createdAt: string;
    displayAmount: string;
}

export interface CoinBalanceDto {
    userId: string;
    balance: number;
    lastUpdated: string;
}

export interface CoinStatsDto {
    totalEarned: number;
    totalSpent: number;
    currentBalance: number;
    transactionCount: number;
    lastTransactionDate?: string;
    sourceBreakdown: Record<string, number>;
}

export interface TransferCoinsDto {
    fromUserId: string;
    toUserId: string;
    amount: number;
    description: string;
}
