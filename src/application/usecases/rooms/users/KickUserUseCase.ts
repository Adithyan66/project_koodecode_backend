
import { IRoomRepository } from '../../../../domain/interfaces/repositories/IRoomRepository';
import { IRoomActivityRepository } from '../../../../domain/interfaces/repositories/IRoomActivityRepository';
import { KickUserDto } from '../../../dto/rooms/users/UpdateRoomPermissionsDto';
import { inject, injectable } from 'tsyringe';
import { IKickUserUseCase } from '../../../interfaces/IRoomUseCase';


@injectable()
export class KickUserUseCase implements IKickUserUseCase{

  constructor(
    @inject('IRoomRepository') private roomRepository: IRoomRepository,
    @inject('IRoomActivityRepository') private roomActivityRepository: IRoomActivityRepository
  ) { }

  async execute(
    roomId: string,
    requesterId: string,
    kickDto: KickUserDto
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const room = await this.roomRepository.findByRoomId(roomId);
      if (!room) {
        return { success: false, error: 'Room not found' };
      }

      // Only room creator can kick users
      if (room.createdBy !== requesterId) {
        return { success: false, error: 'Only room creator can kick users' };
      }

      // Cannot kick yourself
      if (kickDto.userId === requesterId) {
        return { success: false, error: 'Cannot kick yourself' };
      }

      // Remove user from participants
      await this.roomRepository.removeParticipant(roomId, kickDto.userId);
      await this.roomRepository.addKickedUser(roomId, kickDto.userId);

      // Log activity
      await this.roomActivityRepository.create({
        roomId,
        userId: requesterId,
        action: 'user_kicked',
        details: { kickedUserId: kickDto.userId, reason: kickDto.reason },
        timestamp: new Date()
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
