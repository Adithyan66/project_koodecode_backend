export interface ProblemResponseDto {
    id: string;
    problemNumber: number
    title: string;
    slug: string;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
    description: string;
    constraints: string[];
    examples: any;
    likes: number;
    totalSubmissions: number;
    acceptedSubmissions: number;
    acceptanceRate: number;
    hints: string[];
    companies: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
