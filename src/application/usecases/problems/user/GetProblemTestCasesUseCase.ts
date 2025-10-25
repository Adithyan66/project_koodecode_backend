

import { inject, injectable } from 'tsyringe';
import { TestCase } from '../../../../domain/entities/TestCase';
import { ITestCaseRepository } from '../../../../domain/interfaces/repositories/ITestCaseRepository';



@injectable()
export class GetProblemTestCasesUseCase {
    
    constructor(
        @inject('ITestCaseRepository') private testCaseRepository: ITestCaseRepository
    ) { }

    async execute(problemId: string, samplesOnly: boolean = false): Promise<TestCase[]> {
        if (samplesOnly) {
            return await this.testCaseRepository.findSampleByProblemId(problemId);
        }
        return await this.testCaseRepository.findByProblemId(problemId);
    }
}

