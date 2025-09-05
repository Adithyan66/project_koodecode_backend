
// ***REMOVED***missionTestCasesUseCase.ts
import { TestCase } from '../../../domain/entities/TestCase';
import { ITestCaseRepository } from '../../interfaces/ITestCaseRepository';

export class GetSubmissionTestCasesUseCase {
    constructor(private testCaseRepository: ITestCaseRepository) {}

    async execute(problemId: string): Promise<TestCase[]> {
        return await this.testCaseRepository.findNonSampleByProblemId(problemId);
    }
}
