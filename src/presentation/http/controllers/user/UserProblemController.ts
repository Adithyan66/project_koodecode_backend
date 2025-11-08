


import { HTTP_STATUS } from '../../../../shared/constants/httpStatus';
import { IHttpRequest } from '../../interfaces/IHttpRequest';
import { HttpResponse } from '../../helper/HttpResponse';
import { buildResponse } from '../../../../infrastructure/utils/responseBuilder';
import { BadRequestError, UnauthorizedError } from '../../../../application/errors/AppErrors';
import { MESSAGES } from '../../../../shared/constants/messages';
import { ProblemNamesRequestDto } from '../../../../application/dto/problems/ProblemNamesDto';
import { IUserProblemController } from '../../interfaces/IUserProblemController';
import { ICreateSubmissionUseCase, IGetLanguagesUseCase, IGetProblemByIdUseCase, IGetProblemNamesUseCase, IGetProblemsListUseCase, IGetSubmissionResultUseCase, IRunCodeUseCase, IGetListPageDataUseCase, IGetUserSubmissionHistoryUseCase } from '../../../../application/interfaces/IProblemUseCase';
import { inject, injectable } from 'tsyringe';




@injectable()
export class UserProblemController implements IUserProblemController {

    constructor(
        @inject("IGetProblemsListUseCase") private _getProblemsListUseCase: IGetProblemsListUseCase,
        @inject("IGetProblemByIdUseCase") private _getProblemDetailUseCase: IGetProblemByIdUseCase,
        @inject("ICreateSubmissionUseCase") private _submitCodeUseCase: ICreateSubmissionUseCase,
        @inject("IGetSubmissionResultUseCase") private _getSubmissionResultUseCase: IGetSubmissionResultUseCase,
        @inject("IRunCodeUseCase") private _runCodeUseCase: IRunCodeUseCase,
        @inject("IGetLanguagesUseCase") private _getLanguagesUseCase: IGetLanguagesUseCase,
        @inject("IGetProblemNamesUseCase") private _getProblemNamesUseCase: IGetProblemNamesUseCase,
        @inject("IGetListPageDataUseCase") private _getListPageDataUseCase: IGetListPageDataUseCase,
        @inject("IGetUserSubmissionHistoryUseCase") private _getUserSubmissionHistoryUseCase: IGetUserSubmissionHistoryUseCase
    ) { }

    getProblemsWithFilters = async (httpRequest: IHttpRequest) => {
        const userId = httpRequest.user?.userId;

        if (!userId) {
            throw new UnauthorizedError(MESSAGES.UNAUTHORIZED_ACCESS);
        }

        const {
            page,
            limit,
            search,
            difficulty,
            sortBy
        } = httpRequest.query;

        const parsedPage = page ? parseInt(page as string, 10) : undefined;
        const parsedLimit = limit ? Math.min(parseInt(limit as string, 10), 100) : undefined;

        const filters = {
            page: parsedPage,
            limit: parsedLimit,
            search: search as string,
            difficulty: difficulty as 'Easy' | 'Med.' | 'Hard' | 'all',
            sortBy: sortBy as 'none' | 'acceptance-asc' | 'acceptance-desc'
        };

        const result = await this._getProblemsListUseCase.execute(userId, filters);

        return new HttpResponse(HTTP_STATUS.OK, {
            success: true,
            data: result.data,
            pagination: result.pagination
        });
    }



    getProblemDetail = async (httpRequest: IHttpRequest) => {

        const { slug } = httpRequest.params;
        const userId = httpRequest.user?.userId;

        if (!slug) {
            throw new BadRequestError("problem id required")
        }

        const problemDetail = await this._getProblemDetailUseCase.execute(slug, userId);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'problem fetched successfully', problemDetail),
        });
    }


    submitSolution = async (httpRequest: IHttpRequest) => {

        const { problemId, sourceCode, languageId } = httpRequest.body;
        const userId = httpRequest.user?.userId;

        if (!userId) {
            throw new UnauthorizedError(MESSAGES.UNAUTHORIZED_ACCESS)
        }

        if (!problemId || !sourceCode || !languageId) {
            throw new BadRequestError("Problem ID, source code, and language ID are required")
        }

        const result = await this._submitCodeUseCase.execute({
            userId,
            problemId,
            sourceCode,
            languageId,
            submissionType: 'problem'
        });

        return new HttpResponse(HTTP_STATUS.CREATED, {
            ...buildResponse(true, 'Solution submitted successfully', result),
        });
    }


    getSubmissionResult = async (httpRequest: IHttpRequest) => {

        const { submissionId } = httpRequest.params;

        const result = await this._getSubmissionResultUseCase.execute(submissionId);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'submission result fetches successfully', result),
        });
    }


    runTestCase = async (httpRequest: IHttpRequest) => {

        const { problemId, sourceCode, languageId, testCases } = httpRequest.body;

        const userId = httpRequest.user?.userId;

        if (!userId) {
            throw new UnauthorizedError(MESSAGES.UNAUTHORIZED_ACCESS)
        }

        if (!problemId || !sourceCode || !languageId || !testCases) {
            throw new BadRequestError("Problem ID, source code,testCases and language ID are required")
        }

        const result = await this._runCodeUseCase.execute({
            problemId,
            sourceCode,
            languageId,
            testCases,
            userId
        });

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'testcases runs successfully', result),
        });
    }



    getLanguages = async (httpRequest: IHttpRequest) => {

        const languages = await this._getLanguagesUseCase.execute();

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'languages fetches successfully', languages),
        });
    }

    getProblemNames = async (httpRequest: IHttpRequest) => {

        const requestDto: ProblemNamesRequestDto = {
            page: httpRequest.query.page ? parseInt(httpRequest.query.page as string) : undefined,
            limit: httpRequest.query.limit ? parseInt(httpRequest.query.limit as string) : undefined,
            search: httpRequest.query.search as string
        };

        if (requestDto.page && (isNaN(requestDto.page) || requestDto.page < 1)) {
            throw new BadRequestError("Page must be a positive integer")
        }

        if (requestDto.limit && (isNaN(requestDto.limit) || requestDto.limit < 1 || requestDto.limit > 50)) {
            throw new BadRequestError("Limit must be between 1 and 50")
        }

        const result = await this._getProblemNamesUseCase.execute(requestDto);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'testcases runs successfully', {
                problems: result.problems,
                hasMore: result.pagination.hasMore,
                total: result.pagination.totalItems,
                currentPage: result.pagination.currentPage,
                totalPages: result.pagination.totalPages,
                limit: result.pagination.limit
            }),
        });
    }

    likeProblem = async (HttpRequest: IHttpRequest) => {

    }

    getListPageData = async (httpRequest: IHttpRequest) => {
        const userId = httpRequest.user?.userId;

        if (!userId) {
            throw new UnauthorizedError(MESSAGES.UNAUTHORIZED_ACCESS);
        }

        const result = await this._getListPageDataUseCase.execute(userId);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'List page data retrieved successfully', result),
        });
    }

    getUserSubmissionHistory = async (httpRequest: IHttpRequest) => {
        const userId = httpRequest.user?.userId;

        if (!userId) {
            throw new UnauthorizedError(MESSAGES.UNAUTHORIZED_ACCESS);
        }

        const { problemId } = httpRequest.params;
        const page = parseInt(httpRequest.query?.page as string) || 1;
        const limit = parseInt(httpRequest.query?.limit as string) || 10;

        if (!problemId) {
            throw new BadRequestError('Problem ID is required');
        }

        if (page < 1) {
            throw new BadRequestError('Page must be greater than 0');
        }

        if (limit < 1 || limit > 50) {
            throw new BadRequestError('Limit must be between 1 and 50');
        }

        const result = await this._getUserSubmissionHistoryUseCase.execute(userId, problemId, page, limit);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'Submission history retrieved successfully', result),
        });
    }

}
