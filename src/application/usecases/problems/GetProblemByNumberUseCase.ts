import { Problem } from '../../../domain/entities/Problem';
import { IProblemRepository } from '../../interfaces/IProblemRepository';

export class GetProblemByNumberUseCase {
    constructor(private problemRepository: IProblemRepository) {}

    async execute(problemNumber: number): Promise<Problem | null> {
        if (!Problem.isValidProblemNumber(problemNumber)) {
            throw new Error('Invalid problem number');
        }

        return await this.problemRepository.findByProblemNumber(problemNumber);
    }
}
