
import mongoose, { Schema, Document, Types } from 'mongoose';
import { RoomActivity } from '../../../domain/entities/RoomActivity';

const RoomActivitySchema = new Schema({
    roomId: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
        type: String,
        enum: ['joined', 'left', 'problem_changed', 'permissions_updated', 'code_updated', 'whiteboard_updated', 'user_kicked', 'user_unkicked', 'message_sent'],
        required: true
    },
    details: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now }
});

RoomActivitySchema.index({ roomId: 1, timestamp: -1 });
RoomActivitySchema.index({ userId: 1, timestamp: -1 });

export interface RoomActivityDocument extends Omit<RoomActivity, "id">, Document {
    _id: Types.ObjectId
}

export const RoomActivityModel = mongoose.model<RoomActivityDocument>('RoomActivity', RoomActivitySchema);
