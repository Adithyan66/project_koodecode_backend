import { Request, Response } from 'express';
import { CreateProblemUseCase } from '../../../../application/usecases/problems/CreateProblemUseCase';
import { HTTP_STATUS } from '../../../../shared/constants/httpStatus';
import { diff } from 'util';
import { CreateProblemDto } from '../../../../application/dto/problems/CreateProblemDto';
import { GetProblemNamesUseCase } from '../../../../application/usecases/problems/GetProblemNamesUseCase';
import { ProblemNamesRequestDto } from '../../../../application/dto/problems/ProblemNamesDto';
// import { MESSAGES } from '../../../shared/constants/messages';

// interface AuthenticatedRequest extends Request {
//     user?: {
//         userId: string;
//         role: string;
//     };
// }

export class AdminProblemController {

    constructor(
        private createProblemUseCase: CreateProblemUseCase,
        private getProblemNameUseCase: GetProblemNamesUseCase
    ) { }

    async createProblem(req: Request, res: Response): Promise<void> {
        try {

            if (!req.user || req.user.role !== 'admin') {
                res.status(HTTP_STATUS.FORBIDDEN).json({
                    success: false,
                    message: 'Admin access required'
                });
                return;
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
            } = req.body;


            if (!title || !difficulty || !description || !testCases || !templates || !supportedLanguages) {

                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Missing required fields: title, difficulty, description, testCases'
                });
                return;
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


            const problem = await this.createProblemUseCase.execute(
                createProblemDto,
                req.user.userId
            );

            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: 'Problem created successfully',
                data: {
                    id: problem.id,
                    title: problem.title,
                    slug: problem.slug,
                    difficulty: problem.difficulty,
                    isActive: problem.isActive,
                    createdAt: problem.createdAt
                }
            });
        } catch (error: any) {
            const statusCode = error.message.includes('already exists')
                ? HTTP_STATUS.CONFLICT
                : HTTP_STATUS.INTERNAL_SERVER_ERROR;

            res.status(statusCode).json({
                success: false,
                message: error.message || "MESSAGES.INTERNAL_ERROR"
            });
        }
    }

    async getProblemNames(req: Request, res: Response) {


        try {
            console.log("worksssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss");

            if (!req.user || req.user.role !== 'admin') {
                res.status(HTTP_STATUS.FORBIDDEN).json({
                    success: false,
                    message: 'Admin access required'
                });
                return;
            }

            const requestDto: ProblemNamesRequestDto = {
                page: req.query.page ? parseInt(req.query.page as string) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
                search: req.query.search as string,
            };

            if (requestDto.page && (isNaN(requestDto.page) || requestDto.page < 1)) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Page must be a positive integer'
                });
                return;
            }

            if (requestDto.limit && (isNaN(requestDto.limit) || requestDto.limit < 1 || requestDto.limit > 50)) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Limit must be between 1 and 50'
                });
                return;
            }

            let data = await this.getProblemNameUseCase.execute(requestDto)

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "problem names fetched succesfully",
                data
            })
        } catch (error) {

        }
    }
}














