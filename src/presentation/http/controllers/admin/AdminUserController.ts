import { inject, injectable } from 'tsyringe';
import { IHttpRequest } from '../../interfaces/IHttpRequest';
import { HttpResponse } from '../../helper/HttpResponse';
import { HTTP_STATUS } from '../../../../shared/constants/httpStatus';
import { buildResponse } from '../../../../infrastructure/utils/responseBuilder';
import { BadRequestError, UnauthorizedError } from '../../../../application/errors/AppErrors';
import { IGetAllUsersUseCase, IGetUserDetailForAdminUseCase } from '../../../../application/interfaces/IUserUseCase';
import {  IBlockUserUseCase, IGetUserContestDataUseCase, IGetUserSubmissionDataUseCase, IGetUserFinancialDataUseCase, IGetUserStoreDataUseCase, IGetUserRoomDataUseCase, IResetUserPasswordUseCase } from '../../../../application/interfaces/IUserUseCase';
import { GetAllUsersRequestDto } from '../../../../application/dto/users/admin/GetAllUsersRequestDto';

@injectable()
export class AdminUserController {

  constructor(
    @inject('IGetAllUsersUseCase') private getAllUsersUseCase: IGetAllUsersUseCase,
    @inject('IGetUserDetailForAdminUseCase') private getUserDetailForAdminUseCase: IGetUserDetailForAdminUseCase,
    @inject('IBlockUserUseCase') private blockUserUseCase: IBlockUserUseCase,
    @inject('IGetUserContestDataUseCase') private getUserContestDataUseCase: IGetUserContestDataUseCase,
    @inject('IGetUserSubmissionDataUseCase') private getUserSubmissionDataUseCase: IGetUserSubmissionDataUseCase,
    @inject('IGetUserFinancialDataUseCase') private getUserFinancialDataUseCase: IGetUserFinancialDataUseCase,
    @inject('IGetUserStoreDataUseCase') private getUserStoreDataUseCase: IGetUserStoreDataUseCase,
    @inject('IGetUserRoomDataUseCase') private getUserRoomDataUseCase: IGetUserRoomDataUseCase,
    @inject('IResetUserPasswordUseCase') private resetUserPasswordUseCase: IResetUserPasswordUseCase

  ) {}

  getAllUsers = async (httpRequest: IHttpRequest) => {
  
    if (!httpRequest.user || httpRequest.user.role !== 'admin') {
      throw new UnauthorizedError('Admin access required');
    }

    const page = parseInt(httpRequest.query?.page as string) || 1;
    const limit = parseInt(httpRequest.query?.limit as string) || 10;
    const search = httpRequest.query?.search as string;

    // Validate pagination
    if (page < 1) {
      throw new BadRequestError('Page must be greater than 0');
    }
    if (limit < 1 || limit > 100) {
      throw new BadRequestError('Limit must be between 1 and 100');
    }

    const requestDto: GetAllUsersRequestDto = {
      page,
      limit,
      search
    };

    const result = await this.getAllUsersUseCase.execute(requestDto);

    return new HttpResponse(HTTP_STATUS.OK, {
      ...buildResponse(true, 'Users retrieved successfully', result),
    });
  };

  getUserProfile = async (httpRequest: IHttpRequest) => {

    if (!httpRequest.user || httpRequest.user.role !== 'admin') {
      throw new UnauthorizedError('Admin access required');
    }

    const { userId } = httpRequest.params;

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    const result = await this.getUserDetailForAdminUseCase.execute(userId);

    return new HttpResponse(HTTP_STATUS.OK, {
      ...buildResponse(true, 'User profile retrieved successfully', result),
    });
  };

  blockUser = async (httpRequest: IHttpRequest) => {
    if (!httpRequest.user || httpRequest.user.role !== 'admin') {
      throw new UnauthorizedError('Admin access required');
    }

    const { userId } = httpRequest.params;
    const { isBlocked } = httpRequest.body;

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    if (typeof isBlocked !== 'boolean') {
      throw new BadRequestError('isBlocked must be a boolean value');
    }

    const result = await this.blockUserUseCase.execute(userId, httpRequest.user.userId, isBlocked);

    return new HttpResponse(HTTP_STATUS.OK, {
      ...buildResponse(true, result.message, { userId, isBlocked }),
    });
  };


  getUserContestData = async (httpRequest: IHttpRequest) => {

    if (!httpRequest.user || httpRequest.user.role !== 'admin') {
      throw new UnauthorizedError('Admin access required');
    }

    const { userId } = httpRequest.params;
    const page = parseInt(httpRequest.query?.page as string) || 1;
    const limit = parseInt(httpRequest.query?.limit as string) || 10;

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    if (page < 1) {
      throw new BadRequestError('Page must be greater than 0');
    }
    if (limit < 1 || limit > 100) {
      throw new BadRequestError('Limit must be between 1 and 100');
    }

    const result = await this.getUserContestDataUseCase.execute(userId, page, limit);

    return new HttpResponse(HTTP_STATUS.OK, {
      ...buildResponse(true, 'User contest data retrieved successfully', result),
    });
  };

  getUserSubmissionData = async (httpRequest: IHttpRequest) => {
    if (!httpRequest.user || httpRequest.user.role !== 'admin') {
      throw new UnauthorizedError('Admin access required');
    }

    const { userId } = httpRequest.params;
    const page = parseInt(httpRequest.query?.page as string) || 1;
    const limit = parseInt(httpRequest.query?.limit as string) || 10;

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    if (page < 1) {
      throw new BadRequestError('Page must be greater than 0');
    }
    if (limit < 1 || limit > 100) {
      throw new BadRequestError('Limit must be between 1 and 100');
    }

    const result = await this.getUserSubmissionDataUseCase.execute(userId, page, limit);

    return new HttpResponse(HTTP_STATUS.OK, {
      ...buildResponse(true, 'User submission data retrieved successfully', result),
    });
  };

  getUserFinancialData = async (httpRequest: IHttpRequest) => {
    if (!httpRequest.user || httpRequest.user.role !== 'admin') {
      throw new UnauthorizedError('Admin access required');
    }

    const { userId } = httpRequest.params;
    const coinPage = parseInt(httpRequest.query?.coinPage as string) || 1;
    const coinLimit = parseInt(httpRequest.query?.coinLimit as string) || 10;
    const paymentPage = parseInt(httpRequest.query?.paymentPage as string) || 1;
    const paymentLimit = parseInt(httpRequest.query?.paymentLimit as string) || 10;

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    // Validate pagination parameters
    if (coinPage < 1 || paymentPage < 1) {
      throw new BadRequestError('Page must be greater than 0');
    }
    if (coinLimit < 1 || coinLimit > 100) {
      throw new BadRequestError('Coin limit must be between 1 and 100');
    }
    if (paymentLimit < 1 || paymentLimit > 100) {
      throw new BadRequestError('Payment limit must be between 1 and 100');
    }

    const result = await this.getUserFinancialDataUseCase.execute(
      userId, 
      coinPage, 
      coinLimit, 
      paymentPage, 
      paymentLimit
    );

    return new HttpResponse(HTTP_STATUS.OK, {
      ...buildResponse(true, 'User financial data retrieved successfully', result),
    });
  };

  getUserStoreData = async (httpRequest: IHttpRequest) => {
    if (!httpRequest.user || httpRequest.user.role !== 'admin') {
      throw new UnauthorizedError('Admin access required');
    }

    const { userId } = httpRequest.params;

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    const result = await this.getUserStoreDataUseCase.execute(userId);

    return new HttpResponse(HTTP_STATUS.OK, {
      ...buildResponse(true, 'User store data retrieved successfully', result),
    });
  };

  getUserRoomData = async (httpRequest: IHttpRequest) => {
    if (!httpRequest.user || httpRequest.user.role !== 'admin') {
      throw new UnauthorizedError('Admin access required');
    }

    const { userId } = httpRequest.params;
    const page = parseInt(httpRequest.query?.page as string) || 1;
    const limit = parseInt(httpRequest.query?.limit as string) || 10;

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    if (page < 1) {
      throw new BadRequestError('Page must be greater than 0');
    }
    if (limit < 1 || limit > 100) {
      throw new BadRequestError('Limit must be between 1 and 100');
    }

    const result = await this.getUserRoomDataUseCase.execute(userId, page, limit);

    return new HttpResponse(HTTP_STATUS.OK, {
      ...buildResponse(true, 'User room data retrieved successfully', result),
    });
  };

  resetUserPassword = async (httpRequest: IHttpRequest) => {
    if (!httpRequest.user || httpRequest.user.role !== 'admin') {
      throw new UnauthorizedError('Admin access required');
    }

    const { userId } = httpRequest.params;

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    const result = await this.resetUserPasswordUseCase.execute(userId);

    return new HttpResponse(HTTP_STATUS.OK, {
      ...buildResponse(true, result.message),
    });
  };
}
