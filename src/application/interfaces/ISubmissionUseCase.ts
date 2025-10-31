
import { AdminSubmissionsListRequestDto, AdminSubmissionsListResponseDto } from '../dto/submissions/admin/AdminSubmissionsListDto';
import { AdminSubmissionDetailDto } from '../dto/submissions/admin/AdminSubmissionDetailDto';

export interface IGetAllSubmissionsForAdminUseCase {
  execute(request: AdminSubmissionsListRequestDto): Promise<AdminSubmissionsListResponseDto>;
}

export interface IGetSubmissionDetailForAdminUseCase {
  execute(submissionId: string): Promise<AdminSubmissionDetailDto>;
}

