

import { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
    _id: Types.ObjectId;
    fullName: string;
    email: string;
    userName: string;
    passwordHash: string;
    role: string;
    profilePicUrl?: string;
    profilePicKey?: String;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    userName: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    profilePicUrl: { type: String },
    profilePicKey: { type: String }
}, {
    timestamps: true
});


UserSchema.index({ email: 1 });
UserSchema.index({ userName: 1 });

export const UserModel = model<IUser>('User', UserSchema);
