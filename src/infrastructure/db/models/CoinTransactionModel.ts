

import mongoose, { Schema, Document } from 'mongoose';
import { CoinTransactionType, CoinTransactionSource } from '../../../domain/entities/CoinTransaction';

export interface ICoinTransactionModel extends Document {
    userId: string;
    amount: number;
    type: CoinTransactionType;
    source: CoinTransactionSource;
    description: string;
    metadata?: Record<string, any>;
    createdAt: Date;
}

const CoinTransactionSchema: Schema = new Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    type: {
        type: String,
        enum: Object.values(CoinTransactionType),
        required: true,
        index: true
    },
    source: {
        type: String,
        enum: Object.values(CoinTransactionSource),
        required: true,
        index: true
    },
    description: {
        type: String,
        required: true,
        maxlength: 500
    },
    metadata: {
        type: Schema.Types.Mixed,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Compound indexes for efficient queries
CoinTransactionSchema.index({ userId: 1, createdAt: -1 });
CoinTransactionSchema.index({ userId: 1, type: 1 });
CoinTransactionSchema.index({ userId: 1, source: 1 });

export const CoinTransactionModel = mongoose.model<ICoinTransactionModel>('CoinTransaction', CoinTransactionSchema);
