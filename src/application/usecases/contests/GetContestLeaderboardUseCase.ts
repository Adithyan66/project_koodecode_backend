

import { IContestRepository } from '../../../domain/interfaces/repositories/IContestRepository';
import { IContestParticipantRepository } from '../../../domain/interfaces/repositories/IContestParticipantRepository';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { ContestLeaderboardDto, LeaderboardEntryDto } from '../../dto/contests/ContestLeaderboardDto';
import { ParticipantStatus } from '../../../domain/entities/ContestParticipant';

export class GetContestLeaderboardUseCase {
  constructor(
    private contestRepository: IContestRepository,
    private participantRepository: IContestParticipantRepository,
    private userRepository: IUserRepository
  ) { }

  async execute(contestNumber: number, currentUserId?: string): Promise<ContestLeaderboardDto> {

    const contest = await this.contestRepository.findByNumber(contestNumber);
    if (!contest) {
      throw new Error('Contest not found');
    }

    const participants = await this.participantRepository.getLeaderboard(contest.id);

    const rankings: LeaderboardEntryDto[] = await Promise.all(
      participants.map(async (participant, index) => {
        const user = await this.userRepository.findById(participant.userId);
        console.log("hiiiiiiiiii",participant);

        return {
          rank: index + 1,
          username: user?.userName || 'Unknown User',
          profileImage: user?.profilePicKey,
          totalScore: participant.totalScore,
          timeTaken: this.formatTime(participant.getTimeTaken()),
          attempts: participant.getTotalAttempts(),
          status: this.formatStatus(participant.status),
          coinsEarned: participant.coinsEarned > 0 ? participant.coinsEarned : undefined
        };
      })
    );

    let userRank: number | undefined;
    if (currentUserId) {
      const userParticipant = participants.find(p => p.userId === currentUserId);
      if (userParticipant) {
        userRank = participants.indexOf(userParticipant) + 1;
      }
    }

    

    return {
      contestId: contest.id,
      rankings,
      totalParticipants: participants.length,
      lastUpdated: new Date(),
      userRank
    };
  }

  private formatTime(seconds: number): string {
    if (seconds === 0) {
      return '0m 0s';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    }

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }

    return `${remainingSeconds}s`;
  }

  private formatStatus(status: ParticipantStatus): string {
    switch (status) {
      case ParticipantStatus.REGISTERED:
        return 'Registered';
      case ParticipantStatus.IN_PROGRESS:
        return 'In Progress';
      case ParticipantStatus.COMPLETED:
        return 'Completed';
      case ParticipantStatus.TIME_UP:
        return 'Time Up';
      case ParticipantStatus.DISQUALIFIED:
        return 'Disqualified';
      default:
        return 'Unknown';
    }
  }
}
