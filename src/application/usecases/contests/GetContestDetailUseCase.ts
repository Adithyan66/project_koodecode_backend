

import { Contest } from '../../../domain/entities/Contest';
import { IContestRepository } from '../../../domain/interfaces/repositories/IContestRepository';
import { IContestParticipantRepository } from '../../../domain/interfaces/repositories/IContestParticipantRepository';
import { ContestDetailDto, CoinRewardDto } from '../../dto/contests/ContestDetailDto';
export class GetContestDetailUseCase {
  constructor(
    private contestRepository: IContestRepository,
    private contestParticipantRepository: IContestParticipantRepository
  ) { }

  async execute(contestNumber: number, userId?: string): Promise<ContestDetailDto | null> {
    const contest = await this.contestRepository.findByNumber(contestNumber);

    if (!contest) {
      return null;
    }

    let isUserRegistered = false;

    if (userId) {
      const participant = await this.contestParticipantRepository
        .findByContestAndUser(contest.id, userId);
      isUserRegistered = !!participant;
    }

    return this.mapToDto(contest, isUserRegistered);
  }

  private mapToDto(contest: Contest, isUserRegistered: boolean): ContestDetailDto {
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
      isUserRegistered
    };
  }
}
