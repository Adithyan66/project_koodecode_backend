import { inject, injectable } from 'tsyringe';
import { IHttpRequest } from '../../interfaces/IHttpRequest';
import { HttpResponse } from '../../helper/HttpResponse';
import { HTTP_STATUS } from '../../../../shared/constants/httpStatus';
import { buildResponse } from '../../../../infrastructure/utils/responseBuilder';
import { BadRequestError, UnauthorizedError } from '../../../../application/errors/AppErrors';
import { IGetAllUsersUseCase, IGetUserProfileUseCase, IBlockUserUseCase } from '../../../../application/interfaces/IUserUseCase';
import { GetAllUsersRequestDto } from '../../../../application/dto/users/admin/GetAllUsersRequestDto';

@injectable()
export class AdminUserController {

  constructor(
    @inject('IGetAllUsersUseCase') private getAllUsersUseCase: IGetAllUsersUseCase,
    @inject('IGetUserProfileUseCase') private getUserProfileUseCase: IGetUserProfileUseCase,
    @inject('IBlockUserUseCase') private blockUserUseCase: IBlockUserUseCase
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

    const result = await this.getUserProfileUseCase.execute(userId);

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
}
