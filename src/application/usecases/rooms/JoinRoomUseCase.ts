
import { IRoomRepository } from '../../../domain/interfaces/repositories/IRoomRepository';
import { IProblemRepository } from '../../../domain/interfaces/repositories/IProblemRepository';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { IRoomActivityRepository } from '../../../domain/interfaces/repositories/IRoomActivityRepository';
import { JoinRoomDto, JoinRoomResponseDto } from '../../dto/rooms/JoinRoomDto';
import { ITokenService } from '../../../domain/interfaces/services/ITokenService';
import { config } from '../../../infrastructure/config/config';
import { ITestCaseRepository } from '../../../domain/interfaces/repositories/ITestCaseRepository';

export class JoinRoomUseCase {
  constructor(
    private roomRepository: IRoomRepository,
    private problemRepository: IProblemRepository,
    private userRepository: IUserRepository,
    private roomActivityRepository: IRoomActivityRepository,
    private tokenService: ITokenService,
    private testCaseRepository: ITestCaseRepository
  ) { }

  async execute(joinRoomDto: JoinRoomDto, userId: string): Promise<JoinRoomResponseDto> {

    try {

      const room = await this.roomRepository.findById(joinRoomDto.roomId);

      if (!room) {
        return { success: false, error: 'Room not found' };
      }

      if (room.status === 'inactive') {
        return { success: false, error: 'Room is not active' };
      }

      if (room.status === 'waiting' && room.createdBy !== userId) {
        return { success: false, error: 'Room creator will begin shortly' };
      }

      if (room.isPrivate && room.password && room.password !== joinRoomDto.password) {
        return { success: false, error: 'Invalid password' };
      }

      const user = await this.userRepository.findById(userId);

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      let userPermissions = {
        canEditCode: false,
        canDrawWhiteboard: false,
        canChangeProblem: false
      };

      const existingParticipant = room.participants.find(p => p.userId.toString() === userId);

      if (existingParticipant) {
        userPermissions = existingParticipant.permissions;
      } else {
        console.log("thi is user idddddddddddddd", userId);

        const participant = {
          userId,
          username: user.fullName,
          joinedAt: new Date(),
          isOnline: true,
          permissions: userPermissions
        };

        await this.roomRepository.addParticipant(room.roomId, participant);
      }

      // if (room.createdBy === userId && room.status === 'waiting') {
      if (room.createdBy === userId) {

        await this.roomRepository.update(room.id, { status: 'active' });

        userPermissions = {
          canEditCode: true,
          canDrawWhiteboard: true,
          canChangeProblem: true
        };
      }


      let problem = null;
      let sampleTestCases = null
      if (room.problemNumber) {
        problem = await this.problemRepository.findByProblemNumber(room.problemNumber);
        sampleTestCases = await this.testCaseRepository.findSampleByProblemId(problem!.id!);
      }

      await this.roomActivityRepository.create({
        roomId: room.roomId,
        userId,
        action: 'joined',
        timestamp: new Date()
      });

      const socketToken = this.tokenService.generateAccessToken({
        userId,
        roomId: room.roomId,
        type: 'socket'
      });

      await this.roomRepository.update(room.id, { lastActivity: new Date() });



      return {
        success: true,
        room: {
          id: room.id,
          roomId: room.roomId,
          name: room.name,
          createdBy:room.createdBy,
          description: room.description,
          problem,
          sampleTestCases,
          participants: room.participants,
          userPermissions,
          jitsiUrl: `${config.jitsi.domain}/${room.roomId}`,
          socketToken
        }
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
