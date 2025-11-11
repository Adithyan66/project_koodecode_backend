






import mongoose, { Schema, Document } from 'mongoose';

export interface IProblemModel extends Document {
    problemNumber: number;
    title: string;
    slug: string;
    difficulty: 'easy' | 'medium' | 'hard';
    type: 'array' | 'pattern' | 'dsa';
    tags: string[];
    description: string;
    constraints: {
        parameterName: string;
        type: string;
        minValue?: number;
        maxValue?: number;
        minLength?: number;
        maxLength?: number;
    }[];
    examples: {
        input: string;
        output: string;
        explanation: string;
        isSample?: boolean;
    }[];
    likes: string[];
    totalSubmissions: number;
    acceptedSubmissions: number;
    uniqueSolvers: number;
    averageSolveTime: number;
    difficultyRating: number;
    lastSolvedAt?: Date;
    hints: string[];
    companies: string[];
    isActive: boolean;
    isDeleted: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    functionName: string;
    returnType: string;
    parameters: {
        name: string;
        type: string;
        description?: string;
    }[];

    supportedLanguages: number[];
    templates: {
        [languageId: string]: {
            templateCode: string;
            userFunctionSignature: string;
            placeholder: string;
        };
    };

}








const ProblemSchema: Schema = new Schema({
    problemNumber: { type: Number, unique: true, required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    type: { type: String, enum: ['array', 'pattern', 'dsa'], required: true },
    tags: [{ type: String }],
    description: { type: String, required: true },
    constraints: [
        {
            parameterName: { type: String, required: true },
            type: { type: String, required: true },
            minLength: { type: Number },
            maxLength: { type: Number },
            minValue: { type: Number },
            maxValue: { type: Number }
        }
    ],
    examples: { type: Schema.Types.Mixed, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    totalSubmissions: { type: Number, default: 0 },
    acceptedSubmissions: { type: Number, default: 0 },
    uniqueSolvers: { type: Number, default: 0 },
    averageSolveTime: { type: Number, default: 0 },
    difficultyRating: { type: Number, default: 0 },
    lastSolvedAt: { type: Date },
    hints: [{ type: String }],
    companies: [{ type: String }],
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    functionName: { type: String, required: true },
    returnType: { type: String, required: true },
    parameters: [{
        name: { type: String },
        type: { type: String },
        description: { type: String }
    }],
    supportedLanguages: [{ type: Number, required: true }],
    templates: {
        type: Object,
        of: {
            templateCode: { type: String, required: true },
            userFunctionSignature: { type: String, required: true },
            placeholder: { type: String, required: true }
        },
        required: true
    }
}, {
    timestamps: true
});


ProblemSchema.index({ difficulty: 1 });
ProblemSchema.index({ tags: 1 });
ProblemSchema.index({ isActive: 1 });
ProblemSchema.index({ supportedLanguages: 1 });
ProblemSchema.index({ type: 1 });

ProblemSchema.index({
    title: "text",
    description: "text"
}, {
    weights: {
        title: 10,
        description: 1
    }
});

export default mongoose.model<IProblemModel>('Problem', ProblemSchema);
