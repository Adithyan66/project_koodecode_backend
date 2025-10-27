

import mongoose, { Schema, Document } from 'mongoose';
import { PurchaseStatus, PaymentMethod } from '../../../domain/entities/CoinPurchase';

interface ICoinPurchaseDocument extends Document {
    userId: mongoose.Types.ObjectId;
    coins: number;
    amount: number;
    currency: string;
    status: PurchaseStatus;
    paymentMethod?: PaymentMethod;
    externalOrderId?: string;
    externalPaymentId?: string;
    receipt?: string;
    completedAt?: Date;
    failedAt?: Date;
    failureReason?: string;
    paymentMethodDetails?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    razorpayOrderStatus?: string;
    webhookVerified?: boolean;
    reconciliationNotes?: string;
    reconciledAt?: Date;
    refundedAt?: Date;
    refundNotes?: string;
    refundedBy?: mongoose.Types.ObjectId;
    notes?: Array<{ text: string; createdAt: Date; createdBy: mongoose.Types.ObjectId }>;
    createdAt: Date;
    updatedAt: Date;
}

const coinPurchaseSchema = new Schema<ICoinPurchaseDocument>({
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
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
        required: false
    },
    receipt: { type: String },
    completedAt: { type: Date },
    failedAt: { type: Date },
    failureReason: { type: String },
    paymentMethodDetails: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
    razorpayOrderStatus: { type: String },
    webhookVerified: { type: Boolean, default: false },
    reconciliationNotes: { type: String },
    reconciledAt: { type: Date },
    refundedAt: { type: Date },
    refundNotes: { type: String },
    refundedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: [{
        text: { type: String, required: true },
        createdAt: { type: Date, required: true },
        createdBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' }
    }],
    externalOrderId: { type: String },
    externalPaymentId: { type: String }
}, {
    timestamps: true,
    collection: 'coinpurchases'
});

coinPurchaseSchema.index({ userId: 1 });
coinPurchaseSchema.index({ externalOrderId: 1 });
coinPurchaseSchema.index({ externalPaymentId: 1 }, { unique: true, sparse: true });
coinPurchaseSchema.index({ status: 1 });
coinPurchaseSchema.index({ createdAt: 1 });
coinPurchaseSchema.index({ completedAt: 1 });
coinPurchaseSchema.index({ userId: 1, status: 1 });

export const CoinPurchaseModel = mongoose.model<ICoinPurchaseDocument>('CoinPurchase', coinPurchaseSchema);
