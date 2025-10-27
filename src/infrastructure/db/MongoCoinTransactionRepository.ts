

import mongoose from 'mongoose';
import { CoinTransaction, CoinTransactionType, CoinTransactionSource } from '../../domain/entities/CoinTransaction';
import { ICoinTransactionRepository, UserCoinStats } from '../../domain/interfaces/repositories/ICoinTransactionRepository';
import { CoinTransactionModel, ICoinTransactionModel } from './models/CoinTransactionModel';

export class MongoCoinTransactionRepository implements ICoinTransactionRepository {
    
    async create(transaction: CoinTransaction): Promise<CoinTransaction> {
        const model = new CoinTransactionModel({
            userId: transaction.userId,
            amount: transaction.amount,
            type: transaction.type,
            source: transaction.source,
            description: transaction.description,
            metadata: transaction.metadata,
            createdAt: transaction.createdAt
        });
        
        const saved = await model.save();
        return this.toDomain(saved);
    }

    async findById(id: string): Promise<CoinTransaction | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        
        const model = await CoinTransactionModel.findById(id);
        return model ? this.toDomain(model) : null;
    }

    async findByUserId(userId: string, limit: number = 50, offset: number = 0): Promise<CoinTransaction[]> {
        const models = await CoinTransactionModel
            .find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(offset);
        
        return models.map(model => this.toDomain(model));
    }

    async findByUserIdPaginated(userId: string, page: number, limit: number): Promise<CoinTransaction[]> {
        const skip = (page - 1) * limit;
        const models = await CoinTransactionModel
            .find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        return models.map(model => this.toDomain(model));
    }

    async findByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<CoinTransaction[]> {
        const models = await CoinTransactionModel
            .find({
                userId,
                createdAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            })
            .sort({ createdAt: -1 });
        
        return models.map(model => this.toDomain(model));
    }

    async findByUserIdAndType(userId: string, type: CoinTransactionType, limit: number = 50): Promise<CoinTransaction[]> {
        const models = await CoinTransactionModel
            .find({ userId, type })
            .sort({ createdAt: -1 })
            .limit(limit);
        
        return models.map(model => this.toDomain(model));
    }

    async findByUserIdAndSource(userId: string, source: CoinTransactionSource, limit: number = 50): Promise<CoinTransaction[]> {
        const models = await CoinTransactionModel
            .find({ userId, source })
            .sort({ createdAt: -1 })
            .limit(limit);
        
        return models.map(model => this.toDomain(model));
    }

    async getTotalEarnedByUser(userId: string): Promise<number> {
        const result = await CoinTransactionModel.aggregate([
            { $match: { userId, type: CoinTransactionType.EARN } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        return result.length > 0 ? result[0].total : 0;
    }

    async getTotalSpentByUser(userId: string): Promise<number> {
        const result = await CoinTransactionModel.aggregate([
            { $match: { userId, type: CoinTransactionType.SPEND } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        return result.length > 0 ? result[0].total : 0;
    }

    async getUserTransactionStats(userId: string): Promise<UserCoinStats> {
        
        const [earnedResult, spentResult, countResult, sourceBreakdown, lastTransaction] = await Promise.all([
            this.getTotalEarnedByUser(userId),
            this.getTotalSpentByUser(userId),
            this.countByUserId(userId),
            this.getSourceBreakdown(userId),
            CoinTransactionModel.findOne({ userId }).sort({ createdAt: -1 })
        ]);

        return {
            totalEarned: earnedResult,
            totalSpent: spentResult,
            currentBalance: earnedResult - spentResult,
            transactionCount: countResult,
            lastTransactionDate: lastTransaction?.createdAt,
            sourceBreakdown
        };
    }

    async countByUserId(userId: string): Promise<number> {
        return await CoinTransactionModel.countDocuments({ userId });
    }

    async delete(id: string): Promise<boolean> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return false;
        }
        
        const result = await CoinTransactionModel.deleteOne({ _id: id });
        return result.deletedCount > 0;
    }

    private async getSourceBreakdown(userId: string): Promise<Record<CoinTransactionSource, number>> {
        const pipeline = [
            { $match: { userId } },
            {
                $group: {
                    _id: '$source',
                    earned: {
                        $sum: {
                            $cond: [
                                { $eq: ['$type', CoinTransactionType.EARN] },
                                '$amount',
                                0
                            ]
                        }
                    },
                    spent: {
                        $sum: {
                            $cond: [
                                { $eq: ['$type', CoinTransactionType.SPEND] },
                                '$amount',
                                0
                            ]
                        }
                    }
                }
            }
        ];

        const results = await CoinTransactionModel.aggregate(pipeline);
        const breakdown: Record<CoinTransactionSource, number> = {} as Record<CoinTransactionSource, number>;

        // Initialize all sources with 0
        Object.values(CoinTransactionSource).forEach(source => {
            breakdown[source] = 0;
        });

        // Fill with actual data
        results.forEach(result => {
            breakdown[result._id as CoinTransactionSource] = result.earned - result.spent;
        });

        return breakdown;
    }

    private toDomain(model: ICoinTransactionModel): CoinTransaction {
        return new CoinTransaction({
            id: model._id.toString(),
            userId: model.userId,
            amount: model.amount,
            type: model.type,
            source: model.source,
            description: model.description,
            metadata: model.metadata,
            createdAt: model.createdAt
        });
    }
}
