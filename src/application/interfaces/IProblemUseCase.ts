


import { Judge0Language } from "../../domain/entities/Judge0Submission";
import { Problem } from "../../domain/entities/Problem";
import { AdminProblemDetailResponse } from "../dto/problems/AdminProblem";
import { AdminProblemsListRequestDto, AdminProblemsListResponseDto } from "../dto/problems/AdminProblemListDto";
import { CreateProblemDto } from "../dto/problems/CreateProblemDto";
import { ProblemListResponseDto } from "../dto/problems/ProblemListDto";
import { ProblemNamesRequestDto, ProblemNamesResponseDto } from "../dto/problems/ProblemNamesDto";
import { ProblemResponseDto } from "../dto/problems/ProblemResponseDto";
import { ExecuteCodeDto } from "../dto/submissions/ExecuteCodeDto";
import { RunCodeDto, RunCodeResponseDto } from "../dto/submissions/RunCodeDto";
import { SubmissionResponseDto } from "../dto/submissions/SubmissionResponseDto";

export interface IGetProblemsListUseCase {
  execute(filters?: {
    difficulty?: 'easy' | 'medium' | 'hard';
    search?: string;
    page?: number;
    limit?: number;
    tags?: string[];
    languageId?: number;
    status?: "Draft" | "Published";
    isActive?: boolean;
  }): Promise<ProblemListResponseDto>;
}

export interface IGetProblemByIdUseCase {
  execute(slug: string): Promise<ProblemResponseDto>;
}

export interface ICreateSubmissionUseCase {
  execute(params: ExecuteCodeDto): Promise<SubmissionResponseDto>;
}

export interface IGetSubmissionResultUseCase {
  execute(submissionId: string): Promise<SubmissionResponseDto>;
}

export interface IRunCodeUseCase {
  execute(params: RunCodeDto): Promise<RunCodeResponseDto>;
}

export interface IGetLanguagesUseCase {
  execute(): Promise<Judge0Language[]>;
}

export interface IGetProblemNamesUseCase {
  execute(request: ProblemNamesRequestDto): Promise<ProblemNamesResponseDto>;
}

export interface ICreateProblemUseCase {
  execute(data: CreateProblemDto, adminId: string): Promise<Problem>;
}

export interface IUpdateProblemUseCase {
  execute(slug: string, updateData: UpdateProblemPayload, adminId: string): Promise<AdminProblemDetailResponse>;
}


export interface IGetAllProblemsForAdminUseCase {
  execute(request: AdminProblemsListRequestDto): Promise<AdminProblemsListResponseDto>;
}

export interface IGetAllProgrammingLanguages {
  execute(): Promise<any>
}

export interface IGetProblemDetailForAdminUseCase {
  execute(problemId: string): Promise<AdminProblemDetailResponse>;
}