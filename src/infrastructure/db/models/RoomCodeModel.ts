
import mongoose, { Schema, Document } from 'mongoose';
import { RoomCode } from '../../../domain/entities/Room';

const RoomCodeSchema = new Schema({
  roomId: { type: String, required: true },
  problemNumber: { type: Number, required: true },
  code: { type: String, required: true },
  language: { type: String, required: true },
  lastModified: { type: Date, default: Date.now },
  lastModifiedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

// Compound index for efficient queries
RoomCodeSchema.index({ roomId: 1, problemNumber: 1 }, { unique: true });

export interface RoomCodeDocument extends RoomCode, Document {}
export const RoomCodeModel = mongoose.model<RoomCodeDocument>('RoomCode', RoomCodeSchema);
