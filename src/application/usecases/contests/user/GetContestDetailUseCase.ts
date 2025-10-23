









import { Contest } from '../../../../domain/entities/Contest';
import { IContestRepository } from '../../../../domain/interfaces/repositories/IContestRepository';
import { IContestParticipantRepository } from '../../../../domain/interfaces/repositories/IContestParticipantRepository';
import { ContestDetailDto, CoinRewardDto, SubmissionDto } from '../../../dto/contests/ContestDetailDto';
import { ISubmissionRepository } from '../../../../domain/interfaces/repositories/ISubmissionRepository';
import { inject, injectable } from 'tsyringe';
import { IGetContestDetailUseCase } from '../../../interfaces/IContestUseCase';


@injectable()
export class GetContestDetailUseCase implements IGetContestDetailUseCase{
  constructor(
    @inject("IContestRepository") private contestRepository: IContestRepository,
    @inject("IContestParticipantRepository") private contestParticipantRepository: IContestParticipantRepository,
    @inject("ISubmissionRepository") private submissionRepository: ISubmissionRepository
  ) { }

  async execute(contestNumber: number, userId?: string): Promise<ContestDetailDto | null> {
    const contest = await this.contestRepository.findByNumber(contestNumber);

    if (!contest) {
      return null;
    }

    let isUserRegistered = false;
    let userSubmission = null;
    let participant;

    if (userId) {
      participant = await this.contestParticipantRepository
        .findByContestAndUser(contest.id, userId);
      isUserRegistered = !!participant;

      if (participant?.assignedProblemId) {
        const submissions = await this.submissionRepository
          .findByProblemId(participant.assignedProblemId);

        if (submissions && submissions.length > 0) {
          const contestSubmission = submissions.find(submission =>
            submission.submissionType === 'contest' &&
            submission.userId === userId
          );

          if (contestSubmission) {
            console.log("enthaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", contestSubmission);

            userSubmission = this.mapSubmissionToDto(contestSubmission);
          }
        }
      }
    }

    return this.mapToDto(contest, isUserRegistered, userSubmission);
  }

  private mapSubmissionToDto(submission: any): SubmissionDto {
    return {
      id: submission.id,
      problemId: submission.problemId,
      userId: submission.userId,
      language: submission.languageId,
      code: submission.sourceCode,
      status: submission.status,
      executionTime: submission.executionTime,
      memoryUsed: submission.memoryUsed,
      score: submission.score,
      submittedAt: submission.createdAt.toISOString(),
      testCasesPassed: submission.testCasesPassed,
      totalTestCases: submission.totalTestCases
    };
  }

  private mapToDto(contest: Contest, isUserRegistered: boolean, userSubmission: SubmissionDto | null): ContestDetailDto {
    const coinRewards: CoinRewardDto[] = contest.coinRewards.map(reward => ({
      rank: reward.rank,
      coins: reward.coins
    }));

    return {
      id: contest.id,
      contestNumber: contest.contestNumber,
      title: contest.title,
      description: contest.description,
      startTime: contest.startTime.toISOString(),
      endTime: contest.endTime.toISOString(),
      thumbnail: contest.thumbnail,
      registrationDeadline: contest.registrationDeadline.toISOString(),
      problemTimeLimit: contest.problemTimeLimit,
      maxAttempts: contest.maxAttempts,
      wrongSubmissionPenalty: contest.wrongSubmissionPenalty,
      coinRewards,
      state: contest.state,
      isUserRegistered,
      ...(userSubmission && { userSubmission })
    };
  }
}
