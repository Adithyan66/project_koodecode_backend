

import { IRoomRepository } from '../../../domain/interfaces/repositories/IRoomRepository';
import { PasswordService } from '../../services/PasswordService';
import { VerifyPrivateRoomDto } from '../../dto/rooms/JoinRoomDto';
import { VerifyPrivateRoomResponseDto } from '../../dto/rooms/JoinRoomDto';

export class VerifyPrivateRoomUseCase {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly passwordService: PasswordService
  ) {}

  async execute(dto: VerifyPrivateRoomDto): Promise<VerifyPrivateRoomResponseDto> {

    try {

      if (!dto.roomName?.trim()) {
        return {
          success: false,
          error: 'Room name is required'
        };
      }

      if (!dto.password?.trim()) {
        return {
          success: false,
          error: 'Password is required'
        };
      }

      const room = await this.roomRepository.findByName(dto.roomName.trim());
      
      if (!room) {
        return {
          success: false,
          error: 'Room not found'
        };
      }

      if (!room.isPrivate) {
        return {
          success: false,
          error: 'This room is not private'
        };
      }

      if (!room.password) {
        return {
          success: false,
          error: 'Room password not configured'
        };
      }

      const isPasswordValid = await this.passwordService.verifyPassword(
        dto.password,
        room.password
      );

      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Invalid password'
        };
      }

      if (room.status === 'inactive') {
        return {
          success: false,
          error: 'Room is currently inactive'
        };
      }

      return {
        success: true,
        roomId: room._id
      };

    } catch (error) {
      console.error('Error in VerifyPrivateRoomUseCase:', error);
      return {
        success: false,
        error: 'Failed to verify room credentials'
      };
    }
  }
}
