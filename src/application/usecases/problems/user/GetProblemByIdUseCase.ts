

import { IProblemRepository } from '../../../../domain/interfaces/repositories/IProblemRepository';
import { ProblemResponseDto } from '../../../dto/problems/ProblemResponseDto';
import { ITestCaseRepository } from '../../../../domain/interfaces/repositories/ITestCaseRepository';
import { ISubmissionRepository } from '../../../../domain/interfaces/repositories/ISubmissionRepository';
import { inject, injectable } from 'tsyringe';
import { IGetProblemByIdUseCase } from '../../../interfaces/IProblemUseCase';

import {
    ProblemNotFoundError,
    ProblemInactiveError,
    ProblemAccessError,
    TestCaseRetrievalError
} from '../../../../domain/errors/ProblemErrors';

import {
    NotFoundError,
    BadRequestError,
    UnauthorizedError
} from '../../../errors/AppErrors';




@injectable()
export class GetProblemByIdUseCase implements IGetProblemByIdUseCase {

    constructor(
        @inject('IProblemRepository') private problemRepository: IProblemRepository,
        @inject('ITestCaseRepository') private testCaseRepository: ITestCaseRepository,
        @inject('ISubmissionRepository') private submissionRepository: ISubmissionRepository
    ) { }

    async execute(slug: string, userId?: string): Promise<ProblemResponseDto> {

        try {

            this.validateInput(slug);

            const problem = await this.retrieveProblem(slug);

            this.validateProblemAccess(problem, slug);

            const sampleTestCases = await this.retrieveSampleTestCases(problem.id!);

            const userSubmissions = userId 
                ? await this.getUserSubmissions(userId, problem.id!) 
                : null;

            const response = this.buildResponse(problem, sampleTestCases, userId, userSubmissions);

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

    private async getUserSubmissions(userId: string, problemId: string) {
        try {
            const submissions = await this.submissionRepository.findByUserIdAndProblemId(userId, problemId);
            console.log('User submissions found:', submissions?.length || 0);
            console.log('Submissions:', JSON.stringify(submissions, null, 2));
            return submissions || [];
        } catch (error) {
            console.error('Error retrieving user submissions:', error);
            return [];
        }
    }

    private buildResponse(problem: any, sampleTestCases: any[], userId?: string, userSubmissions?: any[] | null): ProblemResponseDto {

        try {
            const hasUserLiked = userId ? problem.likes.includes(userId) : false;

            const isSolved = userSubmissions 
                ? userSubmissions.some(sub => sub.status === 'accepted')
                : false;

            let templates = problem.templates || {};

            if (userSubmissions && userSubmissions.length > 0) {
                templates = this.updateTemplatesWithUserCode(templates, userSubmissions);
            }

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
                    isSolved,
                    totalSubmissions: problem.totalSubmissions || 0,
                    acceptedSubmissions: problem.acceptedSubmissions || 0,
                    uniqueSolvers: problem.uniqueSolvers || 0,
                    averageSolveTime: problem.averageSolveTime || 0,
                    difficultyRating: problem.difficultyRating || 0,
                    lastSolvedAt: problem.lastSolvedAt,
                    acceptanceRate: problem.acceptanceRate,
                    hints: problem.hints || [],
                    companies: problem.companies || [],
                    isActive: problem.isActive,
                    functionName: problem.functionName,
                    returnType: problem.returnType,
                    parameters: problem.parameters || [],
                    supportedLanguages: problem.supportedLanguages || [],
                    templates: templates,
                    createdAt: problem.createdAt ?? new Date(),
                    updatedAt: problem.updatedAt ?? new Date(),
                },
                sampleTestCases: sampleTestCases || []
            };

            this.validateResponseStructure(response);

            return response;
        } catch (error) {
            console.error('Error building problem response:', error);
            throw new BadRequestError("Failed to format problem data");
        }
    }

    private updateTemplatesWithUserCode(templates: any, userSubmissions: any[]): any {
        console.log('Updating templates with user submissions...');
        console.log('Original templates:', JSON.stringify(templates, null, 2));
        console.log('User submissions count:', userSubmissions.length);

        const latestSubmissionsByLanguage = new Map<number, any>();

        userSubmissions.forEach(submission => {
            const languageId = submission.languageId;
            const existing = latestSubmissionsByLanguage.get(languageId);

            if (!existing || new Date(submission.createdAt) > new Date(existing.createdAt)) {
                latestSubmissionsByLanguage.set(languageId, submission);
            }
        });

        console.log('Latest submissions by language:', Array.from(latestSubmissionsByLanguage.entries()));

        const updatedTemplates = { ...templates };

        latestSubmissionsByLanguage.forEach((submission, languageId) => {
            const languageKey = String(languageId);
            console.log(`Checking language ${languageKey}, exists: ${!!updatedTemplates[languageKey]}`);
            if (updatedTemplates[languageKey]) {
                console.log(`Updating template for language ${languageKey}`);
                updatedTemplates[languageKey] = {
                    ...updatedTemplates[languageKey],
                    userFunctionSignature: submission.sourceCode
                };
            }
        });

        console.log('Updated templates:', JSON.stringify(updatedTemplates, null, 2));
        return updatedTemplates;
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
