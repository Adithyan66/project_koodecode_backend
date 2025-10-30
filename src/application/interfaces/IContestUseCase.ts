import { Contest } from "../../domain/entities/Contest";
import { ContestDetailDto } from "../dto/contests/ContestDetailDto";
import { ContestLeaderboardDto } from "../dto/contests/ContestLeaderboardDto";
import { ContestRegistrationResponseDto } from "../dto/contests/ContestRegistrationDto";
import { AssignedProblemDto } from "../dto/contests/ContestResponseDto";
import { ContestSubmissionDto, ContestSubmissionResponseDto } from "../dto/contests/ContestSubmissionDto";
import { CreateContestDto } from "../dto/contests/CreateContestDto";
import { ContestListResponseDto, ContestListType, PaginatedContestListResponse } from "../usecases/contests/user/GetContestsListUseCase";


export interface IRegisterForContestUseCase {
  execute(contestId: string, userId: string): Promise<ContestRegistrationResponseDto>;
}

export interface IStartContestProblemUseCase {
  execute(contestNumber: number, userId: string): Promise<AssignedProblemDto & { timeRemaining: number }>;
}

export interface IGetContestLeaderboardUseCase {
  execute(contestNumber: number, currentUserId?: string): Promise<ContestLeaderboardDto>;
}

export interface IGetContestsListUseCase {
  execute(type: ContestListType, userId: string, page?: number, limit?: number, search?: string): Promise<ContestListResponseDto[] | PaginatedContestListResponse>;
}

export interface IGetContestDetailUseCase {
  execute(contestNumber: number, userId?: string): Promise<ContestDetailDto | null>;
}

export interface ISubmitContestSolutionUseCase {
  execute(dto: ContestSubmissionDto, userId: string): Promise<ContestSubmissionResponseDto>;
}

export interface IDistributeContestRewardsUseCase {
  execute(contestId: string): Promise<{
    distributed: boolean;
    rewardsGiven: number;
    totalParticipants: number;
    reason?: string
  }>;
}

export interface ICreateContestUseCase {
  execute(createContestDto: CreateContestDto, adminUserId: string): Promise<Contest>;
}