

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
    passwordHash: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    profilePicUrl: { type: String },
    profilePicKey: { type: String }
}, {
    timestamps: true
});


export const UserModel = model<IUser>('User', UserSchema);
