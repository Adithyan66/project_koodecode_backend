

import mongoose, { Schema, Document } from 'mongoose';
import { PurchaseStatus, PaymentMethod } from '../../../domain/entities/CoinPurchase';

interface ICoinPurchaseDocument extends Document {
    userId: string;
    coins: number;
    amount: number;
    currency: string;
    status: PurchaseStatus;
    paymentMethod: PaymentMethod;
    externalOrderId?: string;
    externalPaymentId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const coinPurchaseSchema = new Schema<ICoinPurchaseDocument>({
    userId: { type: String, required: true, ref: 'User' },
    coins: { type: Number, required: true, min: 1 },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    status: { 
        type: String, 
        enum: Object.values(PurchaseStatus), 
        default: PurchaseStatus.PENDING 
    },
    paymentMethod: { 
        type: String, 
        enum: Object.values(PaymentMethod),
        required: true
    },
    externalOrderId: { type: String },
    externalPaymentId: { type: String }
}, {
    timestamps: true,
    collection: 'coinpurchases'
});

coinPurchaseSchema.index({ userId: 1 });
coinPurchaseSchema.index({ externalOrderId: 1 });
coinPurchaseSchema.index({ externalPaymentId: 1 });
coinPurchaseSchema.index({ status: 1 });

export const CoinPurchaseModel = mongoose.model<ICoinPurchaseDocument>('CoinPurchase', coinPurchaseSchema);
