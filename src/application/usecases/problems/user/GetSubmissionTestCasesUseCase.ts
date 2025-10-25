
import { inject, injectable } from 'tsyringe';
import { TestCase } from '../../../../domain/entities/TestCase';
import { ITestCaseRepository } from '../../../../domain/interfaces/repositories/ITestCaseRepository';


@injectable()
export class GetSubmissionTestCasesUseCase {

    constructor(
        @inject('ITestCaseRepository') private testCaseRepository: ITestCaseRepository
    ) { }

    async execute(problemId: string): Promise<TestCase[]> {
        return await this.testCaseRepository.findNonSampleByProblemId(problemId);
    }
}
