import { IProblemRepository } from '../../interfaces/IProblemRepository';
import { ProblemResponseDto } from '../../dto/problems/ProblemResponseDto';
import { ITestCaseRepository } from '../../interfaces/ITestCaseRepository';

export class GetProblemByIdUseCase {
    constructor(private problemRepository: IProblemRepository,
        private testCaseRepository: ITestCaseRepository
    ) { }

    async execute(problemId: string): Promise<ProblemResponseDto> {

        const problem = await this.problemRepository.findById(problemId);

        if (!problem || !problem.isActive) {
            throw new Error('Problem not found');
        }

        const sampleTestCases = await this.testCaseRepository.findSampleByProblemId(problemId);
        

        return {
           problem,
           sampleTestCases
        };
    }
}
