

import { Request, Response } from 'express';
import { CreateContestUseCase } from '../../../../application/usecases/contests/CreateContestUseCase';
import { CreateContestDto } from '../../../../application/dto/contests/CreateContestDto';
import { HTTP_STATUS } from '../../../../shared/constants/httpStatus';

export class AdminContestController {
  constructor(
    private createContestUseCase: CreateContestUseCase
  ) { }

  async createContest(req: Request, res: Response): Promise<void> {

    try {

      const createContestDto: CreateContestDto = req.body;
      const adminUserId = req.user?.userId;

      if (!adminUserId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      console.log("contessssssssssssssst",createContestDto);
      

      const contest = await this.createContestUseCase.execute(createContestDto, adminUserId);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Contest created successfully',
        data: contest
      });

    } catch (error: any) {
      
      console.log("error", error);

      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message
      });
    }
  }
}
