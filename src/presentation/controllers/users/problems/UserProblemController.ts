




import { Request, Response } from 'express';
import { GetProblemsListUseCase } from '../../../..***REMOVED***msListUseCase';
import { GetProblemByIdUseCase } from '../../../..***REMOVED***mByIdUseCase';
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
                category,
                tags,
                sortBy = 'createdAt',
                sortOrder = 'asc'
            } = req.query;


            const filters = {
                status: 'Published' as const,
                search: search as string,
                difficulty: difficulty as 'easy' | 'medium' | 'hard',
                category: category as string,
                tags: Array.isArray(tags) ? tags as string[] : tags ? [tags as string] : [],
                page: parseInt(page as string, 10) || 1,
                limit: Math.min(parseInt(limit as string, 10) || 10, 100),
                sortBy: sortBy as string,
                sortOrder: sortOrder as 'asc' | 'desc'
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
            console.log("params id",problemId);
            
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
