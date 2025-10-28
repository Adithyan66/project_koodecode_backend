import { injectable, inject } from 'tsyringe';
import { IRoomRepository } from '../../../domain/interfaces/repositories/IRoomRepository';
import { IGetAllRoomsForAdminUseCase } from '../../../interfaces/IRoomUseCase';
import { AdminRoomListRequestDto } from '../../../dto/rooms/admin/AdminRoomListRequestDto';
import { AdminRoomListResponseDto } from '../../../dto/rooms/admin/AdminRoomListResponseDto';

@injectable()
export class GetAllRoomsForAdminUseCase implements IGetAllRoomsForAdminUseCase {
  constructor(
    @inject('IRoomRepository') private roomRepository: IRoomRepository
  ) {}

  async execute(request: AdminRoomListRequestDto): Promise<AdminRoomListResponseDto> {
    const { page, limit } = request;

    if (page < 1) {
      throw new Error('Page must be greater than 0');
    }

    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    const result = await this.roomRepository.findAllRoomsForAdmin(request);

    const totalPages = Math.ceil(result.total / limit);

    const response: AdminRoomListResponseDto = {
      rooms: result.rooms,
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };

    return response;
  }
}

