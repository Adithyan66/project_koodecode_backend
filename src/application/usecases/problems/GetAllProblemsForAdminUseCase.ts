


import { inject, injectable } from "tsyringe";
import { IGetAllProblemsForAdminUseCase } from "../../interfaces/IProblemUseCase";
import { IProblemRepository, ProblemSearchFilters } from "../../../domain/interfaces/repositories/IProblemRepository";
import { ITestCaseRepository } from "../../../domain/interfaces/repositories/ITestCaseRepository";
import { AdminProblemsListResponseDto, AdminProblemListDto, AdminProblemsListRequestDto } from "../../dto/problems/AdminProblemListDto";

@injectable()
export class GetAllProblemsForAdminUseCase implements IGetAllProblemsForAdminUseCase {
  constructor(
    @inject("IProblemRepository") private problemRepository: IProblemRepository,
    @inject("ITestCaseRepository") private testCaseRepository: ITestCaseRepository
  ) {}

  async execute(request: AdminProblemsListRequestDto): Promise<AdminProblemsListResponseDto> {

    try {
      const page = request.page || 1;
      const limit = Math.min(request.limit || 20, 100); 
      const sortBy = request.sortBy || 'problemNumber';
      const sortOrder = request.sortOrder || 'asc';

      const filters: ProblemSearchFilters = {
        search: request.search,
        difficulty: request.difficulty,
        status: request.status,
        page,
        limit,
        sortBy,
        sortOrder
      };

      const paginatedResult = await this.problemRepository.findAllForAdminWithFilters(filters);
      
      const problemsWithStats = await Promise.all(
        paginatedResult.problems.map(async (problem) => {
          const [submissionStats, testCaseCount] = await Promise.all([
            this.problemRepository.getSubmissionStatsByProblemId(problem.id!),
            this.testCaseRepository.countByProblemId(problem.id!)
          ]);
          console.log("status",submissionStats);
          
          const daysSinceCreation = Math.floor(
            (new Date().getTime() - problem.createdAt!.getTime()) / (1000 * 60 * 60 * 24)
          );

          const acceptanceRate = submissionStats.totalSubmissions > 0
            ? Math.round((submissionStats.acceptedSubmissions / submissionStats.totalSubmissions) * 100)
            : 0;

          return {
            id: problem.id!,
            problemNumber: problem.problemNumber,
            title: problem.title,
            slug: problem.slug,
            difficulty: problem.difficulty,
            totalSubmissions: submissionStats.totalSubmissions,
            acceptedSubmissions: submissionStats.acceptedSubmissions,
            acceptanceRate,
            totalTestCases: testCaseCount,
            status: problem.isActive ? 'active' as const : 'inactive' as const,
            createdBy: problem.createdBy,
            createdAt: problem.createdAt!,
            updatedAt: problem.updatedAt!,
            likesCount: problem.likes.length,
            supportedLanguagesCount: problem.supportedLanguages.length,
            tags: problem.tags,
            companies: problem.companies,
            daysSinceCreation
          } as AdminProblemListDto;
        })
      );

      // Sort by calculated fields if needed
      if (sortBy === 'acceptanceRate' || sortBy === 'totalSubmissions') {
        problemsWithStats.sort((a, b) => {
          const aValue = a[sortBy];
          const bValue = b[sortBy];
          return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
        });
      }

      // Get overall statistics
      const overallStats = await this.problemRepository.getOverallStats();
      const totalSubmissionsAcrossAll = problemsWithStats.reduce((sum, p) => sum + p.totalSubmissions, 0);
      const averageAcceptanceRate = problemsWithStats.length > 0
        ? Math.round(problemsWithStats.reduce((sum, p) => sum + p.acceptanceRate, 0) / problemsWithStats.length)
        : 0;

      return {
        problems: problemsWithStats,
        pagination: {
          currentPage: paginatedResult.currentPage,
          totalPages: paginatedResult.totalPages,
          totalCount: paginatedResult.totalCount,
          limit,
          hasNextPage: paginatedResult.hasNextPage,
          hasPreviousPage: paginatedResult.hasPreviousPage
        },
        summary: {
          totalProblems: overallStats.totalProblems,
          activeCount: overallStats.activeCount,
          inactiveCount: overallStats.inactiveCount,
          easyCount: overallStats.easyCount,
          mediumCount: overallStats.mediumCount,
          hardCount: overallStats.hardCount,
          averageAcceptanceRate,
          totalSubmissionsAcrossAll
        },
        filters: {
          search: request.search,
          difficulty: request.difficulty,
          status: request.status
        }
      };
    } catch (error) {
      throw error;
    }
  }
}
