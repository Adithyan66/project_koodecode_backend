

import { IContestRepository } from '../../../domain/interfaces/repositories/IContestRepository';
import { IContestParticipantRepository } from '../../../domain/interfaces/repositories/IContestParticipantRepository';
import { IProblemRepository } from '../../../domain/interfaces/repositories/IProblemRepository';
import { ContestState } from '../../../domain/entities/Contest';
import { ParticipantStatus } from '../../../domain/entities/ContestParticipant';
import { AssignedProblemDto } from '../../dto/contests/ContestResponseDto';
import { ContestTimerService } from '../../services/ContestTimerService';

export class StartContestProblemUseCase {
  constructor(
    private contestRepository: IContestRepository,
    private participantRepository: IContestParticipantRepository,
    private problemRepository: IProblemRepository,
    private timerService: ContestTimerService
  ) {}

  async execute(contestId: string, userId: string): Promise<AssignedProblemDto & { timeRemaining: number }> {
    const contest = await this.contestRepository.findById(contestId);
    if (!contest) {
      throw new Error('Contest not found');
    }

    if (!contest.isActive()) {
      throw new Error('Contest is not active');
    }

    const participant = await this.participantRepository.findByContestAndUser(contestId, userId);
    if (!participant) {
      throw new Error('Not registered for this contest');
    }

    if (participant.status === ParticipantStatus.COMPLETED || participant.status === ParticipantStatus.TIME_UP) {
      throw new Error('Contest already completed for this user');
    }

    // Update participant start time if not already started
    if (!participant.startTime && participant.status === ParticipantStatus.REGISTERED) {
      participant.startContest();
      await this.participantRepository.update(participant.id, {
        startTime: participant.startTime,
        status: participant.status
      });
    }

    const problem = await this.problemRepository.findById(participant.assignedProblemId);
    if (!problem) {
      throw new Error('Assigned problem not found');
    }

    const timeRemaining = this.timerService.getRemainingTime(participant, contest);

    return {
      id: problem.id,
      title: problem.title,
      difficulty: problem.difficulty,
      description: problem.description,
      constraints: problem.constraints,
      examples: problem.examples,
      timeRemaining
    };
  }
}
