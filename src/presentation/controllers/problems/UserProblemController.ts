import { Request, Response } from 'express';
import { GetProblemsListUseCase } from '../../../application/usecases/problems/GetProblemsListUseCase';
import { GetProblemByIdUseCase } from '../../../application/usecases/problems/GetProblemByIdUseCase';
import { HTTP_STATUS } from '../../../shared/constants/httpStatus';
// import { MESSAGES } from '../../../shared/constants/messages';

export class UserProblemController {
    constructor(
        private getProblemsListUseCase: GetProblemsListUseCase,
        private getProblemByIdUseCase: GetProblemByIdUseCase
    ) {}

    async getProblems(req: Request, res: Response): Promise<void> {
        try {
            const { difficulty, tags, name, page, limit } = req.query;  // NEW: name parameter

            const filters = {
                difficulty: difficulty as 'easy' | 'medium' | 'hard' | undefined,
                tags: tags ? (typeof tags === 'string' ? [tags] : tags as string[]) : undefined,
                name: name as string | undefined,  // NEW: name filter
                page: page ? parseInt(page as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined
            };

            const result = await this.getProblemsListUseCase.execute(filters);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Problems fetched successfully',
                data: result
            });
        } catch (error: any) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || "MESSAGES.INTERNAL_ERROR"
            });
        }
    }

    async getProblemById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Problem ID is required'
                });
                return;
            }

            const problem = await this.getProblemByIdUseCase.execute(id);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Problem fetched successfully',
                data: problem
            });
        } catch (error: any) {
            const statusCode = error.message === 'Problem not found' 
                ? HTTP_STATUS.NOT_FOUND 
                : HTTP_STATUS.INTERNAL_SERVER_ERROR;

            res.status(statusCode).json({
                success: false,
                message: error.message || "MESSAGES.INTERNAL_ERROR"
            });
        }
    }
}
