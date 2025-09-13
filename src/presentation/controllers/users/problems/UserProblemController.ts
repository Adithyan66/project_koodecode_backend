




import { Request, Response } from 'express';
import { GetProblemsListUseCase } from '../../../../application/usecases/problems/GetProblemsListUseCase';
import { GetProblemByIdUseCase } from '../../../../application/usecases/problems/GetProblemByIdUseCase';
import { profileEnd } from 'console';
import { HTTP_STATUS } from '../../../../shared/constants/httpStatus';

export class UserProblemController {
    constructor(
        private getProblemsListUseCase: GetProblemsListUseCase,
        private getProblemDetailUseCase: GetProblemByIdUseCase
    ) { }

    async getProblemsWithFilters(req: Request, res: Response): Promise<void> {
        try {
            const {
                page = '1',
                limit = '10',
                search,
                difficulty,
            } = req.query;


            const filters = {
                isActive: true as const,
                search: search as string,
                difficulty: difficulty as 'easy' | 'medium' | 'hard',
                page: parseInt(page as string, 10) || 1,
                limit: Math.min(parseInt(limit as string, 10) || 10, 100),

            };

            const result = await this.getProblemsListUseCase.execute(filters);

            res.status(200).json({
                success: true,
                data: result,
                message: 'Problems retrieved successfully'
            });

        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }


    async getProblemDetail(req: Request, res: Response): Promise<void> {

        try {
            const { slug } = req.params;

            if (!slug) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: "problem id required",
                });
            }


            const problemDetail = await this.getProblemDetailUseCase.execute(slug);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "problem fetched succesfully",
                data: problemDetail
            });

        } catch (error) {
            console.log("problem error", error);

            res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: error instanceof Error ? error.message : 'Problem not found'
            });
        }
    }

}
