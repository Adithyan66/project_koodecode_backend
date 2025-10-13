


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
import { ICreateProblemUseCase, ICreateSubmissionUseCase, IGetLanguagesUseCase, IGetProblemByIdUseCase, IGetProblemNamesUseCase, IGetProblemsListUseCase, IGetSubmissionResultUseCase, IRunCodeUseCase } from '../../../../application/interfaces/IProblemUseCase';
import { inject, injectable } from 'tsyringe';
import { CreateProblemUseCase } from '../../../../application/usecases/problems/CreateProblemUseCase';
import { CreateProblemDto } from '../../../../application/dto/problems/CreateProblemDto';
import { IAdminProblemController } from '../../interfaces/IAdminProblemController';




@injectable()
export class AdminProblemController implements IAdminProblemController {

    constructor(
        @inject('ICreateProblemUseCase') private _createProblemUseCase: ICreateProblemUseCase,
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

}














