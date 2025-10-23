
import { IRoomRepository } from '../../../domain/interfaces/repositories/IRoomRepository';
import { ICounterRepository } from '../../../domain/interfaces/repositories/ICounterRepository';
import { IProblemRepository } from '../../../domain/interfaces/repositories/IProblemRepository';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { CreateRoomDto, CreateRoomResponseDto } from '../../dto/rooms/CreateRoomDto';
import { Room } from '../../../domain/entities/Room';
import { config } from '../../../infrastructure/config/config';
import { IPasswordService } from '../../../domain/interfaces/services/IPasswordService';
import { inject, injectable } from 'tsyringe';
import { ICreateRoomUseCase } from '../../interfaces/IRoomUseCase';



@injectable()
export class CreateRoomUseCase implements ICreateRoomUseCase{

    constructor(
        @inject('IRoomRepository') private roomRepository: IRoomRepository,
        @inject('ICounterRepository') private counterRepository: ICounterRepository,
        @inject('IProblemRepository') private problemRepository: IProblemRepository,
        @inject('IUserRepository') private userRepository: IUserRepository,
        @inject('IPasswordService') private passwordService: IPasswordService
    ) { }

    async execute(createRoomDto: CreateRoomDto, userId: string): Promise<CreateRoomResponseDto> {

        try {

            const user = await this.userRepository.findById(userId);

            if (!user) {
                return { success: false, error: 'User not found' };
            }

            let problem = null;

            if (createRoomDto.problemNumber) {

                problem = await this.problemRepository.findByProblemNumber(createRoomDto.problemNumber);

                if (!problem) {
                    return { success: false, error: 'Problem not found' };
                }
            }

            const roomNumber = await this.counterRepository.getNextSequenceValue('room');

            const roomId = `koodecode_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const scheduledTime = createRoomDto.scheduledTime ? new Date(createRoomDto.scheduledTime) : undefined;

            const status = scheduledTime && scheduledTime > new Date() ? 'waiting' : 'active';

            let password

            if (createRoomDto.isPrivate && createRoomDto.password) {
                password = await this.passwordService.hashPassword(createRoomDto.password)
            }


            const room: Omit<Room, 'id' | 'createdAt' | 'updatedAt'> = {
                roomNumber,
                roomId,
                name: createRoomDto.name,
                description: createRoomDto.description,
                thumbnail: createRoomDto.thumbnail,
                createdBy: userId,
                isPrivate: createRoomDto.isPrivate,
                password: createRoomDto.isPrivate ? password : undefined,
                scheduledTime,
                problemNumber: createRoomDto.problemNumber || 1,
                status,
                participants: [],
                permissions: {
                    canEditCode: [userId],
                    canDrawWhiteboard: [userId],
                    canChangeProblem: [userId]
                },
                lastActivity: new Date(),
                _id: undefined
            };

            const createdRoom = await this.roomRepository.create(room);

            return {
                success: true,
                room: {
                    id: createdRoom.id,
                    roomNumber: createdRoom.roomNumber,
                    roomId: createdRoom.roomId,
                    name: createdRoom.name,
                    description: createdRoom.description,
                    isPrivate: createdRoom.isPrivate,
                    scheduledTime: createdRoom.scheduledTime,
                    problemNumber: createdRoom.problemNumber,
                    thumbnail: createdRoom.thumbnail,
                    status: createdRoom.status,
                    jitsiUrl: `${config.jitsi.domain}/${createdRoom.roomId}`
                }
            };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }
}
