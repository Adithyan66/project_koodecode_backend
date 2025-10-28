import { inject, injectable } from 'tsyringe';
import { IHttpRequest } from '../../interfaces/IHttpRequest';
import { HttpResponse } from '../../helper/HttpResponse';
import { HTTP_STATUS } from '../../../../shared/constants/httpStatus';
import { buildResponse } from '../../../../infrastructure/utils/responseBuilder';
import { BadRequestError, UnauthorizedError } from '../../../../application/errors/AppErrors';
import { IGetAllRoomsForAdminUseCase } from '../../../../application/interfaces/IRoomUseCase';
import { AdminRoomListRequestDto } from '../../../../application/dto/rooms/admin/AdminRoomListRequestDto';

@injectable()
export class AdminRoomController {
  constructor(
    @inject('IGetAllRoomsForAdminUseCase') private getAllRoomsForAdminUseCase: IGetAllRoomsForAdminUseCase
  ) {}

  getAllRooms = async (httpRequest: IHttpRequest) => {
    if (!httpRequest.user || httpRequest.user.role !== 'admin') {
      throw new UnauthorizedError('Admin access required');
    }

    const page = parseInt(httpRequest.query?.page as string) || 1;
    const limit = parseInt(httpRequest.query?.limit as string) || 10;
    const search = httpRequest.query?.search as string;
    const isPrivate = httpRequest.query?.isPrivate;
    const status = httpRequest.query?.status as 'waiting' | 'active' | 'inactive';
    const sortBy = httpRequest.query?.sortBy as 'createdAt' | 'lastActivity' | 'roomNumber';
    const sortOrder = httpRequest.query?.sortOrder as 'asc' | 'desc';

    if (page < 1) {
      throw new BadRequestError('Page must be greater than 0');
    }

    if (limit < 1 || limit > 100) {
      throw new BadRequestError('Limit must be between 1 and 100');
    }

    if (status && !['waiting', 'active', 'inactive'].includes(status)) {
      throw new BadRequestError('Invalid status value');
    }

    if (sortBy && !['createdAt', 'lastActivity', 'roomNumber'].includes(sortBy)) {
      throw new BadRequestError('Invalid sortBy value');
    }

    if (sortOrder && !['asc', 'desc'].includes(sortOrder)) {
      throw new BadRequestError('Invalid sortOrder value');
    }

    const requestDto: AdminRoomListRequestDto = {
      page,
      limit,
      search,
      isPrivate: isPrivate !== undefined ? isPrivate === 'true' : undefined,
      status,
      sortBy,
      sortOrder
    };

    const result = await this.getAllRoomsForAdminUseCase.execute(requestDto);

    return new HttpResponse(HTTP_STATUS.OK, {
      ...buildResponse(true, 'Rooms retrieved successfully', result)
    });
  };
}

