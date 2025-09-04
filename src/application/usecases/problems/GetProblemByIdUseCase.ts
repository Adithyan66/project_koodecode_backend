import { IProblemRepository } from '../../interfaces/IProblemRepository';
import { ProblemResponseDto } from '../../dto/problems/ProblemResponseDto';

export class GetProblemByIdUseCase {
    constructor(private problemRepository: IProblemRepository) {}

    async execute(id: string): Promise<ProblemResponseDto> {        
        
        const problem = await this.problemRepository.findById(id);
        
        if (!problem || !problem.isActive) {
            throw new Error('Problem not found');
        }

        return {
            id: problem.id!,
            problemNumber:problem.problemNumber,
            title: problem.title,
            slug: problem.slug,
            difficulty: problem.difficulty,
            tags: problem.tags,
            description: problem.description,
            constraints: problem.constraints,
            examples: problem.examples,
            likes: problem.likes.length,
            totalSubmissions: problem.totalSubmissions,
            acceptedSubmissions: problem.acceptedSubmissions,
            acceptanceRate: problem.acceptanceRate,
            hints: problem.hints,
            companies: problem.companies,
            isActive: problem.isActive,
            createdAt: problem.createdAt!,
            updatedAt: problem.updatedAt!
        };
    }
}
