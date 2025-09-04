export interface ProblemDetailDto {
    id: string;
    title: string;
    slug: string;
    difficulty: string;
    tags: string[];
    description: string;
    constraints: string[];
    examples: any;
    starterCode: { [language: string]: string };
    functionName: string;
    parameters: ParameterDto[];
    sampleTestCases: TestCaseDto[];
    hints: string[];
    companies: string[];
    stats: {
        totalSubmissions: number;
        acceptedSubmissions: number;
        acceptanceRate: number;
    };
    relatedTopics: string[];
}

interface ParameterDto {
    name: string;
    type: string;
    description?: string;
}

interface TestCaseDto {
    id: string;
    input: any;
    expectedOutput: any;
    explanation?: string;
}
