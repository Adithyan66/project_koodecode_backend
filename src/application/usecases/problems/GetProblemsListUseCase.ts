import { IProblemRepository } from '../../interfaces/IProblemRepository';
import { ProblemListResponseDto } from '../../dto/problems/ProblemListDto';

export class GetProblemsListUseCase {
    constructor(private problemRepository: IProblemRepository) {}

    async execute(filters: {
        difficulty?: 'easy' | 'medium' | 'hard';
        tags?: string[];
        name?: string;  // NEW: Search parameter
        page?: number;
        limit?: number;
    } = {}): Promise<ProblemListResponseDto> {
        const page = filters.page || 1;
        const limit = filters.limit || 20;

        const result = await this.problemRepository.findAll({
            ...filters,
            isActive: true, // Only show active problems to users
            page,
            limit
        });

        const problems = result.problems.map(problem => ({
            id: problem.id!,
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
