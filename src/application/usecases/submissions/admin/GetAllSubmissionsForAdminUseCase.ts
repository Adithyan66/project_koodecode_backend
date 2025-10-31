import { inject, injectable } from 'tsyringe';
import { ISubmissionRepository, AdminSubmissionFilters, AdminSubmissionPagination, AdminSubmissionSort } from '../../../../domain/interfaces/repositories/ISubmissionRepository';
import { IGetAllSubmissionsForAdminUseCase } from '../../../interfaces/ISubmissionUseCase';
import { AdminSubmissionsListRequestDto, AdminSubmissionsListResponseDto, AdminSubmissionListItemDto } from '../../../dto/submissions/admin/AdminSubmissionsListDto';
import { ProgrammingLanguage } from '../../../../domain/value-objects/ProgrammingLanguage';

@injectable()
export class GetAllSubmissionsForAdminUseCase implements IGetAllSubmissionsForAdminUseCase {

  constructor(
    @inject('ISubmissionRepository') private submissionRepository: ISubmissionRepository
  ) {}

  async execute(request: AdminSubmissionsListRequestDto): Promise<AdminSubmissionsListResponseDto> {
    const page = request.page || 1;
    const limit = request.limit || 20;

    const filters: AdminSubmissionFilters = {
      status: request.status,
      problemId: request.problemId,
      userId: request.userId,
      submissionType: request.submissionType,
      startDate: request.startDate ? new Date(request.startDate) : undefined,
      endDate: request.endDate ? new Date(request.endDate) : undefined,
      search: request.search
    };

    const sort: AdminSubmissionSort = {
      sortBy: request.sortBy || 'createdAt',
      sortOrder: request.sortOrder || 'desc'
    };

    const pagination: AdminSubmissionPagination = {
      page,
      limit
    };

    const result = await this.submissionRepository.findAllForAdmin(filters, pagination, sort);

    const submissions: AdminSubmissionListItemDto[] = result.submissions.map((sub: any) => {
      const languageInfo = ProgrammingLanguage.getLanguageInfo(sub.languageId);
      const languageName = languageInfo ? languageInfo.name : `Language ${sub.languageId}`;

      return {
        id: sub._id.toString(),
        user: {
          id: sub.userId?._id?.toString() || sub.userId?.toString() || '',
          username: sub.userId?.username,
          email: sub.userId?.email
        },
        problem: {
          id: sub.problemId?._id?.toString() || sub.problemId?.toString() || '',
          title: sub.problemId?.title,
          slug: sub.problemId?.slug
        },
        sourceCode: sub.sourceCode,
        language: {
          id: sub.languageId,
          name: languageName
        },
        status: sub.status,
        score: sub.score || 0,
        totalExecutionTime: sub.totalExecutionTime || 0,
        maxMemoryUsage: sub.maxMemoryUsage || 0,
        submissionType: sub.submissionType,
        testCasesPassed: sub.testCasesPassed || 0,
        totalTestCases: sub.totalTestCases || 0,
        createdAt: sub.createdAt
      };
    });

    const acceptedCount = result.submissions.filter((s: any) => s.status === 'accepted').length;
    const rejectedCount = result.submissions.filter((s: any) => 
      s.status !== 'accepted' && s.status !== 'pending' && s.status !== 'processing'
    ).length;
    const pendingCount = result.submissions.filter((s: any) => 
      s.status === 'pending' || s.status === 'processing'
    ).length;
    const problemSubmissionsCount = result.submissions.filter((s: any) => s.submissionType === 'problem').length;
    const contestSubmissionsCount = result.submissions.filter((s: any) => s.submissionType === 'contest').length;

    const totalPages = Math.ceil(result.total / limit);

    return {
      submissions,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: result.total,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      },
      summary: {
        totalSubmissions: result.total,
        acceptedCount,
        rejectedCount,
        pendingCount,
        problemSubmissionsCount,
        contestSubmissionsCount
      },
      filters: {
        status: request.status,
        problemId: request.problemId,
        userId: request.userId,
        submissionType: request.submissionType,
        startDate: request.startDate,
        endDate: request.endDate,
        search: request.search
      }
    };
  }
}

