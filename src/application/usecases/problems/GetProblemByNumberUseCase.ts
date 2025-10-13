

import { inject, injectable } from 'tsyringe';
import { Problem } from '../../../domain/entities/Problem';
import { IProblemRepository } from '../../../domain/interfaces/repositories/IProblemRepository';


@injectable()
export class GetProblemByNumberUseCase {
    constructor(
        @inject('IProblemRepository') private problemRepository: IProblemRepository
    ) { }

    async execute(problemNumber: number): Promise<Problem | null> {
        if (!Problem.isValidProblemNumber(problemNumber)) {
            throw new Error('Invalid problem number');
        }

        return await this.problemRepository.findByProblemNumber(problemNumber);
    }
}
