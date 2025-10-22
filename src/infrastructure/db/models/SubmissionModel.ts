


import mongoose, { Schema, Document } from 'mongoose';
import { Submission, TestCaseResult } from '../../../domain/entities/Submission';
export interface SubmissionDocument extends Omit<Submission, 'id'>, Document { }


const TestCaseResultSchema = new Schema({
  testCaseId: { type: String, required: true },
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  actualOutput: { type: String },
  status: {
    type: String,
    enum: ['passed', 'failed', 'error', 'time_limit_exceeded', 'memory_limit_exceeded'],
    required: true
  },
  executionTime: { type: Number, default: 0 },
  memoryUsage: { type: Number, default: 0 },
  judge0Token: { type: String }
});

const SubmissionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
  sourceCode: { type: String, required: true },
  languageId: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'processing', 'accepted', 'rejected', 'error', 'time_limit_exceeded', 'memory_limit_exceeded', 'compilation_error', 'partially_accepted'],
    required: true
  },
  overallVerdict: { type: String, required: true },
  testCaseResults: [TestCaseResultSchema],
  testCasesPassed: { type: Number, default: 0 },
  totalTestCases: { type: Number, required: true },
  score: { type: Number, default: 0 },
  totalExecutionTime: { type: Number, default: 0 },
  maxMemoryUsage: { type: Number, default: 0 },
  submissionType: { type: String, enum: ['problem', 'contest'] }
}, {
  timestamps: true
});

SubmissionSchema.index({ userId: 1, problemId: 1 });
SubmissionSchema.index({ status: 1 });

export const SubmissionModel = mongoose.model<SubmissionDocument>('Submission', SubmissionSchema);
