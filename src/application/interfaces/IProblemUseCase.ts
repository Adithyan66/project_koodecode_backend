


import { Judge0Language } from "../../domain/entities/Judge0Submission";
import { Problem } from "../../domain/entities/Problem";
import { AdminProblemDetailResponse } from "../dto/problems/AdminProblem";
import { AdminProblemsListRequestDto, AdminProblemsListResponseDto } from "../dto/problems/AdminProblemListDto";
import { CreateProblemDto } from "../dto/problems/CreateProblemDto";
import { ProblemListResponseDto } from "../dto/problems/ProblemListDto";
import { ProblemNamesRequestDto, ProblemNamesResponseDto } from "../dto/problems/ProblemNamesDto";
import { ProblemResponseDto } from "../dto/problems/ProblemResponseDto";
import { UpdateProblemPayload } from "../dto/problems/UpdateProblemDto";
import { ExecuteCodeDto } from "../dto/submissions/ExecuteCodeDto";
import { RunCodeDto, RunCodeResponseDto } from "../dto/submissions/RunCodeDto";
import { SubmissionResponseDto } from "../dto/submissions/SubmissionResponseDto";
import { ListPageDataResponseDto } from "../dto/problems/users/ListPageDataDto";
import { ProblemListApiResponseDto, ProblemListQueryDto } from "../dto/problems/users/ProblemListQueryDto";
import { SubmissionHistoryResponseDto } from "../dto/submissions/SubmissionHistoryResponseDto";

export interface IGetProblemsListUseCase {
  execute(userId: string, filters?: {
    difficulty?: 'Easy' | 'Med.' | 'Hard' | 'all';
    type?: 'array' | 'pattern' | 'dsa' | 'all';
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: 'none' | 'acceptance-asc' | 'acceptance-desc';
  }): Promise<ProblemListApiResponseDto>;
}

export interface IGetProblemByIdUseCase {
  execute(slug: string, userId: string): Promise<ProblemResponseDto>;
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

export interface IDeleteProblemUseCase {
  execute(slug: string, adminId: string): Promise<void>;
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

export interface IGetListPageDataUseCase {
  execute(userId: string): Promise<ListPageDataResponseDto>;
}

export interface IGetUserSubmissionHistoryUseCase {
  execute(userId: string, problemId: string, page: number, limit: number): Promise<SubmissionHistoryResponseDto>;
}