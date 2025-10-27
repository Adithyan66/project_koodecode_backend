

import { CoinPurchase } from '../../entities/CoinPurchase';

export interface ICoinPurchaseRepository {
    create(purchase: CoinPurchase): Promise<CoinPurchase>;
    findById(id: string): Promise<CoinPurchase | null>;
    findByUserId(userId: string): Promise<CoinPurchase[]>;
    findByUserIdPaginated(userId: string, page: number, limit: number): Promise<CoinPurchase[]>;
    countByUserId(userId: string): Promise<number>;
    findByExternalOrderId(externalOrderId: string): Promise<CoinPurchase | null>;
    findByExternalPaymentId(externalPaymentId: string): Promise<CoinPurchase | null>;
    findPendingByUserId(userId: string): Promise<CoinPurchase[]>;
    findStuckPurchases(minutesOld: number): Promise<CoinPurchase[]>;
    findByIdWithDetails(id: string): Promise<CoinPurchase | null>;
    update(id: string, purchase: Partial<CoinPurchase>): Promise<CoinPurchase | null>;
    delete(id: string): Promise<boolean>;
    findAllWithFiltersAndUserDetails(filters: {
        search?: string;
        status?: string;
        paymentMethod?: string;
        startDate?: Date;
        endDate?: Date;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        page: number;
        limit: number;
    }): Promise<{
        purchases: Array<CoinPurchase & { userEmail: string; userName: string }>;
        total: number;
    }>;
    getStatsByFilters(filters: {
        status?: string;
        paymentMethod?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        totalPurchases: number;
        totalRevenue: number;
        pendingCount: number;
        failedCount: number;
    }>;
    findByIdWithUserDetails(id: string): Promise<{
        purchase: CoinPurchase;
        user: { id: string; fullName: string; userName: string; email: string; profilePicKey?: string };
        notesWithUsers?: Array<{ text: string; createdAt: Date; createdBy: string; createdByUserName: string }>;
        refundedByUser?: { id: string; fullName: string; userName: string; email: string; profilePicKey?: string };
    } | null>;
}
