

import { Request, Response } from 'express';
import { RegisterForContestUseCase } from '../../../../application/usecases/contests/RegisterForContestUseCase';
import { StartContestProblemUseCase } from '../../../../application/usecases/contests/StartContestProblemUseCase';
import { GetContestLeaderboardUseCase } from '../../../../application/usecases/contests/GetContestLeaderboardUseCase';
import { ContestListType, GetContestsListUseCase } from '../../../../application/usecases/contests/GetContestsListUseCase';
import { HTTP_STATUS } from '../../../../shared/constants/httpStatus';
import { MESSAGES } from '../../../../shared/constants/messages';
import { GetContestDetailUseCase } from '../../../../application/usecases/contests/GetContestDetailUseCase';
import { SubmitContestSolutionUseCase } from '../../../../application/usecases/contests/SubmitContestSolutionUseCase';

export class UserContestController {
  constructor(
    private registerForContestUseCase: RegisterForContestUseCase,
    private startContestProblemUseCase: StartContestProblemUseCase,
    private getContestLeaderboardUseCase: GetContestLeaderboardUseCase,
    private getContestsListUseCase: GetContestsListUseCase,
    private getContestDetailUseCase: GetContestDetailUseCase,
    private submitContestSolutionUseCase: SubmitContestSolutionUseCase,
  ) { }

  async registerForContest(req: Request, res: Response): Promise<void> {

    try {
      const { contestId } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const participant = await this.registerForContestUseCase.execute(contestId, userId);

      res.status(200).json({
        success: true,
        message: 'Successfully registered for contest',
        data: participant
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async startContestProblem(req: Request, res: Response): Promise<void> {

    try {
      const { contestNumber } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const problem = await this.startContestProblemUseCase.execute(+contestNumber, userId);

      res.status(200).json({
        success: true,
        message: 'Contest problem retrieved',
        data: problem
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const { contestId } = req.params;

      const leaderboard = await this.getContestLeaderboardUseCase.execute(contestId);

      res.status(200).json({
        success: true,
        message: 'Leaderboard retrieved',
        data: leaderboard
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }


  async getActiveContests(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const state = req.params.state as ContestListType

      if (!userId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'User id required'
        });
        return
      }

      const contests = await this.getContestsListUseCase.execute(state, userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: contests,
        message: MESSAGES.SUCCESS_FETCH || 'Active contests fetched successfully'
      });

    } catch (error) {
      console.error('Error fetching active contests:', error);

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error instanceof Error ? error.message : MESSAGES.SERVER_ERROR || 'Internal server error'
      });
    }
  }


  async getContestDetail(req: Request, res: Response): Promise<void> {

    try {
      const contestNumber = parseInt(req.params.contestNumber);

      if (isNaN(contestNumber) || contestNumber <= 0) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Invalid contest number'
        });
        return;
      }

      const userId = req.user?.userId;
      const contest = await this.getContestDetailUseCase.execute(contestNumber, userId);

      if (!contest) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: MESSAGES.NOT_FOUND
        });
        return;
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        contest
      });
    } catch (error) {
      console.error('Error fetching contest detail:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.SERVER_ERROR
      });
    }
  }


  async submitSolution(req: Request, res: Response): Promise<void> {
    try {
      const { contestNumber, sourceCode, languageId } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      if (!contestNumber || !sourceCode || !languageId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Missing required fields: contestId, code, languageId'
        });
        return;
      }

      const result = await this.submitContestSolutionUseCase.execute(
        { contestNumber, sourceCode, languageId },
        userId
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result,
        message: result.message
      });

    } catch (error) {
      console.error('Contest solution submission error:', error);

      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error instanceof Error ? error.message : 'Contest submission failed'
      });
    }
  }



}
