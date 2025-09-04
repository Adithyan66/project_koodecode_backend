

import mongoose, { Schema, Document } from 'mongoose';

export interface IContestSubmissionDocument {
  problemId: mongoose.Types.ObjectId;
  submissionId: mongoose.Types.ObjectId;
  score: number;
  submissionTime: Date;
  attempts: number;
  penalty: number;
  isAccepted: boolean;
}

export interface IContestParticipantDocument extends Document {
  contestId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  registrationTime: Date;
  startTime?: Date;
  submissions: IContestSubmissionDocument[];
  totalScore: number;
  rank?: number;
  penalties: number;
  isActive: boolean;
}

const ContestSubmissionSchema = new Schema<IContestSubmissionDocument>({
  problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
  submissionId: { type: Schema.Types.ObjectId, ref: 'Submission', required: true },
  score: { type: Number, required: true },
  submissionTime: { type: Date, required: true },
  attempts: { type: Number, default: 1 },
  penalty: { type: Number, default: 0 },
  isAccepted: { type: Boolean, default: false }
});

const ContestParticipantSchema = new Schema<IContestParticipantDocument>({
  contestId: { type: Schema.Types.ObjectId, ref: 'Contest', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  registrationTime: { type: Date, default: Date.now },
  startTime: { type: Date },
  submissions: [ContestSubmissionSchema],
  totalScore: { type: Number, default: 0 },
  rank: { type: Number },
  penalties: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

ContestParticipantSchema.index({ contestId: 1, userId: 1 }, { unique: true });
ContestParticipantSchema.index({ contestId: 1, totalScore: -1, penalties: 1 });

export const ContestParticipantModel = mongoose.model<IContestParticipantDocument>('ContestParticipant', ContestParticipantSchema);
