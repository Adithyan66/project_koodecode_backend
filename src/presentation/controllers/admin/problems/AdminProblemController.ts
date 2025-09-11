import { Request, Response } from 'express';
import { CreateProblemUseCase } from '../../../../application/usecases/problems/CreateProblemUseCase'; 
import { HTTP_STATUS } from '../../../../shared/constants/httpStatus';
import { diff } from 'util';
import { CreateProblemDto } from '../../../../application/dto/problems/CreateProblemDto'; 
// import { MESSAGES } from '../../../shared/constants/messages';

interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

export class AdminProblemController {
    constructor(private createProblemUseCase: CreateProblemUseCase) { }

    async createProblem(req: AuthenticatedRequest, res: Response): Promise<void> {
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
                // parameterConstraints,
                testCases,
                hints,
                companies
            } = req.body;


            if (!title || !difficulty || !description || !testCases) {
                console.log(title, difficulty, description, testCases);

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
                // parameterConstraints
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
}
