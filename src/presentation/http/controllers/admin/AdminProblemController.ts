


import { CreateSubmissionUseCase } from '../../../../application/usecases/submissions/CreateSubmissionUseCase';
import { GetSubmissionResultUseCase } from '../../../../application/usecases/submissions/GetSubmissionResultUseCase';
import { RunCodeUseCase } from '../../../../application/usecases/submissions/RunCodeUseCase';
import { GetLanguagesUseCase } from '../../../../application/usecases/submissions/GetLanguagesUseCase';




import { Request, Response } from 'express';
import { GetProblemsListUseCase } from '../../../../application/usecases/problems/GetProblemsListUseCase';
import { GetProblemByIdUseCase } from '../../../../application/usecases/problems/GetProblemByIdUseCase';
import { HTTP_STATUS } from '../../../../shared/constants/httpStatus';
import { IHttpRequest } from '../../interfaces/IHttpRequest';
import { HttpResponse } from '../../helper/HttpResponse';
import { buildResponse } from '../../../../infrastructure/utils/responseBuilder';
import { BadRequestError, UnauthorizedError } from '../../../../application/errors/AppErrors';
import { MESSAGES } from '../../../../shared/constants/messages';
import { ProblemNamesRequestDto } from '../../../../application/dto/problems/ProblemNamesDto';
import { GetProblemNamesUseCase } from '../../../../application/usecases/problems/GetProblemNamesUseCase';
import { IUserProblemController } from '../../interfaces/IUserProblemController';
import { ICreateProblemUseCase, ICreateSubmissionUseCase, IGetAllProblemsForAdminUseCase, IGetAllProgrammingLanguages, IGetLanguagesUseCase, IGetProblemByIdUseCase, IGetProblemNamesUseCase, IGetProblemsListUseCase, IGetSubmissionResultUseCase, IRunCodeUseCase } from '../../../../application/interfaces/IProblemUseCase';
import { inject, injectable } from 'tsyringe';
import { CreateProblemUseCase } from '../../../../application/usecases/problems/CreateProblemUseCase';
import { CreateProblemDto } from '../../../../application/dto/problems/CreateProblemDto';
import { IAdminProblemController } from '../../interfaces/IAdminProblemController';
import { AdminProblemsListRequestDto } from '../../../../application/dto/problems/AdminProblemListDto';
import { HttpRequest } from 'aws-sdk';




@injectable()
export class AdminProblemController implements IAdminProblemController {

    constructor(
        @inject('ICreateProblemUseCase') private _createProblemUseCase: ICreateProblemUseCase,
        @inject('IGetAllProblemsForAdminUseCase') private _getAllProblemsForAdminUseCase: IGetAllProblemsForAdminUseCase,
        @inject('IGetAllProgrammingLanguages') private _getAllProgrammingLanguages : IGetAllProgrammingLanguages
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
        console.log(result)
         return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'languages retrieved successfully', result),
        });
    }

}














