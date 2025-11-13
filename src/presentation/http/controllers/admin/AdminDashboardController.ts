import { inject, injectable } from 'tsyringe';
import { IHttpRequest } from '../../interfaces/IHttpRequest';
import { HttpResponse } from '../../helper/HttpResponse';
import { HTTP_STATUS } from '../../../../shared/constants/httpStatus';
import { buildResponse } from '../../../../infrastructure/utils/responseBuilder';
import { UnauthorizedError } from '../../../../application/errors/AppErrors';
import { IAdminDashboardStatsService } from '../../../../application/interfaces/IAdminDashboardStatsService';

@injectable()
export class AdminDashboardController {
  constructor(
    @inject('IAdminDashboardStatsService') private adminDashboardStatsService: IAdminDashboardStatsService
  ) {}

  getDashboard = async (httpRequest: IHttpRequest) => {
    if (!httpRequest.user || httpRequest.user.role !== 'admin') {
      throw new UnauthorizedError('Admin access required');
    }

    const dashboard = await this.adminDashboardStatsService.getDashboard();

    return new HttpResponse(HTTP_STATUS.OK, {
      ...buildResponse(true, 'Dashboard data retrieved successfully', dashboard)
    });
  };
}

