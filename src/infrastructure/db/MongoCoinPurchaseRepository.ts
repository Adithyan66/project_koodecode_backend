import { ICoinPurchaseRepository } from '../../domain/interfaces/repositories/ICoinPurchaseRepository';
import { CoinPurchase } from '../../domain/entities/CoinPurchase';
import { CoinPurchaseModel } from './models/CoinPurchaseModel';

export class MongoCoinPurchaseRepository implements ICoinPurchaseRepository {
    async create(purchase: CoinPurchase): Promise<CoinPurchase> {
        const purchaseDoc = new CoinPurchaseModel(purchase);
        const savedPurchase = await purchaseDoc.save();
        return this.mapToEntity(savedPurchase);
    }

    async findById(id: string): Promise<CoinPurchase | null> {
        const purchase = await CoinPurchaseModel.findById(id);
        return purchase ? this.mapToEntity(purchase) : null;
    }

    async findByUserId(userId: string): Promise<CoinPurchase[]> {
        const purchases = await CoinPurchaseModel.find({ userId }).sort({ createdAt: -1 });
        return purchases.map(this.mapToEntity);
    }

    async findByUserIdPaginated(userId: string, page: number, limit: number): Promise<CoinPurchase[]> {
        const skip = (page - 1) * limit;
        const purchases = await CoinPurchaseModel
            .find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        return purchases.map(this.mapToEntity);
    }

    async countByUserId(userId: string): Promise<number> {
        return await CoinPurchaseModel.countDocuments({ userId });
    }

    async findByExternalOrderId(externalOrderId: string): Promise<CoinPurchase | null> {
        const purchase = await CoinPurchaseModel.findOne({ externalOrderId });
        return purchase ? this.mapToEntity(purchase) : null;
    }

    async findByExternalPaymentId(externalPaymentId: string): Promise<CoinPurchase | null> {
        const purchase = await CoinPurchaseModel.findOne({ externalPaymentId });
        return purchase ? this.mapToEntity(purchase) : null;
    }

    async update(id: string, purchase: Partial<CoinPurchase>): Promise<CoinPurchase | null> {
        const updatedPurchase = await CoinPurchaseModel.findByIdAndUpdate(
            id,
            { ...purchase, updatedAt: new Date() },
            { new: true }
        );
        return updatedPurchase ? this.mapToEntity(updatedPurchase) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await CoinPurchaseModel.findByIdAndDelete(id);
        return !!result;
    }

    async findPendingByUserId(userId: string): Promise<CoinPurchase[]> {
        const purchases = await CoinPurchaseModel
            .find({ userId, status: 'pending' })
            .sort({ createdAt: -1 });
        return purchases.map(this.mapToEntity);
    }

    async findStuckPurchases(minutesOld: number): Promise<CoinPurchase[]> {
        const cutoffTime = new Date(Date.now() - minutesOld * 60 * 1000);
        const purchases = await CoinPurchaseModel
            .find({ 
                status: 'pending', 
                createdAt: { $lt: cutoffTime } 
            })
            .sort({ createdAt: 1 });
        return purchases.map(this.mapToEntity);
    }

    async findByIdWithDetails(id: string): Promise<CoinPurchase | null> {
        const purchase = await CoinPurchaseModel.findById(id);
        return purchase ? this.mapToEntity(purchase) : null;
    }

    private mapToEntity(doc: any): CoinPurchase {
        return new CoinPurchase({
            id: doc._id.toString(),
            userId: doc.userId,
            coins: doc.coins,
            amount: doc.amount,
            currency: doc.currency,
            status: doc.status,
            paymentMethod: doc.paymentMethod,
            externalOrderId: doc.externalOrderId,
            externalPaymentId: doc.externalPaymentId,
            receipt: doc.receipt,
            completedAt: doc.completedAt,
            failedAt: doc.failedAt,
            failureReason: doc.failureReason,
            paymentMethodDetails: doc.paymentMethodDetails,
            ipAddress: doc.ipAddress,
            userAgent: doc.userAgent,
            razorpayOrderStatus: doc.razorpayOrderStatus,
            webhookVerified: doc.webhookVerified,
            reconciliationNotes: doc.reconciliationNotes,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }
}
