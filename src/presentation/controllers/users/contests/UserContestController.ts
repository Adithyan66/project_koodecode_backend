

import { Request, Response } from 'express';
import { RegisterForContestUseCase } from '../../../../application/usecases/contests/RegisterForContestUseCase';
import { StartContestProblemUseCase } from '../../../../application/usecases/contests/StartContestProblemUseCase';
import { GetContestLeaderboardUseCase } from '../../../../application/usecases/contests/GetContestLeaderboardUseCase';

export class UserContestController {
  constructor(
    private registerForContestUseCase: RegisterForContestUseCase,
    private startContestProblemUseCase: StartContestProblemUseCase,
    private getContestLeaderboardUseCase: GetContestLeaderboardUseCase
  ) {}

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
        message: 'Successfully registered for contest',
        data: participant
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async startContestProblem(req: Request, res: Response): Promise<void> {
    try {
      const { contestId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const problem = await this.startContestProblemUseCase.execute(contestId, userId);
      
      res.status(200).json({
        message: 'Contest problem retrieved',
        data: problem
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const { contestId } = req.params;
      
      const leaderboard = await this.getContestLeaderboardUseCase.execute(contestId);
      
      res.status(200).json({
        message: 'Leaderboard retrieved',
        data: leaderboard
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
