import { Problem } from '../../../domain/entities/Problem';
import { IProblemRepository } from '../../interfaces/IProblemRepository';
import { CreateProblemDto } from '../../dto/problems/CreateProblemDto';

export class CreateProblemUseCase {
    constructor(private problemRepository: IProblemRepository) {}

    async execute(data: CreateProblemDto, adminId: string): Promise<Problem> {
        // Generate slug from title
        const slug = this.generateSlug(data.title);

        // Check if slug already exists
        const existingProblem = await this.problemRepository.findBySlug(slug);
        if (existingProblem) {
            throw new Error(`Problem with title "${data.title}" already exists`);
        }

        // Validate test cases
        if (!data.testCases || data.testCases.length === 0) {
            throw new Error('At least one test case is required');
        }

        const sampleTestCases = data.testCases.filter(tc => tc.isSample);
        if (sampleTestCases.length === 0) {
            throw new Error('At least one sample test case is required');
        }

        // Create problem entity
        const problem = new Problem(
            data.title,
            slug,
            data.difficulty,
            data.tags,
            data.description,
            data.constraints,
            data.examples,
            data.testCases.map(tc => ({
                ...tc,
                createdAt: new Date()
            })),
            [], // likes
            0, // totalSubmissions
            0, // acceptedSubmissions
            data.hints || [],
            data.companies || [],
            true, // isActive
            adminId
        );

        console.log("problem is ",problem)

        return await this.problemRepository.create(problem);
    }

    private generateSlug(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);
    }
}
