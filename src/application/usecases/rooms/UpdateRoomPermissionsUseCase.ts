
import { IRoomRepository } from '../../../domain/interfaces/repositories/IRoomRepository';
import { IRoomActivityRepository } from '../../../domain/interfaces/repositories/IRoomActivityRepository';
import { UpdateRoomPermissionsDto } from '../../dto/rooms/UpdateRoomPermissionsDto';
import { inject, injectable } from 'tsyringe';
import { IUpdateRoomPermissionsUseCase } from '../../interfaces/IRoomUseCase';


@injectable()
export class UpdateRoomPermissionsUseCase implements IUpdateRoomPermissionsUseCase{

  constructor(
    @inject('IRoomRepository') private roomRepository: IRoomRepository,
    @inject('IRoomActivityRepository') private roomActivityRepository: IRoomActivityRepository
  ) { }

  async execute(
    roomId: string,
    requesterId: string,
    updateDto: UpdateRoomPermissionsDto
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const room = await this.roomRepository.findByRoomId(roomId);
      if (!room) {
        return { success: false, error: 'Room not found' };
      }

      // Only room creator can update permissions
      if (room.createdBy !== requesterId) {
        return { success: false, error: 'Only room creator can update permissions' };
      }

      // Update permissions in room
      const updatedPermissions = { ...room.permissions };

      if (updateDto.permissions.canEditCode) {
        if (!updatedPermissions.canEditCode.includes(updateDto.userId)) {
          updatedPermissions.canEditCode.push(updateDto.userId);
        }
      } else {
        updatedPermissions.canEditCode = updatedPermissions.canEditCode.filter(
          id => id !== updateDto.userId
        );
      }

      if (updateDto.permissions.canDrawWhiteboard) {
        if (!updatedPermissions.canDrawWhiteboard.includes(updateDto.userId)) {
          updatedPermissions.canDrawWhiteboard.push(updateDto.userId);
        }
      } else {
        updatedPermissions.canDrawWhiteboard = updatedPermissions.canDrawWhiteboard.filter(
          id => id !== updateDto.userId
        );
      }

      if (updateDto.permissions.canChangeProblem) {
        if (!updatedPermissions.canChangeProblem.includes(updateDto.userId)) {
          updatedPermissions.canChangeProblem.push(updateDto.userId);
        }
      } else {
        updatedPermissions.canChangeProblem = updatedPermissions.canChangeProblem.filter(
          id => id !== updateDto.userId
        );
      }

      await this.roomRepository.updatePermissions(roomId, updatedPermissions);

      // Log activity
      await this.roomActivityRepository.create({
        roomId,
        userId: requesterId,
        action: 'permissions_updated',
        details: { targetUserId: updateDto.userId, permissions: updateDto.permissions },
        timestamp: new Date()
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
