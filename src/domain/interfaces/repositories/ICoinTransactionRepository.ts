

import { CoinTransaction, CoinTransactionType, CoinTransactionSource } from '../../entities/CoinTransaction';

export interface ICoinTransactionRepository {
    create(transaction: CoinTransaction): Promise<CoinTransaction>;
    findById(id: string): Promise<CoinTransaction | null>;
    findByUserId(userId: string, limit?: number, offset?: number): Promise<CoinTransaction[]>;
    findByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<CoinTransaction[]>;
    findByUserIdAndType(userId: string, type: CoinTransactionType, limit?: number): Promise<CoinTransaction[]>;
    findByUserIdAndSource(userId: string, source: CoinTransactionSource, limit?: number): Promise<CoinTransaction[]>;
    getTotalEarnedByUser(userId: string): Promise<number>;
    getTotalSpentByUser(userId: string): Promise<number>;
    getUserTransactionStats(userId: string): Promise<UserCoinStats>;
    countByUserId(userId: string): Promise<number>;
    delete(id: string): Promise<boolean>;
}

export interface UserCoinStats {
    totalEarned: number;
    totalSpent: number;
    currentBalance: number;
    transactionCount: number;
    lastTransactionDate?: Date;
    sourceBreakdown: Record<CoinTransactionSource, number>;
}
