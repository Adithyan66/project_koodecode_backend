




import { inject, injectable } from 'tsyringe';
import { IProblemRepository } from '../../../../domain/interfaces/repositories/IProblemRepository';
import { ProblemListResponseDto } from '../../../dto/problems/ProblemListDto';
import { IGetProblemsListUseCase } from '../../../interfaces/IProblemUseCase';

// Domain Value Objects
import { ProgrammingLanguage } from '../../../../domain/value-objects/ProgrammingLanguage';

// Domain Errors
import {
    InvalidPaginationError,
    InvalidFilterError,
    ProblemListRetrievalError,
    ProblemListProcessingError
} from '../../../../domain/errors/ProblemErrors';

// Application Errors
import {
    BadRequestError,
    NotFoundError,
    TransactionProcessingError
} from '../../../errors/AppErrors';

interface ProblemListFilters {
    difficulty?: 'easy' | 'medium' | 'hard';
    search?: string;
    page?: number;
    limit?: number;
    tags?: string[];
    languageId?: number;
    status?: "Draft" | "Published"
}

@injectable()
export class GetProblemsListUseCase implements IGetProblemsListUseCase {

    private readonly DEFAULT_PAGE = 1;
    private readonly DEFAULT_LIMIT = 20;
    private readonly MAX_LIMIT = 100;
    private readonly MIN_LIMIT = 1;
    private readonly MAX_SEARCH_LENGTH = 200;

    constructor(
        @inject('IProblemRepository') private problemRepository: IProblemRepository
    ) { }

    async execute(filters: ProblemListFilters = {}): Promise<ProblemListResponseDto> {
        try {
            // Validate and sanitize filters
            const validatedFilters = this.validateAndSanitizeFilters(filters);

            // Extract and validate pagination
            const pagination = this.validateAndExtractPagination(validatedFilters);

            // Retrieve problems from repository
            const result = await this.retrieveProblems(validatedFilters, pagination);

            // Process and transform results
            const transformedProblems = this.transformProblems(result.problems);

            // Build response
            const response = this.buildResponse(transformedProblems, result.total, pagination);

            return response;

        } catch (error) {
            if (error instanceof InvalidPaginationError ||
                error instanceof InvalidFilterError) {
                throw new BadRequestError(error.message);
            }

            if (error instanceof ProblemListRetrievalError) {
                throw new TransactionProcessingError(error.message);
            }

            if (error instanceof ProblemListProcessingError) {
                throw new TransactionProcessingError(error.message);
            }

            // Re-throw application errors as-is
            if (error instanceof BadRequestError ||
                error instanceof NotFoundError ||
                error instanceof TransactionProcessingError) {
                throw error;
            }

            // Handle unexpected errors
            console.error('Unexpected error in GetProblemsListUseCase:', error);
            throw new TransactionProcessingError("An unexpected error occurred while retrieving problems");
        }
    }

    private validateAndSanitizeFilters(filters: ProblemListFilters): ProblemListFilters {
        const sanitizedFilters: ProblemListFilters = {};

        // Validate difficulty
        if (filters.difficulty !== undefined) {
            const validDifficulties = ['easy', 'medium', 'hard'] as const;
            if (!validDifficulties.includes(filters.difficulty)) {
                throw new InvalidFilterError('difficulty', filters.difficulty, 'Must be easy, medium, or hard');
            }
            sanitizedFilters.difficulty = filters.difficulty;
        }

        // Validate and sanitize search
        if (filters.search !== undefined) {
            if (typeof filters.search !== 'string') {
                throw new InvalidFilterError('search', filters.search, 'Must be a string');
            }

            const trimmedSearch = filters.search.trim();
            if (trimmedSearch.length === 0) {
                // Empty search is allowed, just don't include it
            } else if (trimmedSearch.length > this.MAX_SEARCH_LENGTH) {
                throw new InvalidFilterError('search', filters.search, `Cannot exceed ${this.MAX_SEARCH_LENGTH} characters`);
            } else {
                // Basic sanitization - remove potentially dangerous characters
                const sanitizedSearch = trimmedSearch.replace(/[<>\"'&]/g, '');
                if (sanitizedSearch.length > 0) {
                    sanitizedFilters.search = sanitizedSearch;
                }
            }
        }

        // Validate tags
        if (filters.tags !== undefined) {
            if (!Array.isArray(filters.tags)) {
                throw new InvalidFilterError('tags', filters.tags, 'Must be an array of strings');
            }

            const validTags = filters.tags.filter(tag =>
                typeof tag === 'string' && tag.trim().length > 0 && tag.length <= 50
            );

            if (validTags.length > 10) {
                throw new InvalidFilterError('tags', filters.tags, 'Cannot filter by more than 10 tags');
            }

            if (validTags.length > 0) {
                sanitizedFilters.tags = validTags;
            }
        }

        // Validate language ID
        if (filters.languageId !== undefined) {
            if (!Number.isInteger(filters.languageId) || filters.languageId <= 0) {
                throw new InvalidFilterError('languageId', filters.languageId, 'Must be a positive integer');
            }

            if (!ProgrammingLanguage.isSupported(filters.languageId)) {
                throw new InvalidFilterError('languageId', filters.languageId, 'Unsupported programming language');
            }

            sanitizedFilters.languageId = filters.languageId;
        }

        // Validate status
        if (filters.status !== undefined) {
            const validStatuses = ["Draft", "Published"] as const;
            if (!validStatuses.includes(filters.status)) {
                throw new InvalidFilterError('status', filters.status, 'Must be active, inactive, or all');
            }
            sanitizedFilters.status = filters.status;
        }

        // Copy pagination parameters for separate validation
        sanitizedFilters.page = filters.page;
        sanitizedFilters.limit = filters.limit;

        return sanitizedFilters;
    }

    private validateAndExtractPagination(filters: ProblemListFilters): { page: number; limit: number } {
        let page = this.DEFAULT_PAGE;
        let limit = this.DEFAULT_LIMIT;

        // Validate page
        if (filters.page !== undefined) {
            if (!Number.isInteger(filters.page) || filters.page < 1) {
                throw new InvalidPaginationError('page', filters.page, 'Must be a positive integer starting from 1');
            }

            if (filters.page > 10000) {
                throw new InvalidPaginationError('page', filters.page, 'Page number too high (maximum: 10000)');
            }

            page = filters.page;
        }

        // Validate limit
        if (filters.limit !== undefined) {
            if (!Number.isInteger(filters.limit) || filters.limit < this.MIN_LIMIT) {
                throw new InvalidPaginationError('limit', filters.limit, `Must be an integer between ${this.MIN_LIMIT} and ${this.MAX_LIMIT}`);
            }

            if (filters.limit > this.MAX_LIMIT) {
                throw new InvalidPaginationError('limit', filters.limit, `Cannot exceed maximum limit of ${this.MAX_LIMIT}`);
            }

            limit = filters.limit;
        }

        return { page, limit };
    }

    private async retrieveProblems(filters: ProblemListFilters, pagination: { page: number; limit: number }) {
        try {
            const result = await this.problemRepository.getFilteredProblems(filters, pagination);

            if (!result) {
                throw new ProblemListRetrievalError('Repository returned null result');
            }

            if (!Array.isArray(result.problems)) {
                throw new ProblemListRetrievalError('Repository returned invalid problems array');
            }

            if (typeof result.total !== 'number' || result.total < 0) {
                throw new ProblemListRetrievalError('Repository returned invalid total count');
            }

            return result;

        } catch (error) {
            if (error instanceof ProblemListRetrievalError) {
                throw error;
            }

            console.error('Database error while retrieving problems:', error);
            throw new ProblemListRetrievalError('Database error occurred while fetching problems');
        }
    }

    private transformProblems(problems: any[]): any[] {
        try {
            return problems.map((problem, index) => {
                // Validate required fields
                if (!problem.id) {
                    throw new ProblemListProcessingError(`Problem at index ${index} missing required field: id`);
                }

                if (!problem.title || typeof problem.title !== 'string') {
                    throw new ProblemListProcessingError(`Problem at index ${index} missing or invalid title`);
                }

                if (!problem.slug || typeof problem.slug !== 'string') {
                    throw new ProblemListProcessingError(`Problem at index ${index} missing or invalid slug`);
                }

                return {
                    id: problem.id,
                    problemNumber: problem.problemNumber || 0,
                    title: problem.title,
                    slug: problem.slug,
                    difficulty: problem.difficulty || 'medium',
                    tags: Array.isArray(problem.tags) ? problem.tags : [],
                    likes: Array.isArray(problem.likes) ? problem.likes.length : 0,
                    acceptanceRate: typeof problem.acceptanceRate === 'number' ? problem.acceptanceRate : 0,
                    totalSubmissions: typeof problem.totalSubmissions === 'number' ? problem.totalSubmissions : 0,
                    isActive: typeof problem.isActive === 'boolean' ? problem.isActive : true
                };
            });
        } catch (error) {
            if (error instanceof ProblemListProcessingError) {
                throw error;
            }

            console.error('Error transforming problems:', error);
            throw new ProblemListProcessingError('Failed to process problem data');
        }
    }

    private buildResponse(
        problems: any[],
        total: number,
        pagination: { page: number; limit: number }
    ): ProblemListResponseDto {
        try {
            const totalPages = Math.ceil(total / pagination.limit);

            // Validate response structure
            if (!Array.isArray(problems)) {
                throw new ProblemListProcessingError('Invalid problems array in response');
            }

            if (pagination.page > totalPages && total > 0) {
                throw new InvalidPaginationError('page', pagination.page, `Page ${pagination.page} does not exist (total pages: ${totalPages})`);
            }

            return {
                problems,
                total,
                page: pagination.page,
                limit: pagination.limit,
                totalPages: Math.max(totalPages, 1), // Ensure at least 1 page even with 0 results
                hasNextPage: pagination.page < totalPages,
                hasPreviousPage: pagination.page > 1,
                // Additional metadata for better UX
                startIndex: ((pagination.page - 1) * pagination.limit) + 1,
                endIndex: Math.min(pagination.page * pagination.limit, total)
            };

        } catch (error) {
            if (error instanceof ProblemListProcessingError || error instanceof InvalidPaginationError) {
                throw error;
            }

            console.error('Error building response:', error);
            throw new ProblemListProcessingError('Failed to build response');
        }
    }
}
