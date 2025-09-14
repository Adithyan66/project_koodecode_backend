

import mongoose, { Schema, Document } from 'mongoose';
import { ContestParticipant, ContestSubmission, ParticipantStatus } from '../../../domain/entities/ContestParticipant';

export interface ContestParticipantDocument extends ContestParticipant, Document {
  _id: string;
}

const ContestSubmissionSchema = new Schema<ContestSubmission>({
  submissionId: { type: Schema.Types.ObjectId, ref: 'Submission', required: true },
  submittedAt: { type: Date, required: true },
  isCorrect: { type: Boolean, required: true },
  timeTaken: { type: Number, required: true },
  attemptNumber: { type: Number, required: true },
  penaltyApplied: { type: Number, required: true }
});

const ContestParticipantSchema = new Schema<ContestParticipantDocument>({
  contestId: { type: Schema.Types.ObjectId, ref: 'Contest', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignedProblemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
  registrationTime: { type: Date, required: true },
  startTime: { type: Date },
  endTime: { type: Date },
  submissions: [ContestSubmissionSchema],
  totalScore: { type: Number, default: 0 },
  rank: { type: Number },
  coinsEarned: { type: Number, default: 0 },
  status: { type: String, enum: Object.values(ParticipantStatus), default: ParticipantStatus.REGISTERED },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ContestParticipantSchema.index({ contestId: 1, userId: 1 }, { unique: true });
ContestParticipantSchema.index({ contestId: 1, totalScore: -1, timeTaken: 1 });

export const ContestParticipantModel = mongoose.model<ContestParticipantDocument>('ContestParticipant', ContestParticipantSchema);
