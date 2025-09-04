import mongoose, { Schema, Document } from 'mongoose';

export interface IContestDocument extends Document {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  problems: mongoose.Types.ObjectId[];
  participants: mongoose.Types.ObjectId[];
  isPublic: boolean;
  maxParticipants?: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  rules?: string;
  prizes?: string[];
}

const ContestSchema = new Schema<IContestDocument>({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  duration: { type: Number, required: true },
  problems: [{ type: Schema.Types.ObjectId, ref: 'Problem' }],
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isPublic: { type: Boolean, default: true },
  maxParticipants: { type: Number },
  status: { 
    type: String, 
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  rules: { type: String },
  prizes: [{ type: String }]
}, {
  timestamps: true
});

ContestSchema.index({ status: 1, startTime: 1 });
ContestSchema.index({ createdBy: 1 });
ContestSchema.index({ participants: 1 });

export const ContestModel = mongoose.model<IContestDocument>('Contest', ContestSchema);
