
// import { IRoomRepository } from '../../../domain/interfaces/repositories/IRoomRepository';
// import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
// import { IProblemRepository } from '../../../domain/interfaces/repositories/IProblemRepository';
// import { RoomListResponseDto } from '../../dto/rooms/RoomListDto';

// export class GetPublicRoomsUseCase {
//   constructor(
//     private roomRepository: IRoomRepository,
//     private userRepository: IUserRepository,
//     private problemRepository: IProblemRepository
//   ) {}

//   async execute(limit: number = 20): Promise<RoomListResponseDto> {
//     try {
//       const rooms = await this.roomRepository.findPublicRooms(limit);
      
//       const roomListData = await Promise.all(
//         rooms.map(async (room) => {
//           // Get creator details
//           const creator = await this.userRepository.findById(room.createdBy);
          
//           // Get problem details if exists
//           let problemTitle = undefined;
//           if (room.problemNumber) {
//             const problem = await this.problemRepository.findByNumber(room.problemNumber);
//             problemTitle = problem?.title;
//           }

//           return {
//             id: room.id,
//             roomNumber: room.roomNumber,
//             roomId: room.roomId,
//             name: room.name,
//             description: room.description,
//             thumbnail: room.thumbnail,
//             creatorName: creator?.username || 'Unknown',
//             participantCount: room.participants.filter(p => p.isOnline).length,
//             isActive: room.status === 'active',
//             problemTitle,
//             createdAt: room.createdAt
//           };
//         })
//       );

//       return {
//         success: true,
//         rooms: roomListData,
//         total: roomListData.length
//       };
//     } catch (error: any) {
//       return { success: false, rooms: [], total: 0 };
//     }
//   }
// }




// src/application/usecases/rooms/GetPublicRoomsUseCase.ts
import { IRoomRepository } from '../../../domain/interfaces/repositories/IRoomRepository';
import { PublicRoomsResponseDto } from '../../dto/rooms/PublicRoomsDto';

export class GetPublicRoomsUseCase {
    constructor(private roomRepository: IRoomRepository) {}

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

            // Validate parameters
            if (page < 1) {
                return { 
                    success: false, 
                    error: 'Page number must be greater than 0',
                    rooms: [],
                    pagination: { currentPage: 1, totalPages: 0, totalItems: 0, hasMore: false }
                };
            }

            if (limit < 1 || limit > 50) {
                return { 
                    success: false, 
                    error: 'Limit must be between 1 and 50',
                    rooms: [],
                    pagination: { currentPage: 1, totalPages: 0, totalItems: 0, hasMore: false }
                };
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
                success: true,
                rooms,
                pagination: {
                    currentPage: result.page,
                    totalPages: result.totalPages,
                    totalItems: result.total,
                    hasMore: result.page < result.totalPages
                }
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                rooms: [],
                pagination: { currentPage: 1, totalPages: 0, totalItems: 0, hasMore: false }
            };
        }
    }
}
