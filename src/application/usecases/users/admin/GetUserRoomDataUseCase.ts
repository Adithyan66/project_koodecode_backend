import { inject, injectable } from 'tsyringe';
import { IRoomRepository } from '../../../../domain/interfaces/repositories/IRoomRepository';
import { IRoomActivityRepository } from '../../../../domain/interfaces/repositories/IRoomActivityRepository';
import { IUserProfileRepository } from '../../../../domain/interfaces/repositories/IUserProfileRepository';
import { IGetUserRoomDataUseCase } from '../../../interfaces/IUserUseCase';
import { UserRoomDataDto } from '../../../dto/users/admin/UserRoomDataDto';
import { NotFoundError } from '../../../errors/AppErrors';

@injectable()
export class GetUserRoomDataUseCase implements IGetUserRoomDataUseCase {
  constructor(
    @inject('IRoomRepository') private roomRepository: IRoomRepository,
    @inject('IRoomActivityRepository') private roomActivityRepository: IRoomActivityRepository,
    @inject('IUserProfileRepository') private userProfileRepository: IUserProfileRepository
  ) {}

  async execute(userId: string, page: number, limit: number): Promise<UserRoomDataDto> {
    // Validate user exists
    const userProfile = await this.userProfileRepository.findByUserId(userId);
    if (!userProfile) {
      throw new NotFoundError('User not found');
    }

    // Get rooms created by user
    const createdRooms = await this.roomRepository.findByCreator(userId);
    const roomsCreated = createdRooms.length;

    // Get all rooms where user participates (created + joined)
    const [allUserRooms, totalRooms] = await Promise.all([
      this.roomRepository.findRoomsByUser(userId, page, limit),
      this.roomRepository.countRoomsByUser(userId)
    ]);

    // Calculate rooms joined (participant but not creator)
    const roomsJoined = allUserRooms.filter(room => room.createdBy !== userId).length;

    // Map rooms to DTO format
    const rooms = allUserRooms.map(room => {
      const role = room.createdBy === userId ? 'creator' : 'participant';
      
      // Find user's participant data to get joinedAt
      const userParticipant = room.participants.find(p => p.userId === userId);
      const joinedAt = userParticipant ? userParticipant.joinedAt : room.createdAt;

      return {
        roomId: room.roomId,
        roomName: room.name,
        role,
        joinedAt: joinedAt.toISOString()
      };
    });

    // Calculate collaboration stats
    const collaborationStats = await this.calculateCollaborationStats(userId, allUserRooms);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalRooms / limit);

    return {
      roomsJoined,
      roomsCreated,
      rooms,
      roomsPagination: {
        page,
        limit,
        total: totalRooms,
        totalPages
      },
      collaborationStats
    };
  }

  private async calculateCollaborationStats(userId: string, rooms: any[]): Promise<{
    totalCollaborations: number;
    successfulCollaborations: number;
    averageSessionDuration: number;
  }> {
    // Total collaborations: rooms with more than 1 participant
    const totalCollaborations = rooms.filter(room => room.participants.length > 1).length;

    // Successful collaborations: rooms with 'inactive' status (completed)
    const successfulCollaborations = rooms.filter(room => 
      room.status === 'inactive' && room.participants.length > 1
    ).length;

    // Average session duration: calculate from room activities
    const roomActivities = await this.roomActivityRepository.findByUserId(userId);
    
    let totalDuration = 0;
    let sessionCount = 0;

    // Group activities by room and calculate session durations
    const roomActivityMap = new Map<string, any[]>();
    roomActivities.forEach(activity => {
      if (!roomActivityMap.has(activity.roomId)) {
        roomActivityMap.set(activity.roomId, []);
      }
      roomActivityMap.get(activity.roomId)!.push(activity);
    });

    // Calculate session durations for each room
    roomActivityMap.forEach((activities, roomId) => {
      const sortedActivities = activities.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      let joinTime: Date | null = null;
      
      for (const activity of sortedActivities) {
        if (activity.action === 'joined') {
          joinTime = activity.timestamp;
        } else if (activity.action === 'left' && joinTime) {
          const duration = activity.timestamp.getTime() - joinTime.getTime();
          totalDuration += duration;
          sessionCount++;
          joinTime = null;
        }
      }
    });

    const averageSessionDuration = sessionCount > 0 ? totalDuration / sessionCount : 0;

    return {
      totalCollaborations,
      successfulCollaborations,
      averageSessionDuration: Math.round(averageSessionDuration) // Return in milliseconds
    };
  }
}

