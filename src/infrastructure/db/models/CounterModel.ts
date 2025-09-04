

import mongoose, { Schema, Document } from 'mongoose';

export interface ICounterDocument extends Document {
    _id: string;
    sequence_value: number;
    createdAt: Date;
    updatedAt: Date;
}

const CounterSchema = new Schema<ICounterDocument>({
    _id: { type: String, required: true },
    sequence_value: { type: Number, required: true, default: 0 },
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    collection: 'counters'
});

export const CounterModel = mongoose.model<ICounterDocument>('Counter', CounterSchema);
