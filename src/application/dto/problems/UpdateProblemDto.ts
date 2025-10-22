

export interface UpdateProblemDto {
    title?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    tags?: string[];
    description?: string;
    constraints?: string[];
    examples?: any;
    testCases?: {
        input: any;
        expectedOutput: any;
        isSample: boolean;
        explanation?: string;
    }[];
    hints?: string[];
    companies?: string[];
    isActive?: boolean;
}
