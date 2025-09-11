

export interface TestCaseResponseDto {
    id: string;
    problemId: string;
    input: any;
    expectedOutput: any;
    isSample: boolean;
    explanation?: string;
    createdAt: Date;
}
