import { ICoinPurchaseRepository } from '../../domain/interfaces/repositories/ICoinPurchaseRepository';
import { CoinPurchase } from '../../domain/entities/CoinPurchase';
import { CoinPurchaseModel } from './models/CoinPurchaseModel';
import { UserModel } from './models/UserModel';
import mongoose from 'mongoose';

export class MongoCoinPurchaseRepository implements ICoinPurchaseRepository {
    async create(purchase: CoinPurchase): Promise<CoinPurchase> {
        const purchaseData: any = {
            ...purchase,
            userId: new mongoose.Types.ObjectId(purchase.userId)
        };
        const purchaseDoc = new CoinPurchaseModel(purchaseData);
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

    async findAllWithFiltersAndUserDetails(filters: {
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
    }> {
        const { search, status, paymentMethod, startDate, endDate, sortBy, sortOrder, page, limit } = filters;
        const skip = (page - 1) * limit;

        // Build match conditions
        const matchConditions: any = {};

        if (status) {
            matchConditions.status = status;
        }

        if (paymentMethod) {
            matchConditions.paymentMethod = paymentMethod;
        }

        if (startDate || endDate) {
            matchConditions.createdAt = {};
            if (startDate) {
                matchConditions.createdAt.$gte = startDate;
            }
            if (endDate) {
                matchConditions.createdAt.$lte = endDate;
            }
        }

        // Build sort conditions
        const sortDirection = sortOrder === 'asc' ? 1 : -1;
        let sortField = 'createdAt'; // default
        if (sortBy) {
            sortField = sortBy;
        }

        const aggregationPipeline: any[] = [
            { $match: matchConditions },
            {
                $addFields: {
                    userIdObject: { $convert: { input: '$userId', to: 'objectId', onError: null, onNull: null } }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userIdObject',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } }
        ];

        // Add search conditions after lookup if provided
        if (search) {
            const searchRegex = { $regex: search, $options: 'i' };
            aggregationPipeline.push({
                $match: {
                    $or: [
                        { externalOrderId: searchRegex },
                        { externalPaymentId: searchRegex },
                        { receipt: searchRegex },
                        { 'user.email': searchRegex },
                        { 'user.userName': searchRegex }
                    ]
                }
            });
        }

        // Get total count with search and filters
        const countPipeline = [...aggregationPipeline, { $count: 'total' }];
        const countResult = await CoinPurchaseModel.aggregate(countPipeline).exec();
        const total = countResult[0]?.total || 0;

        // Add sorting and pagination
        aggregationPipeline.push(
            { $sort: { [sortField]: sortDirection } },
            { $skip: skip },
            { $limit: limit }
        );

        const results = await CoinPurchaseModel.aggregate(aggregationPipeline).exec();

        const purchases = results.map((doc: any) => {
            const entity = this.mapToEntity(doc);
            return {
                ...entity,
                userEmail: doc.user?.email || '',
                userName: doc.user?.userName || ''
            } as CoinPurchase & { userEmail: string; userName: string };
        });

        return { purchases, total };
    }

    async getStatsByFilters(filters: {
        status?: string;
        paymentMethod?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        totalPurchases: number;
        totalRevenue: number;
        pendingCount: number;
        failedCount: number;
    }> {
        const { status, paymentMethod, startDate, endDate } = filters;

        const matchConditions: any = {};

        if (status) {
            matchConditions.status = status;
        }

        if (paymentMethod) {
            matchConditions.paymentMethod = paymentMethod;
        }

        if (startDate || endDate) {
            matchConditions.createdAt = {};
            if (startDate) {
                matchConditions.createdAt.$gte = startDate;
            }
            if (endDate) {
                matchConditions.createdAt.$lte = endDate;
            }
        }

        // Get total purchases count
        const totalPurchases = await CoinPurchaseModel.countDocuments(matchConditions);

        // Get total revenue from completed purchases only
        const completedMatchConditions = { ...matchConditions, status: 'completed' };
        const revenueResult = await CoinPurchaseModel.aggregate([
            { $match: completedMatchConditions },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]).exec();
        const totalRevenue = revenueResult[0]?.total || 0;

        // Get pending count
        const pendingMatchConditions = { ...matchConditions, status: 'pending' };
        const pendingCount = await CoinPurchaseModel.countDocuments(pendingMatchConditions);

        // Get failed count
        const failedMatchConditions = { ...matchConditions, status: 'failed' };
        const failedCount = await CoinPurchaseModel.countDocuments(failedMatchConditions);

        return {
            totalPurchases,
            totalRevenue,
            pendingCount,
            failedCount
        };
    }

    async findByIdWithUserDetails(id: string): Promise<{
        purchase: CoinPurchase;
        user: { id: string; fullName: string; userName: string; email: string; profilePicKey?: string };
        notesWithUsers?: Array<{ text: string; createdAt: Date; createdBy: string; createdByUserName: string }>;
        refundedByUser?: { id: string; fullName: string; userName: string; email: string; profilePicKey?: string };
    } | null> {
        const result = await CoinPurchaseModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
            {
                $addFields: {
                    userIdObject: { $convert: { input: '$userId', to: 'objectId', onError: null, onNull: null } }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userIdObject',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } }
        ]).exec();

        if (!result || result.length === 0 || !result[0].user) {
            return null;
        }

        const doc = result[0];
        
        // Populate note creators
        let notesWithUsers: Array<{ text: string; createdAt: Date; createdBy: string; createdByUserName: string }> = [];
        if (doc.notes && doc.notes.length > 0) {
            const noteUserIds = doc.notes.map((note: any) => new mongoose.Types.ObjectId(note.createdBy));
            const noteUsers = await UserModel.find({ _id: { $in: noteUserIds } }).exec();
            const userMap = new Map(noteUsers.map(user => [user._id.toString(), user.userName]));
            
            notesWithUsers = doc.notes.map((note: any) => ({
                text: note.text,
                createdAt: note.createdAt,
                createdBy: note.createdBy?.toString() || note.createdBy,
                createdByUserName: userMap.get(note.createdBy?.toString() || note.createdBy) || 'Unknown'
            }));
        }
        
        const purchase = this.mapToEntity(doc);
        const user = {
            id: doc.user._id.toString(),
            fullName: doc.user.fullName,
            userName: doc.user.userName,
            email: doc.user.email,
            profilePicKey: doc.user.profilePicKey ? doc.user.profilePicKey.toString() : undefined
        };

        // Fetch refundedBy user details if refundedBy exists
        let refundedByUser = undefined;
        if (doc.refundedBy) {
            const refundedByUserDoc = await UserModel.findById(doc.refundedBy);
            if (refundedByUserDoc) {
                refundedByUser = {
                    id: refundedByUserDoc._id.toString(),
                    fullName: refundedByUserDoc.fullName,
                    userName: refundedByUserDoc.userName,
                    email: refundedByUserDoc.email,
                    profilePicKey: refundedByUserDoc.profilePicKey ? refundedByUserDoc.profilePicKey.toString() : undefined
                };
            }
        }

        return { purchase, user, notesWithUsers, refundedByUser };
    }

    private mapToEntity(doc: any): CoinPurchase {
        return new CoinPurchase({
            id: doc._id.toString(),
            userId: doc.userId?.toString() || doc.userId,
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
            reconciledAt: doc.reconciledAt,
            refundedAt: doc.refundedAt,
            refundNotes: doc.refundNotes,
            refundedBy: doc.refundedBy?.toString() || doc.refundedBy,
            notes: doc.notes?.map((note: any) => ({
                text: note.text,
                createdAt: note.createdAt,
                createdBy: note.createdBy?.toString() || note.createdBy
            })),
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }
}
