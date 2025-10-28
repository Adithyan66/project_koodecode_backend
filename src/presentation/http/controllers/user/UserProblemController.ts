


import { HTTP_STATUS } from '../../../../shared/constants/httpStatus';
import { IHttpRequest } from '../../interfaces/IHttpRequest';
import { HttpResponse } from '../../helper/HttpResponse';
import { buildResponse } from '../../../../infrastructure/utils/responseBuilder';
import { BadRequestError, UnauthorizedError } from '../../../../application/errors/AppErrors';
import { MESSAGES } from '../../../../shared/constants/messages';
import { ProblemNamesRequestDto } from '../../../../application/dto/problems/ProblemNamesDto';
import { IUserProblemController } from '../../interfaces/IUserProblemController';
import { ICreateSubmissionUseCase, IGetLanguagesUseCase, IGetProblemByIdUseCase, IGetProblemNamesUseCase, IGetProblemsListUseCase, IGetSubmissionResultUseCase, IRunCodeUseCase, IGetListPageDataUseCase } from '../../../../application/interfaces/IProblemUseCase';
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
        @inject("IGetListPageDataUseCase") private _getListPageDataUseCase: IGetListPageDataUseCase
    ) { }

    getProblemsWithFilters = async (httpRequest: IHttpRequest) => {

        const {
            page = '1',
            limit = '10',
            search,
            difficulty,
            tags,
            languageId,
            status
        } = httpRequest.query;


        const parsedPage = parseInt(page as string, 10) || 1;
        const parsedLimit = Math.min(parseInt(limit as string, 10) || 10, 100);
        const parsedLanguageId = languageId ? parseInt(languageId as string, 10) : undefined;


        let parsedTags: string[] | undefined;
        if (tags && typeof tags === 'string') {
            parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        }

        const filters = {
            search: search as string,
            difficulty: difficulty as 'easy' | 'medium' | 'hard',
            tags: parsedTags,
            languageId: parsedLanguageId,
            status: status as "Draft" | "Published",
            page: parsedPage,
            limit: parsedLimit,
        };

        const result = await this._getProblemsListUseCase.execute(filters);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'Problems retrieved successfully', result),
        });
    }



    getProblemDetail = async (httpRequest: IHttpRequest) => {

        const { slug } = httpRequest.params;

        if (!slug) {
            throw new BadRequestError("problem id required")
        }

        const problemDetail = await this._getProblemDetailUseCase.execute(slug);

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

}
