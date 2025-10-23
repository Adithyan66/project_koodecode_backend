import { inject, injectable } from 'tsyringe';
import { IContestRepository } from '../../../../domain/interfaces/repositories/IContestRepository';
import { IContestParticipantRepository } from '../../../../domain/interfaces/repositories/IContestParticipantRepository';
import { IProblemRepository } from '../../../../domain/interfaces/repositories/IProblemRepository';
import { IUserRepository } from '../../../../domain/interfaces/repositories/IUserRepository';
import { IGetAdminContestByIdUseCase } from '../../../interfaces/IAdminContestUseCase';
import { AdminContestDetailDto, ContestStatsDto, ContestProblemDto, TopPerformerDto, ContestStatusDto } from '../../../dto/contests/AdminContestDto';
import { ContestState } from '../../../../domain/entities/Contest';
import { NotFoundError } from '../../../errors/AppErrors';

@injectable()
export class GetAdminContestByIdUseCase implements IGetAdminContestByIdUseCase {
  constructor(
    @inject("IContestRepository") private contestRepository: IContestRepository,
    @inject("IContestParticipantRepository") private participantRepository: IContestParticipantRepository,
    @inject("IProblemRepository") private problemRepository: IProblemRepository,
    @inject("IUserRepository") private userRepository: IUserRepository
  ) {}

  async execute(contestId: string): Promise<AdminContestDetailDto> {

    const contest = await this.contestRepository.findById(contestId);
    
    if (!contest) {
      throw new NotFoundError('Contest not found');
    }

    return await this.mapContestToAdminDto(contest);
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

    // Get top performers (top 10)
    const topPerformers = await this.participantRepository.getTopPerformers(contest.id, 10);
    const topPerformersWithDetails = await Promise.all(
      topPerformers.map(async (performer: any) => {
        const user = await this.userRepository.findById(performer.userId);
        return {
          rank: performer.rank,
          username: user?.userName || 'Unknown',
          profileImage: user?.profilePicUrl,
          totalScore: performer.totalScore,
          timeTaken: this.formatTimeTaken(performer.timeTaken),
          attempts: performer.attempts,
          status: performer.status,
          coinsEarned: performer.coinsEarned || 0
        } as TopPerformerDto;
      })
    );

    // Calculate contest status
    const now = new Date();
    const startTime = new Date(contest.startTime);
    const endTime = new Date(contest.endTime);
    const registrationDeadline = new Date(contest.registrationDeadline);

    const timeUntilStart = startTime.getTime() - now.getTime();
    const timeUntilEnd = endTime.getTime() - now.getTime();
    const timeUntilRegistrationDeadline = registrationDeadline.getTime() - now.getTime();

    const status: ContestStatusDto = {
      currentState: contest.state,
      timeUntilStart: timeUntilStart > 0 ? timeUntilStart : undefined,
      timeUntilEnd: timeUntilEnd > 0 ? timeUntilEnd : undefined,
      timeUntilRegistrationDeadline: timeUntilRegistrationDeadline > 0 ? timeUntilRegistrationDeadline : undefined,
      isRegistrationOpen: now < registrationDeadline,
      isActive: contest.state === ContestState.ACTIVE,
      isEnded: contest.state === ContestState.ENDED,
      canRegister: now < registrationDeadline && contest.state === ContestState.UPCOMING,
      hasStarted: now >= startTime,
      hasEnded: now >= endTime
    };

    return {
      id: contest.id!,
      contestNumber: contest.contestNumber,
      title: contest.title,
      description: contest.description,
      createdBy: contest.createdBy,
      startTime: contest.startTime,
      endTime: contest.endTime,
      thumbnail: contest.thumbnail,
      registrationDeadline: contest.registrationDeadline,
      problemTimeLimit: contest.problemTimeLimit,
      maxAttempts: contest.maxAttempts,
      wrongSubmissionPenalty: contest.wrongSubmissionPenalty,
      coinRewards: contest.coinRewards,
      state: contest.state,
      createdAt: contest.createdAt,
      updatedAt: contest.updatedAt,
      stats: {
        totalParticipants: stats.totalParticipants,
        completedParticipants: stats.completedParticipants,
        inProgressParticipants: stats.inProgressParticipants,
        averageScore: stats.averageScore,
        totalProblems: problems.filter(p => p !== null).length,
        maxPossibleScore: contest.maxPossibleScore || 1000,
        isActive: contest.state === ContestState.ACTIVE,
        timeRemaining: contest.state === ContestState.ACTIVE ? timeUntilEnd : undefined
      } as ContestStatsDto,
      problems: problems.filter(p => p !== null) as ContestProblemDto[],
      topPerformers: topPerformersWithDetails,
      status
    };
  }

  private formatTimeTaken(timeInSeconds: number): string {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }
}
