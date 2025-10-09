

import { CoinPurchase } from '../../entities/CoinPurchase';

export interface ICoinPurchaseRepository {
    create(purchase: CoinPurchase): Promise<CoinPurchase>;
    findById(id: string): Promise<CoinPurchase | null>;
    findByUserId(userId: string): Promise<CoinPurchase[]>;
    findByExternalOrderId(externalOrderId: string): Promise<CoinPurchase | null>;
    findByExternalPaymentId(externalPaymentId: string): Promise<CoinPurchase | null>;
    update(id: string, purchase: Partial<CoinPurchase>): Promise<CoinPurchase | null>;
    delete(id: string): Promise<boolean>;
}
