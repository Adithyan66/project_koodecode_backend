
import mongoose, { Schema, Document, Types } from 'mongoose';
import { Room, Participant } from '../../../domain/entities/Room';

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
    
    maxParticipants?: number;
    duration?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    config?: {
        allowGuestJoins?: boolean;
        autoStart?: boolean;
        showLeaderboard?: boolean;
        recordSession?: boolean;
        maxCodeLength?: number;
        allowedLanguages?: number[];
        enableChat?: boolean;
        enableVoice?: boolean;
        enableVideo?: boolean;
        [key: string]: any;
    };
    sessionStartTime?: Date;
    sessionEndTime?: Date;
    
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
    kickedUsers: Types.ObjectId[];
    submissions?: {
        submissionId: Types.ObjectId;
        userId: Types.ObjectId;
        submittedAt: Date;
        problemId?: Types.ObjectId;
        score?: number;
    }[];
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

const SubmissionDetailSchema = new Schema({
    submissionId: { type: Schema.Types.ObjectId, ref: 'Submission', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    submittedAt: { type: Date, default: Date.now },
    problemId: { type: Schema.Types.ObjectId, ref: 'Problem' },
    score: { type: Number }
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
    
    maxParticipants: { type: Number },
    duration: { type: Number },
    difficulty: { 
        type: String, 
        enum: ['easy', 'medium', 'hard']
    },
    config: {
        type: Schema.Types.Mixed,
        default: {}
    },
    sessionStartTime: { type: Date },
    sessionEndTime: { type: Date },
    
    problemNumber: { type: Number },
    status: {
        type: String,
        enum: ['waiting', 'active', 'inactive'],
        default: 'inactive'
    },
    participants: [ParticipantSchema],
    permissions: RoomPermissionsSchema,
    kickedUsers: {
        type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        default: []
    },
    submissions: [SubmissionDetailSchema],
    lastActivity: { type: Date, default: Date.now }
}, {
    timestamps: true
});


RoomSchema.index({ createdBy: 1 });
RoomSchema.index({ status: 1 });
RoomSchema.index({ isPrivate: 1 });
RoomSchema.index({ lastActivity: 1 });
RoomSchema.index({ difficulty: 1 });
RoomSchema.index({ sessionStartTime: 1 });

export const RoomModel = mongoose.model<RoomDocument>('Room', RoomSchema);
