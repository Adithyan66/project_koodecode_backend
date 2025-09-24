
import { IRoomRepository } from '../../../domain/interfaces/repositories/IRoomRepository';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { IProblemRepository } from '../../../domain/interfaces/repositories/IProblemRepository';
import { RoomListResponseDto } from '../../dto/rooms/RoomListDto';

export class GetPublicRoomsUseCase {
  constructor(
    private roomRepository: IRoomRepository,
    private userRepository: IUserRepository,
    private problemRepository: IProblemRepository
  ) {}

  async execute(limit: number = 20): Promise<RoomListResponseDto> {
    try {
      const rooms = await this.roomRepository.findPublicRooms(limit);
      
      const roomListData = await Promise.all(
        rooms.map(async (room) => {
          // Get creator details
          const creator = await this.userRepository.findById(room.createdBy);
          
          // Get problem details if exists
          let problemTitle = undefined;
          if (room.problemNumber) {
            const problem = await this.problemRepository.findByNumber(room.problemNumber);
            problemTitle = problem?.title;
          }

          return {
            id: room.id,
            roomNumber: room.roomNumber,
            roomId: room.roomId,
            name: room.name,
            description: room.description,
            thumbnail: room.thumbnail,
            creatorName: creator?.username || 'Unknown',
            participantCount: room.participants.filter(p => p.isOnline).length,
            isActive: room.status === 'active',
            problemTitle,
            createdAt: room.createdAt
          };
        })
      );

      return {
        success: true,
        rooms: roomListData,
        total: roomListData.length
      };
    } catch (error: any) {
      return { success: false, rooms: [], total: 0 };
    }
  }
}
