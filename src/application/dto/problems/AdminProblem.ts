import { Constraint, Example, Parameter, Template } from "../../../domain/entities/Problem";

// DTO-specific interfaces
export interface UserDTO {
    fullName: string;
    email: string;
    userName: string;
    role: string;
}

export interface SubmissionStats {
    totalSubmissions: number;
    acceptedSubmissions: number;
    acceptanceRate: number;
}

export class AdminProblemDetailResponse {
    constructor(
        public problemNumber: number,
        public title: string,
        public slug: string,
        public difficulty: string,
        public tags: string[],
        public description: string,
        public constraints: Constraint[],
        public examples: Example[],
        public hints: string[],
        public companies: string[],
        public isActive: boolean,
        public functionName: string,
        public returnType: string,
        public parameters: Parameter[],
        public supportedLanguages: number[],
        public templates: Record<string, Template>,
        public createdBy: UserDTO,
        public submissionStats: SubmissionStats
    ) {}
}
