



import { IProblemRepository } from '../../../domain/interfaces/repositories/IProblemRepository';
import { ProblemListResponseDto } from '../../dto/problems/ProblemListDto';

export class GetProblemsListUseCase {

    constructor(private problemRepository: IProblemRepository) { }

    async execute(filters: {
        difficulty?: 'easy' | 'medium' | 'hard';
        search?: string;
        page?: number;
        limit?: number;
    } = {}): Promise<ProblemListResponseDto> {



        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const pagination = { page, limit }

        const result = await this.problemRepository.getFilteredProblems(filters, pagination);


        const problems = result.problems.map(problem => ({
            id: problem.id!,
            problemNumber: problem.problemNumber,
            title: problem.title,
            slug: problem.slug,
            difficulty: problem.difficulty,
            tags: problem.tags,
            likes: problem.likes.length,
            acceptanceRate: problem.acceptanceRate,
            totalSubmissions: problem.totalSubmissions,
            isActive: problem.isActive
        }));

        return {
            problems,
            total: result.total,
            page,
            limit,
            totalPages: Math.ceil(result.total / limit)
        };
    }
}
