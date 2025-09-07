



import { IProblemRepository } from '../../interfaces/IProblemRepository';
import { ProblemListResponseDto } from '../../dto/problems/ProblemListDto';

export class GetProblemsListUseCase {
    
    constructor(private problemRepository: IProblemRepository) {}

    async execute(filters: {
        difficulty?: 'easy' | 'medium' | 'hard';
        tags?: string[];
        name?: string; 
        category?: string;
        search?: string;
        // status?: 'Published';
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    } = {}): Promise<ProblemListResponseDto> {

        

        const page = filters.page || 1;
        const limit = filters.limit || 20;

        const result = await this.problemRepository.findAll({
            ...filters,
            isActive: true,
            page,
            limit
        });
        

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
