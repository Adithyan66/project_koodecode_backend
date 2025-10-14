

import { Request, Response } from 'express';
import { Judge0HealthService } from '../../infrastructure/services/Judge0HealthService';
import { HTTP_STATUS } from '../../shared/constants/httpStatus';

export class HealthController {

  constructor(
    private judge0HealthService: Judge0HealthService
  ) { }

  async checkJudge0Health(req: Request, res: Response): Promise<void> {
    try {
      const health = await this.judge0HealthService.checkHealth();

      const statusCode = health.status === 'healthy' ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE;

      res.status(statusCode).json({
        success: true,
        data: {
          judge0: health,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error: any) {
      res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
        success: false,
        message: 'Health check failed',
        error: error.message
      });
    }
  }

  async getSystemHealth(req: Request, res: Response): Promise<void> {
    try {
      const judge0Health = await this.judge0HealthService.checkHealth();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          system: 'operational',
          judge0: judge0Health,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'System health check failed',
        error: error.message
      });
    }
  }
}
