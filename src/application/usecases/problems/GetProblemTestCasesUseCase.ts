

// ***REMOVED***blemTestCasesUseCase.ts
import { TestCase } from '../../../domain/entities/TestCase';
import { ITestCaseRepository } from '../../interfaces/ITestCaseRepository';

export class GetProblemTestCasesUseCase {
    constructor(private testCaseRepository: ITestCaseRepository) {}

    async execute(problemId: string, samplesOnly: boolean = false): Promise<TestCase[]> {
        if (samplesOnly) {
            return await this.testCaseRepository.findSampleByProblemId(problemId);
        }
        return await this.testCaseRepository.findByProblemId(problemId);
    }
}

