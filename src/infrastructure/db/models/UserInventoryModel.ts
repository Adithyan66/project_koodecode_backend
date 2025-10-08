import mongoose, { Schema, Document } from 'mongoose';

interface IUserInventoryDocument extends Document {
    userId: string;
    itemId: string;
    quantity: number;
    purchasedAt: Date;
    lastUsedAt?: Date;
}

const userInventorySchema = new Schema<IUserInventoryDocument>({
    userId: { type: String, required: true, ref: 'User' },
    itemId: { type: String, required: true, ref: 'StoreItem' },
    quantity: { type: Number, required: true, min: 0, default: 1 },
    purchasedAt: { type: Date, default: Date.now },
    lastUsedAt: { type: Date }
}, {
    timestamps: false,
    collection: 'userinventory'
});

userInventorySchema.index({ userId: 1 });
userInventorySchema.index({ userId: 1, itemId: 1 }, { unique: true });

export const UserInventoryModel = mongoose.model<IUserInventoryDocument>('UserInventory', userInventorySchema);
