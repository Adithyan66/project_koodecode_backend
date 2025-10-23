import { AdminContestListResponseDto, AdminContestListRequestDto, AdminContestDetailDto, UpdateContestDto } from '../dto/contests/AdminContestDto';

export interface IGetAdminActiveContestsUseCase {
  execute(): Promise<AdminContestListResponseDto>;
}

export interface IGetAdminUpcomingContestsUseCase {
  execute(): Promise<AdminContestListResponseDto>;
}

export interface IGetAdminPastContestsUseCase {
  execute(request: AdminContestListRequestDto): Promise<AdminContestListResponseDto>;
}

export interface IGetAdminContestByIdUseCase {
  execute(contestId: string): Promise<AdminContestDetailDto>;
}

export interface IUpdateContestUseCase {
  execute(contestId: string, updateData: UpdateContestDto): Promise<AdminContestDetailDto>;
}

export interface IDeleteContestUseCase {
  execute(contestId: string): Promise<{ success: boolean; message: string }>;
}

