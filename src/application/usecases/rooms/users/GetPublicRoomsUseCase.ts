
import { inject, injectable } from 'tsyringe';
import { IRoomRepository } from '../../../../domain/interfaces/repositories/IRoomRepository';
import { PublicRoomsResponseDto } from '../../../dto/rooms/users/PublicRoomsDto';
import { IGetPublicRoomsUseCase } from '../../../interfaces/IRoomUseCase';
import { BadRequestError } from '../../../errors/AppErrors';


@injectable()
export class GetPublicRoomsUseCase implements IGetPublicRoomsUseCase {

    constructor(
        @inject('IRoomRepository') private roomRepository: IRoomRepository
    ) { }

    async execute(params: {
        status?: 'active' | 'waiting';
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<PublicRoomsResponseDto> {
        try {
            const {
                status,
                page = 1,
                limit = 9,
                search
            } = params;

            if (page < 1) {
                throw new BadRequestError("Page number must be greater than 0")
                // return {
                //     error: 'Page number must be greater than 0',
                //     rooms: [],
                //     pagination: { currentPage: 1, totalPages: 0, totalItems: 0, hasMore: false }
                // };
            }

            if (limit < 1 || limit > 50) {
                throw new BadRequestError("Limit must be between 1 and 50")
                // return {

                //     error: 'Limit must be between 1 and 50',
                //     rooms: [],
                //     pagination: { currentPage: 1, totalPages: 0, totalItems: 0, hasMore: false }
                // };
            }

            const result = await this.roomRepository.findPublicRooms({
                status,
                page,
                limit,
                search
            });


            const rooms = result.rooms.map(room => ({
                id: room.id,
                roomId: room.roomId,
                roomNumber: room.roomNumber,
                name: room.name,
                description: room.description,
                thumbnail: room.thumbnail,
                participantCount: (room as any).participantCount || 0,
                status: room.status,
                scheduledTime: room.scheduledTime,
                createdBy: (room as any).createdBy,
                createdAt: room.createdAt
            }));

            return {
                rooms,
                pagination: {
                    currentPage: result.page,
                    totalPages: result.totalPages,
                    totalItems: result.total,
                    hasMore: result.page < result.totalPages
                }
            };
        } catch (error: any) {
            throw new BadRequestError(error.message)
            // return {
            //     error: error.message,
            //     rooms: [],
            //     pagination: { currentPage: 1, totalPages: 0, totalItems: 0, hasMore: false }
            // };
        }
    }
}
