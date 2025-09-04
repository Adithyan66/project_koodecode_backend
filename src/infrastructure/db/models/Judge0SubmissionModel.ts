

import mongoose, { Schema, Document } from 'mongoose';
import { Judge0Submission } from '../../../domain/entities/Judge0Submission';

export interface Judge0SubmissionDocument extends Judge0Submission, Document {}

const Judge0SubmissionSchema = new Schema({
  token: { type: String, required: true, unique: true },
  sourceCode: { type: String, required: true },
  languageId: { type: Number, required: true },
  stdin: { type: String },
  expectedOutput: { type: String },
  status: {
    id: { type: Number, required: true },
    description: { type: String, required: true }
  },
  stdout: { type: String },
  stderr: { type: String },
  compileOutput: { type: String },
  executionTime: { type: Number },
  memoryUsage: { type: Number }
}, {
  timestamps: true
});

Judge0SubmissionSchema.index({ token: 1 });

export const Judge0SubmissionModel = mongoose.model<Judge0SubmissionDocument>('Judge0Submission', Judge0SubmissionSchema);
