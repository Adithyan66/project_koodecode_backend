

import { inject, injectable } from 'tsyringe';
import { IProblemRepository } from '../../../../domain/interfaces/repositories/IProblemRepository';
import { ISubmissionRepository } from '../../../../domain/interfaces/repositories/ISubmissionRepository';
import { AdminProblemDetailResponse } from '../../../dto/problems/AdminProblem';
import { NotFoundError } from '../../../errors/AppErrors';
import { IGetProblemDetailForAdminUseCase } from '../../../interfaces/IProblemUseCase';

@injectable()
export class GetProblemDetailForAdminUseCase implements IGetProblemDetailForAdminUseCase {

    constructor(
        @inject('IProblemRepository') private problemRepository: IProblemRepository,
        @inject('ISubmissionRepository') private submissionRepository: ISubmissionRepository
    ) { }

    async execute(slug: string): Promise<AdminProblemDetailResponse> {

        const problem = await this.problemRepository.findBySlug(slug);
        if (!problem) {
            throw new NotFoundError('Problem Not found');
        }

        const submissionStats = await this.problemRepository.getSubmissionStatsByProblemId(problem.id!);

        const acceptanceRate = submissionStats.totalSubmissions > 0
            ? Math.round((submissionStats.acceptedSubmissions / submissionStats.totalSubmissions) * 100)
            : 0;

        // createdBy is populated as a User object
        const createdByUser = problem.createdBy as any;

        return new AdminProblemDetailResponse(
            problem.problemNumber,
            problem.title,
            problem.slug,
            problem.difficulty,
            problem.type,
            problem.tags,
            problem.description,
            problem.constraints,  // No mapping needed!
            problem.examples,     // No mapping needed!
            problem.hints,
            problem.companies,
            problem.isActive,
            problem.functionName,
            problem.returnType,
            problem.parameters,   // No mapping needed!
            problem.supportedLanguages,
            problem.templates,    // No mapping needed!
            {
                fullName: createdByUser.fullName,
                email: createdByUser.email,
                userName: createdByUser.userName,
                role: createdByUser.role
            },
            {
                totalSubmissions: submissionStats.totalSubmissions,
                acceptedSubmissions: submissionStats.acceptedSubmissions,
                acceptanceRate
            }
        );
    }
}
