export interface CreateProblemDto {
    title: string;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
    description: string;
    constraints: string[];
    examples: any;
    testCases: {
        input: any;
        expectedOutput: any;
        isSample: boolean;
        explanation?: string;
    }[];
    hints?: string[];
    companies?: string[];
}


// export interface CreateTestCaseDto {
//   input: string;
//   expectedOutput: string;
//   isHidden: boolean;
//   points?: number;
// }

// export interface CreateProblemDto {
//   title: string;
//   description: string;
//   difficulty: 'easy' | 'medium' | 'hard';
//   tags: string[];
//   testCases: CreateTestCaseDto[];
//   timeLimit: number;
//   memoryLimit: number;
// }
