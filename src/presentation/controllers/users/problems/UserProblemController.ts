// import { Request, Response } from 'express';
// import { GetProblemsListUseCase } from '../../../..***REMOVED***msListUseCase';

// export class UserProblemController {
//     constructor(private getProblemsListUseCase: GetProblemsListUseCase) { }

//     async getProblemsWithFilters(req: Request, res: Response): Promise<void> {
//         try {

//             const {
//                 page = '1',
//                 limit = '10',
//                 search,
//                 difficulty,
//                 category,
//                 tags,
//                 sortBy = 'createdAt',
//                 sortOrder = 'desc'
//             } = req.query;

//             const filters: {
//                 search?: string;
//                 difficulty?: 'easy' | 'medium' | 'hard';
//                 category?: string;
//                 tags?: string[];
//                 status: 'Published';
//             } = { status: 'Published' };

//             if (search) filters.search = search as string;
//             if (difficulty) filters.difficulty = difficulty as 'easy' | 'medium' | 'hard';
//             if (category) filters.category = category as string;
//             if (tags) filters.tags = Array.isArray(tags) ? tags as string[] : [tags as string];


//             const pagination = {
//                 page: parseInt(page as string, 10) || 1,
//                 limit: Math.min(parseInt(limit as string, 10) || 10, 100),
//                 sortBy: sortBy as string,
//                 sortOrder: sortOrder as 'asc' | 'desc'
//             };

//             const result = await this.getProblemsListUseCase.execute(filters, pagination);

//             res.status(200).json({
//                 success: true,
//                 data: result,
//                 message: 'Problems retrieved successfully'
//             });

//         } catch (error) {
//             res.status(500).json({
//                 success: false,
//                 message: error.message
//             });
//         }
//     }
// }




import { Request, Response } from 'express';
import { GetProblemsListUseCase } from '../../../..***REMOVED***msListUseCase';

export class UserProblemController {
    constructor(private getProblemsListUseCase: GetProblemsListUseCase) { }

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
                sortOrder = 'desc'
            } = req.query;

            // console.log("query", page,
            //     limit,
            //     search,
            //     difficulty,
            //     category,
            //     tags,
            //     sortBy,
            //     sortOrder);

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
}
