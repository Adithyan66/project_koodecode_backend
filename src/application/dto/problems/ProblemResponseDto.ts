import { Constraint } from "../../../domain/entities/Problem";

export interface ProblemResponseDto {
    id: string;
    problemNumber: number
    title: string;
    slug: string;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
    description: string;
    constraints: Constraint[];
    examples: {
        input: string;
        output: string;
        explanation: string;
        isSample?: boolean;
    }[];
    likes: number;
    totalSubmissions: number;
    acceptedSubmissions: number;
    acceptanceRate: number;
    hints: string[];
    companies: string[];
    isActive: boolean;
    functionName: string,
    returnType: string,
    parameters: {
        name: string;
        type: string;
        description?: string;
    }[],
    createdAt: Date;
    updatedAt: Date;
}

