import { inject, injectable } from 'tsyringe';
import { ITestCaseRepository } from '../../../domain/interfaces/repositories/ITestCaseRepository';
import { IProblemRepository } from '../../../domain/interfaces/repositories/IProblemRepository';
import { TestCaseListRequestDto, TestCaseListResponseDto, TestCaseDto } from '../../dto/problems/TestCaseListDto';
import { IGetProblemTestCasesForAdminUseCase } from '../../interfaces/ITestCaseUseCase';
import { ProblemNotFoundError } from '../../../domain/errors/ProblemErrors';

@injectable()
export class GetProblemTestCasesForAdminUseCase implements IGetProblemTestCasesForAdminUseCase {
    
    private readonly DEFAULT_PAGE = 1;
    private readonly DEFAULT_LIMIT = 10;
    private readonly MAX_LIMIT = 100;

    constructor(
        @inject('ITestCaseRepository') private testCaseRepository: ITestCaseRepository,
        @inject('IProblemRepository') private problemRepository: IProblemRepository
    ) { }

    async execute(request: TestCaseListRequestDto): Promise<TestCaseListResponseDto> {

        const problem = await this.problemRepository.findBySlug(request.slug);
        if (!problem) {
            throw new ProblemNotFoundError(request.slug);
        }

        const page = request.page && request.page > 0 ? request.page : this.DEFAULT_PAGE;
        const limit = request.limit && request.limit > 0 && request.limit <= this.MAX_LIMIT 
            ? request.limit 
            : this.DEFAULT_LIMIT;

        const paginatedResult = await this.testCaseRepository.findByProblemIdPaginated(
            problem.id!,
            page,
            limit,
            request.isSample
        );

        const testCaseDtos: TestCaseDto[] = paginatedResult.testCases.map(tc => ({
            id: tc.id!,
            problemId: tc.problemId,
            inputs: tc.inputs,
            expectedOutput: tc.expectedOutput,
            isSample: tc.isSample,
            createdAt: tc.createdAt,
            updatedAt: tc.updatedAt
        }));

        return {
            testCases: testCaseDtos,
            totalCount: paginatedResult.totalCount,
            currentPage: paginatedResult.currentPage,
            totalPages: paginatedResult.totalPages,
            hasNextPage: paginatedResult.hasNextPage,
            hasPreviousPage: paginatedResult.hasPreviousPage
        };
    }
}
