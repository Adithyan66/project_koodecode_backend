import { Schema, model, Document, Types } from 'mongoose';

export interface IUserConnection extends Document {
    followerId: Types.ObjectId;
    followingId: Types.ObjectId;
    status: 'active' | 'blocked' | 'pending';
    createdAt: Date;
}

const UserConnectionSchema = new Schema<IUserConnection>({
    followerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    followingId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { 
        type: String, 
        enum: ['active', 'blocked', 'pending'], 
        default: 'active' 
    }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

// Compound indexes
UserConnectionSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
UserConnectionSchema.index({ followingId: 1, status: 1 });
UserConnectionSchema.index({ followerId: 1, status: 1 });

export const UserConnectionModel = model<IUserConnection>('UserConnection', UserConnectionSchema);
