

import { Request, Response } from 'express';
import { GetProblemNamesUseCase } from '../../../../application/usecases/problems/GetProblemNamesUseCase';
import { ProblemNamesRequestDto } from '../../../../application/dto/problems/ProblemNamesDto';
import { HTTP_STATUS } from '../../../../shared/constants/httpStatus';

export class ProblemNamesController {
  constructor(private getProblemNamesUseCase: GetProblemNamesUseCase) {}

  async getProblemNames(req: Request, res: Response): Promise<void> {
    
    try {
      const requestDto: ProblemNamesRequestDto = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        search: req.query.search as string
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

      const result = await this.getProblemNamesUseCase.execute(requestDto);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message:"problem names fetched succesfully ",
        data: {
          problems: result.problems,
          hasMore: result.pagination.hasMore,
          total: result.pagination.totalItems,
          currentPage: result.pagination.currentPage,
          totalPages: result.pagination.totalPages,
          limit: result.pagination.limit
        }
      });
    } catch (error) {
      console.error('Error getting problem names:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to get problem names'
      });
    }
  }
}
