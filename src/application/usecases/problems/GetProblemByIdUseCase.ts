

import { IProblemRepository } from '../../../domain/interfaces/repositories/IProblemRepository';
import { ProblemResponseDto } from '../../dto/problems/ProblemResponseDto';
import { ITestCaseRepository } from '../../../domain/interfaces/repositories/ITestCaseRepository';
import { inject, injectable } from 'tsyringe';
import { IGetProblemByIdUseCase } from '../../interfaces/IProblemUseCase';

import {
    ProblemNotFoundError,
    ProblemInactiveError,
    ProblemAccessError,
    TestCaseRetrievalError
} from '../../../domain/errors/ProblemErrors';

import {
    NotFoundError,
    BadRequestError,
    UnauthorizedError
} from '../../errors/AppErrors';




@injectable()
export class GetProblemByIdUseCase implements IGetProblemByIdUseCase {

    constructor(
        @inject('IProblemRepository') private problemRepository: IProblemRepository,
        @inject('ITestCaseRepository') private testCaseRepository: ITestCaseRepository
    ) { }

    async execute(slug: string, userId?: string): Promise<ProblemResponseDto> {

        try {

            this.validateInput(slug);

            const problem = await this.retrieveProblem(slug);

            this.validateProblemAccess(problem, slug);

            const sampleTestCases = await this.retrieveSampleTestCases(problem.id!);

            const response = this.buildResponse(problem, sampleTestCases, userId);

            return response;

        } catch (error) {

            if (error instanceof ProblemNotFoundError) {
                throw new NotFoundError(error.message);
            }

            if (error instanceof ProblemInactiveError) {
                throw new NotFoundError(error.message);
            }

            if (error instanceof ProblemAccessError) {
                throw new UnauthorizedError(error.message);
            }

            if (error instanceof TestCaseRetrievalError) {
                throw new BadRequestError("Unable to load problem test cases");
            }

            if (error instanceof NotFoundError ||
                error instanceof BadRequestError ||
                error instanceof UnauthorizedError) {
                throw error;
            }

            console.error('Unexpected error in GetProblemByIdUseCase:', error);
            throw new BadRequestError("An unexpected error occurred while retrieving the problem");
        }
    }

    private validateInput(slug: string): void {
        if (!slug || slug.trim().length === 0) {
            throw new BadRequestError("Problem slug is required");
        }

        if (slug.length > 100) {
            throw new BadRequestError("Problem slug is too long");
        }

        const slugPattern = /^[a-z0-9-]+$/;
        if (!slugPattern.test(slug)) {
            throw new BadRequestError("Invalid problem slug format");
        }
    }

    private async retrieveProblem(slug: string) {

        try {
            const problem = await this.problemRepository.findBySlug(slug);

            if (!problem) {
                throw new ProblemNotFoundError(slug, 'slug');
            }

            return problem;
        } catch (error) {
            if (error instanceof ProblemNotFoundError) {
                throw error;
            }

            console.error('Database error while retrieving problem:', error);
            throw new ProblemNotFoundError(slug, 'slug');
        }
    }

    private validateProblemAccess(problem: any, slug: string): void {

        if (!problem.isActive) {
            throw new ProblemInactiveError(slug);
        }

        // Additional access checks can be added here

    }

    private async retrieveSampleTestCases(problemId: string) {
        try {
            if (!problemId) {
                throw new TestCaseRetrievalError("Invalid problem ID");
            }

            const sampleTestCases = await this.testCaseRepository.findSampleByProblemId(problemId);

            // Sample test cases are optional, but log if none found
            if (!sampleTestCases || sampleTestCases.length === 0) {
                console.warn(`No sample test cases found for problem ID: ${problemId}`);
                return [];
            }

            return sampleTestCases;
        } catch (error) {
            console.error('Error retrieving sample test cases:', error);
            throw new TestCaseRetrievalError(problemId);
        }
    }

    private buildResponse(problem: any, sampleTestCases: any[], userId?: string): ProblemResponseDto {

        try {
            const hasUserLiked = userId ? problem.likes.includes(userId) : false;

            const response: ProblemResponseDto = {
                problem: {
                    id: problem.id!,
                    problemNumber: problem.problemNumber,
                    title: problem.title,
                    slug: problem.slug,
                    difficulty: problem.difficulty,
                    tags: problem.tags || [],
                    description: problem.description,
                    constraints: problem.constraints || [],
                    examples: problem.examples || [],
                    likes: problem.likes?.length || 0,
                    hasUserLiked, 
                    totalSubmissions: problem.totalSubmissions || 0,
                    acceptedSubmissions: problem.acceptedSubmissions || 0,
                    acceptanceRate: problem.acceptanceRate,
                    hints: problem.hints || [],
                    companies: problem.companies || [],
                    isActive: problem.isActive,
                    functionName: problem.functionName,
                    returnType: problem.returnType,
                    parameters: problem.parameters || [],
                    supportedLanguages: problem.supportedLanguages || [],
                    templates: problem.templates || {},
                    createdAt: problem.createdAt ?? new Date(),
                    updatedAt: problem.updatedAt ?? new Date(),
                },
                sampleTestCases: sampleTestCases || []
            };

            // Validate response structure
            this.validateResponseStructure(response);

            return response;
        } catch (error) {
            console.error('Error building problem response:', error);
            throw new BadRequestError("Failed to format problem data");
        }
    }

    private validateResponseStructure(response: ProblemResponseDto): void {
        if (!response.problem) {
            throw new BadRequestError("Invalid problem response structure");
        }

        if (!response.problem.id || !response.problem.title || !response.problem.slug) {
            throw new BadRequestError("Missing required problem fields");
        }

        if (!Array.isArray(response.sampleTestCases)) {
            throw new BadRequestError("Invalid sample test cases format");
        }
    }
}
