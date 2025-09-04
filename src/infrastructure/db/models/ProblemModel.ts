import mongoose, { Schema, Document } from 'mongoose';

export interface IProblemModel extends Document {
    problemNumber: number;
    title: string;
    slug: string;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
    description: string;
    constraints: string[];
    examples: {
        input: string;
        output: string;
        explanation: string;
        isSample?: boolean;
    }[];
    testCases: {
        input: any;
        expectedOutput: any;
        isSample: boolean;
        explanation?: string;
        createdAt: Date;
    }[];
    likes: string[];
    totalSubmissions: number;
    acceptedSubmissions: number;
    hints: string[];
    companies: string[];
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;

    starterCode: {
        [language: string]: string; 
    };
    functionName: string; 
    returnType: string; 
    parameters: {
        name: string;
        type: string;
        description?: string;
    }[];
    solutionTemplate: {
        [language: string]: string; 
    };
    editorial?: {
        approach: string;
        complexity: {
            time: string;
            space: string;
        };
        code: {
            [language: string]: string;
        };
    };
    relatedTopics: string[]; 
    followUp?: string[]; 
}

const ProblemSchema: Schema = new Schema({
    problemNumber: { type: Number, unique: true ,required:true},
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    tags: [{ type: String }],
    description: { type: String, required: true },
    constraints: [{ type: String }],
    examples: { type: Schema.Types.Mixed, required: true },
    testCases: [{
        input: { type: Schema.Types.Mixed, required: true },
        expectedOutput: { type: Schema.Types.Mixed, required: true },
        isSample: { type: Boolean, required: true },
        explanation: { type: String },
        createdAt: { type: Date, default: Date.now }
    }],
    likes: [{ type: String }],
    totalSubmissions: { type: Number, default: 0 },
    acceptedSubmissions: { type: Number, default: 0 },
    hints: [{ type: String }],
    companies: [{ type: String }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: String, required: true }
}, {
    timestamps: true
});

ProblemSchema.index({ slug: 1 });
ProblemSchema.index({ difficulty: 1 });
ProblemSchema.index({ tags: 1 });
ProblemSchema.index({ isActive: 1 });

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
