

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
}
