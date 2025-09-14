

import { IContestRepository } from '../../../domain/interfaces/repositories/IContestRepository';
import { IContestParticipantRepository } from '../../../domain/interfaces/repositories/IContestParticipantRepository';
import { ISubmissionRepository } from '../../../domain/interfaces/repositories/ISubmissionRepository';
import { ContestSubmission, ParticipantStatus } from '../../../domain/entities/ContestParticipant';
import { ContestSubmissionDto, ContestSubmissionResponseDto } from '../../dto/contests/ContestSubmissionDto';
import { ContestScoringService } from '../../services/ContestScoringService';
import { ContestTimerService } from '../../services/ContestTimerService';
import { RunCodeUseCase } from '../submissions/RunCodeUseCase';

export class SubmitContestSolutionUseCase {
  constructor(
    private contestRepository: IContestRepository,
    private participantRepository: IContestParticipantRepository,
    private submissionRepository: ISubmissionRepository,
    private runCodeUseCase: RunCodeUseCase,
    private scoringService: ContestScoringService,
    private timerService: ContestTimerService
  ) {}

  async execute(dto: ContestSubmissionDto, userId: string): Promise<ContestSubmissionResponseDto> {
    const contest = await this.contestRepository.findById(dto.contestId);
    if (!contest) {
      throw new Error('Contest not found');
    }

    const participant = await this.participantRepository.findByContestAndUser(dto.contestId, userId);
    if (!participant) {
      throw new Error('Not registered for this contest');
    }

    // Check if participant can still submit
    if (!participant.canSubmit(contest.maxAttempts)) {
      throw new Error('Maximum attempts reached or contest completed');
    }

    // Check time limit
    if (this.timerService.checkParticipantTimeLimit(participant, contest)) {
      participant.markTimeUp();
      await this.participantRepository.update(participant.id, {
        status: participant.status,
        endTime: participant.endTime
      });
      throw new Error('Time limit exceeded');
    }

    // Execute the code
    const executionResult = await this.runCodeUseCase.execute({
      problemId: participant.assignedProblemId,
      code: dto.code,
      languageId: dto.languageId
    }, userId);

    const isCorrect = executionResult.status === 'Accepted';
    const timeTaken = participant.getTimeTaken();
    const attemptNumber = participant.getTotalAttempts() + 1;

    // Create contest submission record
    const contestSubmission = new ContestSubmission({
      submissionId: executionResult.id,
      submittedAt: new Date(),
      isCorrect,
      timeTaken,
      attemptNumber,
      penaltyApplied: isCorrect ? 0 : contest.wrongSubmissionPenalty
    });

    // Calculate new score
    const newScore = this.scoringService.calculateScore(participant, contest, contestSubmission);

    // Add submission to participant
    participant.addSubmission(contestSubmission);
    participant.updateScore(newScore);

    // If correct submission, mark as completed
    if (isCorrect) {
      participant.completeContest();
    }

    // Update participant in database
    await this.participantRepository.update(participant.id, {
      submissions: participant.submissions,
      totalScore: participant.totalScore,
      status: participant.status,
      endTime: participant.endTime
    });

    // Update rankings for the contest
    await this.participantRepository.updateRankings(dto.contestId);
    
    // Get updated rank
    const rank = await this.participantRepository.getParticipantRank(participant.id);

    return {
      submissionId: executionResult.id,
      isCorrect,
      timeTaken,
      attemptNumber,
      penaltyApplied: contestSubmission.penaltyApplied,
      totalScore: newScore,
      rank,
      message: isCorrect ? 'Correct solution!' : 'Wrong answer. Try again!'
    };
  }
}
