





import { CreateContestDto } from '../../../../application/dto/contests/CreateContestDto';
import { HTTP_STATUS } from '../../../../shared/constants/httpStatus';
import { UnauthorizedError } from '../../../../application/errors/AppErrors';
import { IHttpRequest } from '../../interfaces/IHttpRequest';
import { HttpResponse } from '../../helper/HttpResponse';
import { buildResponse } from '../../../../infrastructure/utils/responseBuilder';
import { inject, injectable } from 'tsyringe';
import { ICreateContestUseCase } from '../../../../application/interfaces/IContestUseCase';
import { IAdminContestController } from '../../interfaces/IAdminContestController';


@injectable()
export class AdminContestController implements IAdminContestController{

    constructor(
       @inject('ICreateContestUseCase') private createContestUseCase: ICreateContestUseCase
    ) { }

    createContest = async (httpRequest: IHttpRequest) => {


        const createContestDto: CreateContestDto = httpRequest.body;
        const adminUserId = httpRequest.user?.userId;

        if (!adminUserId) {
            throw new UnauthorizedError()
        }

        const contest = await this.createContestUseCase.execute(createContestDto, adminUserId);

        return new HttpResponse(HTTP_STATUS.CREATED, {
            ...buildResponse(true, 'contest Created succesfully', contest),
        });

    }
}
