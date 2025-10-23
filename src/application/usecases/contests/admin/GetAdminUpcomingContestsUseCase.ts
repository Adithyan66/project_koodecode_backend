import { inject, injectable } from 'tsyringe';
import { IContestRepository } from '../../../../domain/interfaces/repositories/IContestRepository';
import { IContestParticipantRepository } from '../../../../domain/interfaces/repositories/IContestParticipantRepository';
import { IProblemRepository } from '../../../../domain/interfaces/repositories/IProblemRepository';
import { IUserRepository } from '../../../../domain/interfaces/repositories/IUserRepository';
import { IGetAdminUpcomingContestsUseCase } from '../../../interfaces/IAdminContestUseCase';
import { AdminContestListResponseDto, AdminContestDetailDto, ContestStatsDto, ContestProblemDto, TopPerformerDto, ContestStatusDto } from '../../../dto/contests/AdminContestDto';

@injectable()
export class GetAdminUpcomingContestsUseCase implements IGetAdminUpcomingContestsUseCase {
  constructor(
    @inject("IContestRepository") private contestRepository: IContestRepository,
    @inject("IContestParticipantRepository") private participantRepository: IContestParticipantRepository,
    @inject("IProblemRepository") private problemRepository: IProblemRepository,
    @inject("IUserRepository") private userRepository: IUserRepository
  ) {}

  async execute(): Promise<AdminContestListResponseDto> {
    // Get all upcoming contests
    const contests = await this.contestRepository.findUpcoming();
    
    const contestDetails = await Promise.all(
      contests.map(contest => this.mapContestToAdminDto(contest))
    );

    return {
      contests: contestDetails
    };
  }

  private async mapContestToAdminDto(contest: any): Promise<AdminContestDetailDto> {
    // Get contest statistics
    const stats = await this.participantRepository.getContestStats(contest.id);
    
    // Get problems with details
    const problems = await Promise.all(
      contest.problems.map(async (problemId: string) => {
        const problem = await this.problemRepository.findById(problemId);
        if (!problem) return null;
        
        const submissionStats = await this.problemRepository.getSubmissionStatsByProblemId(problemId);
        const acceptanceRate = submissionStats.totalSubmissions > 0
          ? Math.round((submissionStats.acceptedSubmissions / submissionStats.totalSubmissions) * 100)
          : 0;

        return {
          id: problem.id!,
          problemNumber: problem.problemNumber,
          title: problem.title,
          description: problem.description,
          difficulty: problem.difficulty,
          tags: problem.tags,
          totalSubmissions: submissionStats.totalSubmissions,
          acceptedSubmissions: submissionStats.acceptedSubmissions,
          acceptanceRate,
          isActive: problem.isActive
        } as ContestProblemDto;
      })
    );

    // Get top performers (top 10) - for upcoming contests, this might be empty or have few participants
    const topPerformers = await this.participantRepository.getTopPerformers(contest.id, 10);
    const topPerformersWithDetails = await Promise.all(
      topPerformers.map(async (participant, index) => {
        const user = await this.userRepository.findById(participant.userId);
        return {
          rank: index + 1,
          username: user?.userName || 'Unknown User',
          profileImage: user?.profilePicKey,
          totalScore: participant.totalScore,
          timeTaken: this.formatTime(participant.getTimeTaken()),
          attempts: participant.getTotalAttempts(),
          status: this.formatStatus(participant.status),
          coinsEarned: participant.coinsEarned > 0 ? participant.coinsEarned : undefined
        } as TopPerformerDto;
      })
    );

    // Calculate contest status
    const now = new Date();
    const timeUntilStart = contest.startTime.getTime() - now.getTime();
    const timeUntilEnd = contest.endTime.getTime() - now.getTime();
    const timeUntilRegistrationDeadline = contest.registrationDeadline.getTime() - now.getTime();

    const status: ContestStatusDto = {
      currentState: contest.state,
      timeUntilStart: timeUntilStart > 0 ? Math.max(0, timeUntilStart) : undefined,
      timeUntilEnd: timeUntilEnd > 0 ? Math.max(0, timeUntilEnd) : undefined,
      timeUntilRegistrationDeadline: timeUntilRegistrationDeadline > 0 ? Math.max(0, timeUntilRegistrationDeadline) : undefined,
      isRegistrationOpen: contest.isRegistrationOpen(),
      isActive: contest.isActive(),
      isEnded: contest.hasEnded(),
      canRegister: contest.canRegister(),
      hasStarted: contest.hasStarted(),
      hasEnded: contest.hasEnded()
    };

    return {
      id: contest.id,
      contestNumber: contest.contestNumber,
      title: contest.title,
      description: contest.description,
      createdBy: contest.createdBy,
      startTime: contest.startTime.toISOString(),
      endTime: contest.endTime.toISOString(),
      thumbnail: contest.thumbnail,
      registrationDeadline: contest.registrationDeadline.toISOString(),
      problemTimeLimit: contest.problemTimeLimit,
      maxAttempts: contest.maxAttempts,
      wrongSubmissionPenalty: contest.wrongSubmissionPenalty,
      coinRewards: contest.coinRewards.map(reward => ({
        rank: reward.rank,
        coins: reward.coins
      })),
      state: contest.state,
      createdAt: contest.createdAt.toISOString(),
      updatedAt: contest.updatedAt.toISOString(),
      stats: {
        totalParticipants: stats.totalParticipants,
        completedParticipants: stats.completedParticipants,
        inProgressParticipants: stats.inProgressParticipants,
        averageScore: Math.round(stats.averageScore * 100) / 100,
        totalProblems: contest.problems.length,
        maxPossibleScore: 1000, // Base score for correct solution
        isActive: contest.isActive(),
        timeRemaining: status.timeUntilEnd
      },
      problems: problems.filter(p => p !== null) as ContestProblemDto[],
      topPerformers: topPerformersWithDetails,
      status
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

  private formatStatus(status: string): string {
    switch (status) {
      case 'registered':
        return 'Registered';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'time_up':
        return 'Time Up';
      case 'disqualified':
        return 'Disqualified';
      default:
        return 'Unknown';
    }
  }
}

