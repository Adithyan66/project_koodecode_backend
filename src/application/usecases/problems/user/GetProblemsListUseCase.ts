import { inject, injectable } from 'tsyringe';
import { IProblemRepository } from '../../../../domain/interfaces/repositories/IProblemRepository';
import { IUserProfileRepository } from '../../../../domain/interfaces/repositories/IUserProfileRepository';
import { ProblemListApiResponseDto, ProblemListItemDto } from '../../../dto/problems/users/ProblemListQueryDto';

interface ProblemListFilters {
  difficulty?: 'Easy' | 'Med.' | 'Hard' | 'all';
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'none' | 'acceptance-asc' | 'acceptance-desc';
}

@injectable()
export class GetProblemsListUseCase {

  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_LIMIT = 10;
  private readonly MAX_LIMIT = 100;

  constructor(
    @inject('IProblemRepository') private problemRepository: IProblemRepository,
    @inject('IUserProfileRepository') private userProfileRepository: IUserProfileRepository
  ) { }

  async execute(userId: string, filters: ProblemListFilters = {}): Promise<ProblemListApiResponseDto> {
    const page = filters.page || this.DEFAULT_PAGE;
    const limit = Math.min(filters.limit || this.DEFAULT_LIMIT, this.MAX_LIMIT);

    const difficultyMap = this.mapDifficulty(filters.difficulty);

    const dbFilters: any = {
      search: filters.search,
      difficulty: difficultyMap,
      status: 'Published',
      page,
      limit
    };

    const result = await this.problemRepository.getFilteredProblems(dbFilters, { page, limit });

    const userProfile = await this.userProfileRepository.findByUserId(userId);
    const solvedProblemIds = userProfile ? new Set(userProfile.problemsSolved) : new Set<string>();

    const problemsWithStatus = result.problems.map(problem => {
      const acceptance = this.calculateAcceptanceRate(problem);
      const mappedDifficulty = this.mapDifficultyToDisplay(problem.difficulty);
      const isSolved = solvedProblemIds.has(problem.id!);

      return {
        id: problem.problemNumber,
        number: problem.problemNumber,
        title: problem.title,
        slug: problem.slug,
        acceptance: this.formatAcceptance(acceptance),
        difficulty: mappedDifficulty,
        status: isSolved ? 'solved' as const : null
      } as ProblemListItemDto;
    });

    if (filters.sortBy && filters.sortBy !== 'none') {
      this.sortByAcceptance(problemsWithStatus, filters.sortBy);
    }

    const totalPages = Math.ceil(result.total / limit);

    return {
      data: problemsWithStatus,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: result.total,
        itemsPerPage: limit,
        hasMore: page < totalPages
      }
    };
  }

  private mapDifficulty(difficulty?: 'Easy' | 'Med.' | 'Hard' | 'all'): 'easy' | 'medium' | 'hard' | undefined {
    if (!difficulty || difficulty === 'all') return undefined;
    
    const map: Record<string, 'easy' | 'medium' | 'hard'> = {
      'Easy': 'easy',
      'Med.': 'medium',
      'Hard': 'hard'
    };
    
    return map[difficulty];
  }

  private mapDifficultyToDisplay(difficulty: string): 'Easy' | 'Med.' | 'Hard' {
    const map: Record<string, 'Easy' | 'Med.' | 'Hard'> = {
      'easy': 'Easy',
      'medium': 'Med.',
      'hard': 'Hard'
    };
    
    return map[difficulty.toLowerCase()] || 'Easy';
  }

  private calculateAcceptanceRate(problem: any): number {
    const totalSubmissions = problem.totalSubmissions || 0;
    const acceptedSubmissions = problem.acceptedSubmissions || 0;
    
    if (totalSubmissions === 0) return 0;
    
    return (acceptedSubmissions / totalSubmissions) * 100;
  }

  private formatAcceptance(rate: number): number {
    return Math.round(rate * 10) / 10;
  }

  private sortByAcceptance(problems: ProblemListItemDto[], sortBy: 'acceptance-asc' | 'acceptance-desc'): void {
    if (sortBy === 'acceptance-asc') {
      problems.sort((a, b) => a.acceptance - b.acceptance);
    } else if (sortBy === 'acceptance-desc') {
      problems.sort((a, b) => b.acceptance - a.acceptance);
    }
  }
}
