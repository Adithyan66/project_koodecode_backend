import { inject, injectable } from 'tsyringe';
import { IContestRepository } from '../../../../domain/interfaces/repositories/IContestRepository';
import { IContestParticipantRepository } from '../../../../domain/interfaces/repositories/IContestParticipantRepository';
import { IDeleteContestUseCase } from '../../../interfaces/IAdminContestUseCase';
import { ContestState } from '../../../../domain/entities/Contest';
import { NotFoundError, BadRequestError } from '../../../errors/AppErrors';

@injectable()
export class DeleteContestUseCase implements IDeleteContestUseCase {
  constructor(
    @inject("IContestRepository") private contestRepository: IContestRepository,
    @inject("IContestParticipantRepository") private participantRepository: IContestParticipantRepository
  ) {}

  async execute(contestId: string): Promise<{ success: boolean; message: string }> {
    // Get the existing contest
    const existingContest = await this.contestRepository.findById(contestId);
    
    if (!existingContest) {
      throw new NotFoundError('Contest not found');
    }

    // Validate that contest is not ACTIVE
    if (existingContest.state === ContestState.ACTIVE) {
      throw new BadRequestError('Cannot delete contest that is currently active');
    }

    // Soft delete the contest
    const contestDeleted = await this.contestRepository.softDelete(contestId);
    
    if (!contestDeleted) {
      throw new BadRequestError('Failed to delete contest');
    }

    // Soft delete all related participants
    await this.participantRepository.softDeleteByContest(contestId);

    return {
      success: true,
      message: 'Contest deleted successfully'
    };
  }
}


