

import { HTTP_STATUS } from '../../../../shared/constants/httpStatus';
import { IHttpRequest } from '../../interfaces/IHttpRequest';
import { HttpResponse } from '../../helper/HttpResponse';
import { buildResponse } from '../../../../infrastructure/utils/responseBuilder';
import { BadRequestError, UnauthorizedError } from '../../../../application/errors/AppErrors';
import { ICreateProblemUseCase, IGetAllProblemsForAdminUseCase, IGetAllProgrammingLanguages, IGetProblemDetailForAdminUseCase } from '../../../../application/interfaces/IProblemUseCase';
import { inject, injectable } from 'tsyringe';
import { CreateProblemDto } from '../../../../application/dto/problems/CreateProblemDto';
import { IAdminProblemController } from '../../interfaces/IAdminProblemController';
import { AdminProblemsListRequestDto } from '../../../../application/dto/problems/AdminProblemListDto';
import { IGetProblemTestCasesForAdminUseCase } from '../../../../application/interfaces/ITestCaseUseCase';
import { TestCaseListRequestDto } from '../../../../application/dto/problems/TestCaseListDto';
import { IUpdateProblemUseCase } from '../../../../application/interfaces/IProblemUseCase';
import { UpdateProblemPayload } from '../../../../application/dto/problems/UpdateProblemDto';
import { IUpdateTestCaseUseCase } from '../../../../application/interfaces/ITestCaseUseCase';
import { UpdateTestCasePayload } from '../../../../application/dto/problems/UpdateTestCaseDto';
import { AddTestCasePayload } from '../../../../application/dto/problems/AddTestCaseDto';
import { IAddTestCaseUseCase, IDeleteTestCaseUseCase } from '../../../../application/interfaces/ITestCaseUseCase';
import { IDeleteProblemUseCase } from '../../../../application/interfaces/IProblemUseCase';




@injectable()
export class AdminProblemController implements IAdminProblemController {

    constructor(
        @inject('ICreateProblemUseCase') private _createProblemUseCase: ICreateProblemUseCase,
        @inject('IGetAllProblemsForAdminUseCase') private _getAllProblemsForAdminUseCase: IGetAllProblemsForAdminUseCase,
        @inject('IGetAllProgrammingLanguages') private _getAllProgrammingLanguages: IGetAllProgrammingLanguages,
       @inject('IGetProblemDetailForAdminUseCase') private _getProblemDetailForAdminUseCase : IGetProblemDetailForAdminUseCase,
       @inject('IGetProblemTestCasesForAdminUseCase') private _getProblemTestCasesForAdminUseCase: IGetProblemTestCasesForAdminUseCase,
       @inject('IUpdateProblemUseCase') private _updateProblemUseCase: IUpdateProblemUseCase,
       @inject('IUpdateTestCaseUseCase') private _updateTestCaseUseCase: IUpdateTestCaseUseCase,
        @inject('IAddTestCaseUseCase') private _addTestCaseUseCase: IAddTestCaseUseCase,
        @inject('IDeleteTestCaseUseCase') private _deleteTestCaseUseCase: IDeleteTestCaseUseCase,
        @inject('IDeleteProblemUseCase') private _deleteProblemUseCase: IDeleteProblemUseCase
    ) { }

    createProblem = async (httpRequest: IHttpRequest) => {

        if (!httpRequest.user || httpRequest.user.role !== 'admin') {
            throw new UnauthorizedError('Admin access required')
        }

        const {
            title,
            difficulty,
            tags,
            description,
            constraints,
            examples,
            isActive,
            functionName,
            returnType,
            parameters,
            testCases,
            hints,
            companies,
            templates,
            supportedLanguages
        } = httpRequest.body;


        if (!title || !difficulty || !description || !testCases || !templates || !supportedLanguages) {
            throw new BadRequestError('Missing required fields: title, difficulty, description, testCases')
        }

        const createProblemDto: CreateProblemDto = {
            title,
            difficulty,
            tags: tags || [],
            description,
            constraints: constraints || [],
            examples,
            testCases,
            hints: hints || [],
            companies: companies || [],
            isActive,
            functionName,
            returnType,
            parameters,
            templates,
            supportedLanguages
        };


        const problem = await this._createProblemUseCase.execute(
            createProblemDto,
            httpRequest.user.userId
        );

        return new HttpResponse(HTTP_STATUS.CREATED, {
            ...buildResponse(true, 'Problem Created succesfully', {
                id: problem.id,
                title: problem.title,
                slug: problem.slug,
                difficulty: problem.difficulty,
                isActive: problem.isActive,
                createdAt: problem.createdAt
            }),
        });
    }


    getAllProblems = async (httpRequest: IHttpRequest) => {

        const {
            page,
            limit,
            search,
            difficulty,
            status,
            sortBy,
            sortOrder
        } = httpRequest.query;

        const request: AdminProblemsListRequestDto = {
            page: page ? parseInt(page as string) : 1,
            limit: limit ? parseInt(limit as string) : 20,
            search: search as string,
            difficulty: difficulty as 'easy' | 'medium' | 'hard',
            status: status as 'active' | 'inactive',
            sortBy: sortBy as 'problemNumber' | 'title' | 'difficulty' | 'createdAt' | 'acceptanceRate' | 'totalSubmissions',
            sortOrder: sortOrder as 'asc' | 'desc'
        };

        if (request.page && request.page < 1) {
            throw new BadRequestError('Page must be greater than 0');
        }

        if (request.limit && (request.limit < 1 || request.limit > 100)) {
            throw new BadRequestError('Limit must be between 1 and 100');
        }

        if (request.difficulty && !['easy', 'medium', 'hard'].includes(request.difficulty)) {
            throw new BadRequestError('Invalid difficulty. Must be easy, medium, or hard');
        }

        if (request.status && !['active', 'inactive'].includes(request.status)) {
            throw new BadRequestError('Invalid status. Must be active or inactive');
        }

        const validSortFields = ['problemNumber', 'title', 'difficulty', 'createdAt', 'acceptanceRate', 'totalSubmissions'];
        if (request.sortBy && !validSortFields.includes(request.sortBy)) {
            throw new BadRequestError(`Invalid sortBy field. Must be one of: ${validSortFields.join(', ')}`);
        }

        if (request.sortOrder && !['asc', 'desc'].includes(request.sortOrder)) {
            throw new BadRequestError('Invalid sortOrder. Must be asc or desc');
        }

        const result = await this._getAllProblemsForAdminUseCase.execute(request);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'Problems retrieved successfully', result),
        });
    }

    getAllLanguages = async (httpRequest: IHttpRequest) => {

        const result = await this._getAllProgrammingLanguages.execute();

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'languages retrieved successfully', result),
        });
    }


    getProblemDetail = async (httpRequest: IHttpRequest) => {

        const { slug } = httpRequest.params;

        if (!slug) {
            throw new BadRequestError('Problem slug is required');
        }

        const result = await this._getProblemDetailForAdminUseCase.execute(slug);


        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'Problem details retrieved successfully', result),
        });

    }

    getProblemTestCases = async (httpRequest: IHttpRequest) => {

        const { slug } = httpRequest.params;
        const { page, limit, isSample } = httpRequest.query;

        if (!slug) {
            throw new BadRequestError('Problem slug is required');
        }

        const request: TestCaseListRequestDto = {
            slug,
            page: page ? parseInt(page as string) : 1,
            limit: limit ? parseInt(limit as string) : 10,
            isSample: isSample !== undefined ? isSample === 'true' : undefined
        };

        if (request.page && request.page < 1) {
            throw new BadRequestError('Page must be greater than 0');
        }

        if (request.limit && (request.limit < 1 || request.limit > 100)) {
            throw new BadRequestError('Limit must be between 1 and 100');
        }

        const result = await this._getProblemTestCasesForAdminUseCase.execute(request);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'Test cases retrieved successfully', result),
        });
    }

    updateProblem = async (httpRequest: IHttpRequest) => {

        if (!httpRequest.user || httpRequest.user.role !== 'admin') {
            throw new UnauthorizedError('Admin access required')
        }

        const { slug } = httpRequest.params;
        const updateData: UpdateProblemPayload = httpRequest.body;

        if (!slug) {
            throw new BadRequestError('Problem slug is required');
        }

        const result = await this._updateProblemUseCase.execute(slug, updateData, httpRequest.user.userId);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'Problem updated successfully', result),
        });
    }

    updateTestCase = async (httpRequest: IHttpRequest) => {
        
        if (!httpRequest.user || httpRequest.user.role !== 'admin') {
            throw new UnauthorizedError('Admin access required')
        }

        const { slug, testCaseId } = httpRequest.params;
        const updateData: UpdateTestCasePayload = httpRequest.body;

        if (!slug) {
            throw new BadRequestError('Problem slug is required');
        }

        if (!testCaseId) {
            throw new BadRequestError('Test case ID is required');
        }

        await this._updateTestCaseUseCase.execute(slug, testCaseId, updateData, httpRequest.user.userId);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'Test case updated successfully'),
        });
    }

    addTestCase = async (httpRequest: IHttpRequest) => {
        if (!httpRequest.user || httpRequest.user.role !== 'admin') {
            throw new UnauthorizedError('Admin access required')
        }

        const { slug } = httpRequest.params;
        const testCaseData: AddTestCasePayload = httpRequest.body;

        if (!slug) {
            throw new BadRequestError('Problem slug is required');
        }

        await this._addTestCaseUseCase.execute(slug, testCaseData, httpRequest.user.userId);

        return new HttpResponse(HTTP_STATUS.CREATED, {
            ...buildResponse(true, 'Test case added successfully'),
        });
    }

    deleteTestCase = async (httpRequest: IHttpRequest) => {
        if (!httpRequest.user || httpRequest.user.role !== 'admin') {
            throw new UnauthorizedError('Admin access required')
        }

        const { slug, testCaseId } = httpRequest.params;

        if (!slug) {
            throw new BadRequestError('Problem slug is required');
        }

        if (!testCaseId) {
            throw new BadRequestError('Test case ID is required');
        }

        await this._deleteTestCaseUseCase.execute(slug, testCaseId, httpRequest.user.userId);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'Test case deleted successfully'),
        });
    }

    deleteProblem = async (httpRequest: IHttpRequest) => {
        if (!httpRequest.user || httpRequest.user.role !== 'admin') {
            throw new UnauthorizedError('Admin access required')
        }

        const { slug } = httpRequest.params;

        if (!slug) {
            throw new BadRequestError('Problem slug is required');
        }

        await this._deleteProblemUseCase.execute(slug, httpRequest.user.userId);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'Problem deleted successfully'),
        });
    }


}







