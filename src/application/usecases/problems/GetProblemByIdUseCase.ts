import { IProblemRepository } from '../../interfaces/IProblemRepository';
import { ProblemResponseDto } from '../../dto/problems/ProblemResponseDto';
import { ITestCaseRepository } from '../../interfaces/ITestCaseRepository';

export class GetProblemByIdUseCase {

    constructor(
        private problemRepository: IProblemRepository,
        private testCaseRepository: ITestCaseRepository
    ) { }

    async execute(problemId: string): Promise<ProblemResponseDto> {

        const problem = await this.problemRepository.findById(problemId);

        if (!problem || !problem.isActive) {
            throw new Error('Problem not found');
        }

        const sampleTestCases = await this.testCaseRepository.findSampleByProblemId(problemId);


        return {
            problem: {
                id: problem.id!,
                problemNumber: problem.problemNumber,
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
                functionName: problem.functionName,
                returnType: problem.returnType,
                parameters: problem.parameters,
                createdAt: problem.createdAt ?? new Date(),
                updatedAt: problem.updatedAt ?? new Date(),
            },
            sampleTestCases
        }
    }
}
