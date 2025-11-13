

import { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
    _id: Types.ObjectId;
    fullName: string;
    email: string;
    userName: string;
    fps: string;
    passwordHash: string;
    role: string;
    profilePicUrl?: string;
    profilePicKey?: string;
    provider: 'email' | 'google' | 'github';
    googleId?: string;
    githubId?: string;
    emailVerified: boolean;
    isBlocked: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    userName: { type: String, required: true, unique: true },
    fps: { type: String },
    passwordHash: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    profilePicUrl: { type: String },
    profilePicKey: { type: String },
    provider: { type: String, enum: ['email', 'google', 'github'], default: 'email' },
    googleId: { type: String },
    githubId: { type: String },
    emailVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false }
}, {
    timestamps: true
});

export const UserModel = model<IUser>('User', UserSchema);
