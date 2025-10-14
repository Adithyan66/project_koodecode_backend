



import { inject, injectable } from 'tsyringe';
import { HttpResponse } from '../../helper/HttpResponse';
import { buildResponse } from '../../../../infrastructure/utils/responseBuilder';
import { IHealthController } from '../../interfaces/IHealthController';
import { HTTP_STATUS } from '../../../../shared/constants/httpStatus';
import { IJudge0HealthService } from '../../../../domain/interfaces/services/IJudge0HealthService';



@injectable()
export class HealthController implements IHealthController{

    constructor(
        @inject('IJudge0HealthService') private judge0HealthService: IJudge0HealthService
    ) { }

    checkJudge0Health = async () => {

        const health = await this.judge0HealthService.checkHealth();

        const statusCode = health.status === 'healthy' ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE;

        return new HttpResponse(statusCode, {
            ...buildResponse(true, '', {
                judge0: health,
                timestamp: new Date().toISOString()
            }),

        });
    }

    getSystemHealth = async () => {

        const judge0Health = await this.judge0HealthService.checkHealth();

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, '', {
                system: 'operational',
                judge0: judge0Health,
                timestamp: new Date().toISOString()
            })
        })

    }
}

