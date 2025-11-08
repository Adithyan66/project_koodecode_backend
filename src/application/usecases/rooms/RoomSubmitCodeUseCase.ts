import { inject, injectable } from 'tsyringe';
import { IRoomSubmitCodeUseCase } from '../../interfaces/IRoomUseCase';
import { RoomSubmitCodeDto } from '../../dto/rooms/users/RoomSubmitCodeDto';
import { SubmissionResponseDto } from '../../dto/submissions/SubmissionResponseDto';
import { IRoomRepository } from '../../../domain/interfaces/repositories/IRoomRepository';
import { ICreateSubmissionUseCase } from '../../interfaces/IProblemUseCase';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../../errors/AppErrors';

@injectable()
export class RoomSubmitCodeUseCase implements IRoomSubmitCodeUseCase {
  constructor(
    @inject('IRoomRepository') private roomRepository: IRoomRepository,
    @inject('ICreateSubmissionUseCase') private createSubmissionUseCase: ICreateSubmissionUseCase
  ) {}

  async execute(dto: RoomSubmitCodeDto, userId: string): Promise<SubmissionResponseDto> {
    const { roomId, problemId, sourceCode, languageId } = dto;

    // const room = await this.roomRepository.findByRoomId(roomId);
    
    // if (!room) {
    //   throw new NotFoundError('Room not found');
    // }

    // if (room.status !== 'active' && room.status !== 'waiting') {
    //   throw new BadRequestError('Room is not active or waiting');
    // }

    // const isParticipant = room.participants.some(p => p.userId === userId);
    // if (!isParticipant) {
    //   throw new UnauthorizedError('User is not a participant of this room');
    // }

    const submissionResponse = await this.createSubmissionUseCase.execute({
      userId,
      problemId,
      sourceCode,
      languageId,
      submissionType: 'room'
    });

    await this.roomRepository.addSubmission(roomId, {
      submissionId: submissionResponse.id,
      userId,
      submittedAt: new Date(),
      problemId,
      score: submissionResponse.score
    });

    return submissionResponse;
  }
}

