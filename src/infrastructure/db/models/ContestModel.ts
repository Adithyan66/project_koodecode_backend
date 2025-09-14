

import mongoose, { Schema, Document } from 'mongoose';
import { Contest, ContestState, ContestReward } from '../../../domain/entities/Contest';

export interface ContestDocument extends Omit<Contest, 'id'>, Document {
  _id: string;
}

const ContestRewardSchema = new Schema<ContestReward>({
  rank: { type: Number, required: true },
  coins: { type: Number, required: true }
});

const ContestSchema = new Schema<ContestDocument>({
  contestNumber: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  createdBy: { type: String, required: true },
  problems: [{ type: Schema.Types.ObjectId, ref: 'Problem', required: true }],
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  thumbnail: { type: String, required: true },
  registrationDeadline: { type: Date, required: true },
  problemTimeLimit: { type: Number, required: true },
  maxAttempts: { type: Number, required: true },
  wrongSubmissionPenalty: { type: Number, required: true },
  coinRewards: [ContestRewardSchema],
  state: { type: String, enum: Object.values(ContestState), default: ContestState.UPCOMING },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ContestSchema.index({ contestNumber: 1 });
ContestSchema.index({ state: 1 });
ContestSchema.index({ startTime: 1 });

export const ContestModel = mongoose.model<ContestDocument>('Contest', ContestSchema);
