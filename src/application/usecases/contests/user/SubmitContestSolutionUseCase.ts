



import { IContestRepository } from '../../../../domain/interfaces/repositories/IContestRepository';
import { IContestParticipantRepository } from '../../../../domain/interfaces/repositories/IContestParticipantRepository';
import { ISubmissionRepository } from '../../../../domain/interfaces/repositories/ISubmissionRepository';
import { ContestSubmission, ParticipantStatus } from '../../../../domain/entities/ContestParticipant';
import { ContestSubmissionDto, ContestSubmissionResponseDto } from '../../../dto/contests/ContestSubmissionDto';
import { ExecuteCodeDto } from '../../../dto/submissions/ExecuteCodeDto';
import { inject, injectable } from 'tsyringe';
import { IContestScoringService } from '../../../interfaces/IContestScoringService';
import { IContestTimerService } from '../../../interfaces/IContestTimerService';
import { ICreateSubmissionUseCase } from '../../../interfaces/ISubmissionUseCase';
import { ISubmitContestSolutionUseCase } from '../../../interfaces/IContestUseCase';


@injectable()
export class SubmitContestSolutionUseCase implements ISubmitContestSolutionUseCase{
  constructor(
    @inject('IContestRepository') private contestRepository: IContestRepository,
    @inject('IContestParticipantRepository') private participantRepository: IContestParticipantRepository,
    @inject('ISubmissionRepository') private submissionRepository: ISubmissionRepository,
    @inject('ICreateSubmissionUseCase') private createSubmissionUseCase: ICreateSubmissionUseCase,
    @inject('IContestScoringService') private scoringService: IContestScoringService,
    @inject('IContestTimerService') private timerService: IContestTimerService
  ) { }

  async execute(dto: ContestSubmissionDto, userId: string): Promise<ContestSubmissionResponseDto> {
    try {

      const contest = await this.contestRepository.findByNumber(dto.contestNumber);

      if (!contest) {
        throw new Error('Contest not found');
      }

      if (!contest.isActive()) {
        throw new Error('Contest is not active');
      }

      const participant = await this.participantRepository.findByContestAndUser(contest.id, userId);

      if (!participant) {
        throw new Error('Not registered for this contest');
      }

      if (participant.status === ParticipantStatus.COMPLETED) {
        throw new Error('Contest already completed');
      }

      if (participant.status === ParticipantStatus.TIME_UP) {
        throw new Error('Time limit exceeded');
      }

      const currentAttempts = participant.getTotalAttempts();
      if (currentAttempts >= contest.maxAttempts) {
        throw new Error(`Maximum attempts (${contest.maxAttempts}) reached`);
      }

      const timeTaken = participant.getTimeTaken();
      const timeLimitSeconds = contest.problemTimeLimit * 60;

      if (!participant.id) {
        throw new Error("participant.id is missing ")
      }


      if (timeTaken >= timeLimitSeconds) {
        participant.status = ParticipantStatus.TIME_UP;
        participant.endTime = new Date();

        await this.participantRepository.update(participant.id, {
          status: participant.status,
          endTime: participant.endTime
        });

        throw new Error('Time limit exceeded');
      }

      const executeCodeDto: ExecuteCodeDto = {
        problemId: participant.assignedProblemId,
        sourceCode: dto.sourceCode,
        languageId: dto.languageId,
        userId: userId,
        submissionType: 'contest'
      };

      const executionResult = await this.createSubmissionUseCase.execute(executeCodeDto);

      const isCorrect = executionResult.overallVerdict === 'Accepted' &&
        executionResult.testCasesPassed === executionResult.totalTestCases;

      const attemptNumber = currentAttempts + 1;
      const penaltyApplied = isCorrect ? 0 : contest.wrongSubmissionPenalty;

      const contestSubmission = new ContestSubmission({
        submissionId: executionResult.id,
        submittedAt: new Date(),
        isCorrect,
        timeTaken,
        attemptNumber,
        penaltyApplied
      });

      const newScore = this.scoringService.calculateScore(participant, contest, contestSubmission);

      participant.addSubmission(contestSubmission);
      participant.updateScore(newScore);

      if (isCorrect) {
        participant.status = ParticipantStatus.COMPLETED;
        participant.endTime = new Date();
      }

      await this.participantRepository.update(participant.id, {
        submissions: participant.submissions,
        totalScore: participant.totalScore,
        status: participant.status,
        endTime: participant.endTime,
        updatedAt: new Date()
      });

      await this.updateContestLeaderboard(contest.id);

      const updatedParticipant = await this.participantRepository.findById(participant.id);
      const rank = updatedParticipant?.rank || undefined;

      return {
        submissionId: executionResult.id,
        result: executionResult,
        isCorrect,
        timeTaken,
        attemptNumber,
        penaltyApplied,
        totalScore: newScore,
        rank,
        message: this.getResponseMessage(isCorrect, attemptNumber, contest.maxAttempts)
      };

    } catch (error) {
      console.error('Contest submission error:', error);
      throw new Error(error instanceof Error ? error.message : 'Contest submission failed');
    }
  }

  private async updateContestLeaderboard(contestId: string): Promise<void> {
    try {

      const participants = await this.participantRepository.findByContestId(contestId);

      if (!participants || participants.length === 0) {
        return;
      }

      const sortedParticipants = participants
        .filter(p => p.status === ParticipantStatus.COMPLETED || p.status === ParticipantStatus.TIME_UP)
        .sort((a, b) => {
          if (b.totalScore !== a.totalScore) {
            return b.totalScore - a.totalScore;
          }
          return a.getTimeTaken() - b.getTimeTaken();
        });

      let currentRank = 1;
      let previousScore = null;
      let previousTime = null;
      let participantsAtSameRank = 0;

      for (let i = 0; i < sortedParticipants.length; i++) {
        const participant = sortedParticipants[i];
        const currentScore = participant.totalScore;
        const currentTime = participant.getTimeTaken();

        if (previousScore === null ||
          currentScore !== previousScore ||
          currentTime !== previousTime) {
          currentRank = i + 1;
          participantsAtSameRank = 1;
        } else {
          participantsAtSameRank++;
        }

        participant.rank = currentRank;
        previousScore = currentScore;
        previousTime = currentTime;

        await this.participantRepository.update(participant.id!, {
          rank: participant.rank,
          updatedAt: new Date()
        });
      }

    } catch (error) {
      console.error('Error updating contest leaderboard:', error);
    }
  }

  private getResponseMessage(isCorrect: boolean, attemptNumber: number, maxAttempts: number): string {
    if (isCorrect) {
      return `Congratulations! Correct solution on attempt ${attemptNumber}.`;
    }

    const remainingAttempts = maxAttempts - attemptNumber;
    if (remainingAttempts > 0) {
      return `Wrong answer. You have ${remainingAttempts} attempt(s) remaining.`;
    } else {
      return 'Wrong answer. No more attempts remaining.';
    }
  }
}
