




import { Request, Response } from 'express';
import { GetProblemsListUseCase } from '../../../../application/usecases/problems/GetProblemsListUseCase'; 
import { GetProblemByIdUseCase } from '../../../../application/usecases/problems/GetProblemByIdUseCase';
import { profileEnd } from 'console';

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
            const { problemId } = req.params;
            
            const problemDetail = await this.getProblemDetailUseCase.execute(problemId);

            res.status(200).json({
                success: true,
                message: "problem fetched succesfully",
                data: problemDetail
            });

        } catch (error) {
            console.log("problem error",error);
            
            res.status(404).json({
                success: false,
                message: error instanceof Error ? error.message : 'Problem not found'
            });
        }
    }

}
