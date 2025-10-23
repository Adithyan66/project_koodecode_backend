import { inject, injectable } from 'tsyringe';
import { IContestRepository } from '../../../../domain/interfaces/repositories/IContestRepository';
import { IContestParticipantRepository } from '../../../../domain/interfaces/repositories/IContestParticipantRepository';
import { IProblemRepository } from '../../../../domain/interfaces/repositories/IProblemRepository';
import { IUserRepository } from '../../../../domain/interfaces/repositories/IUserRepository';
import { IGetAdminPastContestsUseCase } from '../../../interfaces/IAdminContestUseCase';
import { AdminContestListResponseDto, AdminContestDetailDto, ContestStatsDto, ContestProblemDto, ParticipantDetailDto, ContestSubmissionDetailDto, ContestStatusDto, AdminContestListRequestDto } from '../../../dto/contests/AdminContestDto';
import { ContestState } from '../../../../domain/entities/Contest';

@injectable()
export class GetAdminPastContestsUseCase implements IGetAdminPastContestsUseCase {
  constructor(
    @inject("IContestRepository") private contestRepository: IContestRepository,
    @inject("IContestParticipantRepository") private participantRepository: IContestParticipantRepository,
    @inject("IProblemRepository") private problemRepository: IProblemRepository,
    @inject("IUserRepository") private userRepository: IUserRepository
  ) {}

  async execute(request: AdminContestListRequestDto): Promise<AdminContestListResponseDto> {
    const page = request.page || 1;
    const limit = Math.min(request.limit || 10, 50); // Max 50 per page
    const search = request.search;
    const fromDate = request.fromDate ? new Date(request.fromDate) : undefined;
    const toDate = request.toDate ? new Date(request.toDate) : undefined;
    const sortBy = request.sortBy || 'endTime';
    const sortOrder = request.sortOrder || 'desc';

    // Get past contests with filters
    const pastContests = await this.getPastContestsWithFilters({
      page,
      limit,
      search,
      fromDate,
      toDate,
      sortBy,
      sortOrder
    });

    const contestDetails = await Promise.all(
      pastContests.contests.map(contest => this.mapContestToAdminDto(contest))
    );

    return {
      contests: contestDetails,
      pagination: {
        page,
        limit,
        total: pastContests.total,
        totalPages: Math.ceil(pastContests.total / limit),
        hasNextPage: page < Math.ceil(pastContests.total / limit),
        hasPreviousPage: page > 1
      }
    };
  }

  private async getPastContestsWithFilters(filters: any) {
    // This would need to be implemented in the repository
    // For now, we'll get all contests and filter them
    const allContests = await this.contestRepository.find();
    
    // Filter for past contests
    const now = new Date();
    let pastContests = allContests.filter(contest => 
      contest.state === ContestState.ENDED || 
      contest.state === ContestState.RESULTS_PUBLISHED ||
      contest.endTime < now
    );

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      pastContests = pastContests.filter(contest =>
        contest.title.toLowerCase().includes(searchLower) ||
        contest.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply date range filter
    if (filters.fromDate) {
      pastContests = pastContests.filter(contest => contest.endTime >= filters.fromDate);
    }
    if (filters.toDate) {
      pastContests = pastContests.filter(contest => contest.endTime <= filters.toDate);
    }

    // Apply sorting
    pastContests.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'createdAt':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case 'startTime':
          aValue = a.startTime.getTime();
          bValue = b.startTime.getTime();
          break;
        case 'endTime':
          aValue = a.endTime.getTime();
          bValue = b.endTime.getTime();
          break;
        case 'participantCount':
          aValue = a.participants.length;
          bValue = b.participants.length;
          break;
        default:
          aValue = a.endTime.getTime();
          bValue = b.endTime.getTime();
      }

      return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    // Apply pagination
    const total = pastContests.length;
    const startIndex = (filters.page - 1) * filters.limit;
    const endIndex = startIndex + filters.limit;
    const paginatedContests = pastContests.slice(startIndex, endIndex);

    return {
      contests: paginatedContests,
      total
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

    // Get all participants with full details for past contests
    const participants = await this.participantRepository.findByContest(contest.id);
    const participantsWithDetails = await Promise.all(
      participants.map(async (participant) => {
        const user = await this.userRepository.findById(participant.userId);
        return {
          id: participant.id!,
          userId: participant.userId,
          username: user?.userName || 'Unknown User',
          email: user?.email || '',
          fullName: user?.fullName || '',
          profileImage: user?.profilePicKey,
          assignedProblemId: participant.assignedProblemId,
          registrationTime: participant.registrationTime.toISOString(),
          startTime: participant.startTime?.toISOString(),
          endTime: participant.endTime?.toISOString(),
          totalScore: participant.totalScore,
          rank: participant.rank,
          coinsEarned: participant.coinsEarned,
          status: this.formatStatus(participant.status),
          attempts: participant.getTotalAttempts(),
          timeTaken: participant.getTimeTaken(),
          submissions: participant.submissions.map(sub => ({
            id: sub.submissionId,
            submittedAt: sub.submittedAt.toISOString(),
            isCorrect: sub.isCorrect,
            timeTaken: sub.timeTaken,
            attemptNumber: sub.attemptNumber,
            penaltyApplied: sub.penaltyApplied,
            status: sub.isCorrect ? 'accepted' : 'rejected'
          }))
        } as ParticipantDetailDto;
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
      participants: participantsWithDetails,
      status
    };
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

