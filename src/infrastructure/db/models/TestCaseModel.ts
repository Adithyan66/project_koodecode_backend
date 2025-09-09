

import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITestCaseDocument extends Document {
    _id: Types.ObjectId,
    problemId: mongoose.Types.ObjectId;
    inputs: any;
    expectedOutput: any;
    isSample: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const TestCaseSchema = new Schema<ITestCaseDocument>({
    problemId: {
        type: Schema.Types.ObjectId,
        ref: 'Problem',
        required: true,
        // index: true
    },
    inputs: {
        type: Schema.Types.Mixed,
        required: true
    },
    expectedOutput: {
        type: Schema.Types.Mixed,
        required: true
    },
    isSample: {
        type: Boolean,
        required: true,
        default: false,
        // index: true
    },
}, {
    timestamps: true,
    collection: 'testcases'
});

TestCaseSchema.index({ problemId: 1, isSample: 1 });
TestCaseSchema.index({ problemId: 1, createdAt: 1 });

export const TestCaseModel = mongoose.model<ITestCaseDocument>('TestCase', TestCaseSchema);
