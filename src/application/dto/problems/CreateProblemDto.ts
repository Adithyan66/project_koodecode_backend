import { CreateTestCaseDto } from "./CreateTestCaseDto";

export interface CreateProblemDto {
    title: string;
    difficulty: 'easy' | 'medium' | 'hard';
    type: 'array' | 'pattern' | 'dsa';
    tags: string[];
    description: string;
    examples: {
        inputs: any;
        expectedOutput: any;
        explanation: string;
        isSample?: boolean;
    }[];
    isActive: boolean;
    functionName: string;
    returnType: string;
    parameters: {
        name: string;
        type: string;
        description?: string;
    }[],
    constraints: {
        parameterName: string;
        type: string;
        minValue?: number;
        maxValue?: number;
        minLength?: number;
        maxLength?: number;
        arrayMinLength?: number;
        arrayMaxLength?: number;
        elementConstraints?: any;
    }[],
    testCases: CreateTestCaseDto[];
    supportedLanguages: number[];
    templates: Record<string, {
        templateCode: string;
        userFunctionSignature: string;
        placeholder: string;
    }>;
    hints?: string[];
    companies?: string[];
}
