
import mongoose, { Schema, Document, Types } from 'mongoose';
import { Room, Participant } from '../../../domain/entities/Room';

// export interface RoomDocument extends Room, Document {}


export interface RoomDocument extends Document {
    _id: Types.ObjectId;
    roomNumber: number;
    roomId: string;
    name: string;
    description: string;
    thumbnail?: string;
    createdBy: Types.ObjectId;
    isPrivate: boolean;
    password?: string;
    scheduledTime?: Date;
    problemNumber?: number;
    status: 'waiting' | 'active' | 'inactive';
    participants: {
        userId: Types.ObjectId;
        username: string;
        joinedAt: Date;
        isOnline: boolean;
        permissions: {
            canEditCode: boolean;
            canDrawWhiteboard: boolean;
            canChangeProblem: boolean;
        };
    }[];
    permissions: {
        canEditCode: Types.ObjectId[];
        canDrawWhiteboard: Types.ObjectId[];
        canChangeProblem: Types.ObjectId[];
    };
    lastActivity: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ParticipantSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: true },
    permissions: {
        canEditCode: { type: Boolean, default: false },
        canDrawWhiteboard: { type: Boolean, default: false },
        canChangeProblem: { type: Boolean, default: false }
    }
});

const RoomPermissionsSchema = new Schema({
    canEditCode: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    canDrawWhiteboard: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    canChangeProblem: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

const RoomSchema = new Schema({
    roomNumber: { type: Number, unique: true, required: true },
    roomId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    thumbnail: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isPrivate: { type: Boolean, default: false },
    password: { type: String },
    scheduledTime: { type: Date },
    problemNumber: { type: Number },
    status: {
        type: String,
        enum: ['waiting', 'active', 'inactive'],
        default: 'inactive'
    },
    participants: [ParticipantSchema],
    permissions: RoomPermissionsSchema,
    lastActivity: { type: Date, default: Date.now }
}, {
    timestamps: true
});

RoomSchema.index({ roomId: 1 });
RoomSchema.index({ roomNumber: 1 });
RoomSchema.index({ createdBy: 1 });
RoomSchema.index({ status: 1 });
RoomSchema.index({ isPrivate: 1 });
RoomSchema.index({ lastActivity: 1 });

export const RoomModel = mongoose.model<RoomDocument>('Room', RoomSchema);
