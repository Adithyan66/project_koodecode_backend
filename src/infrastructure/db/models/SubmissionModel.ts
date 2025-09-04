

// // import mongoose, { Schema, Document } from 'mongoose';

// // export interface ISubmissionModel extends Document {
// //     problemId: string;
// //     userId: string;
// //     code: string;
// //     language: string;
// //     status: 'pending' | 'running' | 'accepted' | 'rejected' | 'error';
// //     testResults: {
// //         testCaseId: string;
// //         input: any;
// //         expectedOutput: any;
// //         actualOutput?: any;
// //         passed: boolean;
// //         executionTime?: number;
// //         memoryUsage?: number;
// //         error?: string;
// //     }[];
// //     executionTime?: number;
// //     memoryUsage?: number;
// //     createdAt: Date;
// //     submittedAt?: Date;
// // }

// // const SubmissionSchema: Schema = new Schema({
// //     problemId: { type: String, required: true, ref: 'Problem' },
// //     userId: { type: String, required: true, ref: 'User' },
// //     code: { type: String, required: true },
// //     language: { type: String, required: true },
// //     status: { 
// //         type: String, 
// //         enum: ['pending', 'running', 'accepted', 'rejected', 'error'], 
// //         default: 'pending' 
// //     },
// //     testResults: [{
// //         testCaseId: { type: String, required: true },
// //         input: { type: Schema.Types.Mixed, required: true },
// //         expectedOutput: { type: Schema.Types.Mixed, required: true },
// //         actualOutput: { type: Schema.Types.Mixed },
// //         passed: { type: Boolean, required: true },
// //         executionTime: { type: Number },
// //         memoryUsage: { type: Number },
// //         error: { type: String }
// //     }],
// //     executionTime: { type: Number },
// //     memoryUsage: { type: Number },
// //     submittedAt: { type: Date }
// // }, {
// //     timestamps: true
// // });

// // SubmissionSchema.index({ problemId: 1, userId: 1 });
// // SubmissionSchema.index({ userId: 1, createdAt: -1 });
// // SubmissionSchema.index({ status: 1 });

// // export default mongoose.model<ISubmissionModel>('Submission', SubmissionSchema);




// import mongoose, { Schema, Document } from 'mongoose';
// import { Submission } from '../../../domain/entities/Submission';

// export interface SubmissionDocument extends Submission, Document {}

// const SubmissionSchema = new Schema({
//   userId: { type: String, required: true },
//   problemId: { type: String, required: true },
//   sourceCode: { type: String, required: true },
//   languageId: { type: Number, required: true },
//   status: { 
//     type: String, 
//     enum: ['pending', 'processing', 'accepted', 'rejected', 'error', 'time_limit_exceeded', 'memory_limit_exceeded', 'compilation_error'],
//     required: true 
//   },
//   executionTime: { type: Number },
//   memoryUsage: { type: Number },
//   output: { type: String },
//   expectedOutput: { type: String, required: true },
//   judge0Token: { type: String },
//   judge0Status: {
//     id: { type: Number },
//     description: { type: String }
//   },
//   testCasesPassed: { type: Number },
//   totalTestCases: { type: Number },
//   verdict: { type: String }
// }, {
//   timestamps: true
// });

// SubmissionSchema.index({ userId: 1, problemId: 1 });
// SubmissionSchema.index({ judge0Token: 1 });
// SubmissionSchema.index({ status: 1 });

// export const SubmissionModel = mongoose.model<SubmissionDocument>('Submission', SubmissionSchema);










import mongoose, { Schema, Document } from 'mongoose';
import { Submission, TestCaseResult } from '../../../domain/entities/Submission';

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
  userId: { type: String, required: true },
  problemId: { type: String, required: true },
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
  maxMemoryUsage: { type: Number, default: 0 }
}, {
  timestamps: true
});

SubmissionSchema.index({ userId: 1, problemId: 1 });
SubmissionSchema.index({ status: 1 });

export interface SubmissionDocument extends Submission, Document {}
export const SubmissionModel = mongoose.model<SubmissionDocument>('Submission', SubmissionSchema);
