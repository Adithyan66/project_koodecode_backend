
import { HTTP_STATUS } from '../../../../shared/constants/httpStatus';
import { IHttpRequest } from '../../interfaces/IHttpRequest';
import { HttpResponse } from '../../helper/HttpResponse';
import { buildResponse } from '../../../../infrastructure/utils/responseBuilder';
import { BadRequestError, UnauthorizedError } from '../../../../application/errors/AppErrors';
import { inject, injectable } from 'tsyringe';
import { IAdminSubmissionController } from '../../interfaces/IAdminSubmissionController';
import { IGetAllSubmissionsForAdminUseCase, IGetSubmissionDetailForAdminUseCase } from '../../../../application/interfaces/ISubmissionUseCase';
import { AdminSubmissionsListRequestDto } from '../../../../application/dto/submissions/admin/AdminSubmissionsListDto';

@injectable()
export class AdminSubmissionController implements IAdminSubmissionController {

  constructor(
    @inject('IGetAllSubmissionsForAdminUseCase') private getAllSubmissionsForAdminUseCase: IGetAllSubmissionsForAdminUseCase,
    @inject('IGetSubmissionDetailForAdminUseCase') private getSubmissionDetailForAdminUseCase: IGetSubmissionDetailForAdminUseCase
  ) {}

  getAllSubmissions = async (httpRequest: IHttpRequest) => {
    if (!httpRequest.user || httpRequest.user.role !== 'admin') {
      throw new UnauthorizedError('Admin access required');
    }

    const {
      page,
      limit,
      status,
      problemId,
      userId,
      submissionType,
      startDate,
      endDate,
      sortBy,
      sortOrder,
      search
    } = httpRequest.query;

    const request: AdminSubmissionsListRequestDto = {
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
      status: status as string,
      problemId: problemId as string,
      userId: userId as string,
      submissionType: submissionType as 'problem' | 'contest',
      startDate: startDate as string,
      endDate: endDate as string,
      sortBy: sortBy as 'createdAt' | 'score' | 'totalExecutionTime' | 'maxMemoryUsage',
      sortOrder: sortOrder as 'asc' | 'desc',
      search: search as string
    };

    if (request.page && request.page < 1) {
      throw new BadRequestError('Page must be greater than 0');
    }

    if (request.limit && (request.limit < 1 || request.limit > 100)) {
      throw new BadRequestError('Limit must be between 1 and 100');
    }

    const validStatuses = ['pending', 'processing', 'accepted', 'rejected', 'error', 'time_limit_exceeded', 'memory_limit_exceeded', 'compilation_error'];
    if (request.status && !validStatuses.includes(request.status)) {
      throw new BadRequestError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    if (request.submissionType && !['problem', 'contest'].includes(request.submissionType)) {
      throw new BadRequestError('Invalid submissionType. Must be problem or contest');
    }

    const validSortFields = ['createdAt', 'score', 'totalExecutionTime', 'maxMemoryUsage'];
    if (request.sortBy && !validSortFields.includes(request.sortBy)) {
      throw new BadRequestError(`Invalid sortBy field. Must be one of: ${validSortFields.join(', ')}`);
    }

    if (request.sortOrder && !['asc', 'desc'].includes(request.sortOrder)) {
      throw new BadRequestError('Invalid sortOrder. Must be asc or desc');
    }

    if (request.startDate && isNaN(Date.parse(request.startDate))) {
      throw new BadRequestError('Invalid startDate format. Must be a valid ISO date string');
    }

    if (request.endDate && isNaN(Date.parse(request.endDate))) {
      throw new BadRequestError('Invalid endDate format. Must be a valid ISO date string');
    }

    const result = await this.getAllSubmissionsForAdminUseCase.execute(request);

    return new HttpResponse(HTTP_STATUS.OK, {
      ...buildResponse(true, 'Submissions retrieved successfully', result),
    });
  };

  getSubmissionDetail = async (httpRequest: IHttpRequest) => {
    if (!httpRequest.user || httpRequest.user.role !== 'admin') {
      throw new UnauthorizedError('Admin access required');
    }

    const { submissionId } = httpRequest.params;

    if (!submissionId) {
      throw new BadRequestError('Submission ID is required');
    }

    const result = await this.getSubmissionDetailForAdminUseCase.execute(submissionId);

    return new HttpResponse(HTTP_STATUS.OK, {
      ...buildResponse(true, 'Submission details retrieved successfully', result),
    });
  };
}

