import mongoose, { Schema, Document } from 'mongoose';
import { StoreItem, StoreItemType } from '../../../domain/entities/StoreItem';

interface IStoreItemDocument extends Document {
    name: string;
    type: StoreItemType;
    price: number;
    description: string;
    isActive: boolean;
    componentId: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const storeItemSchema = new Schema<IStoreItemDocument>({
    name: { type: String, required: true },
    type: { 
        type: String, 
        enum: Object.values(StoreItemType), 
        required: true 
    },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    componentId: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} }
}, {
    timestamps: true,
    collection: 'storeitems'
});

storeItemSchema.index({ type: 1, isActive: 1 });
storeItemSchema.index({ isActive: 1 });

export const StoreItemModel = mongoose.model<IStoreItemDocument>('StoreItem', storeItemSchema);
