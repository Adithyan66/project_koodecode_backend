



import { ContestListType } from '../../../../application/usecases/contests/user/GetContestsListUseCase';
import { HTTP_STATUS } from '../../../../shared/constants/httpStatus';
import { MESSAGES } from '../../../../shared/constants/messages';
import { IHttpRequest } from '../../interfaces/IHttpRequest';
import { BadRequestError, UnauthorizedError } from '../../../../application/errors/AppErrors';
import { HttpResponse } from '../../helper/HttpResponse';
import { buildResponse } from '../../../../infrastructure/utils/responseBuilder';
import { MissingFieldsError } from '../../../../domain/errors/AuthErrors';
import { IGetContestDetailUseCase, IGetContestLeaderboardUseCase, IGetContestsListUseCase, IRegisterForContestUseCase, IStartContestProblemUseCase, ISubmitContestSolutionUseCase } from '../../../../application/interfaces/IContestUseCase';
import { inject, injectable } from 'tsyringe';
import { IUserContestController } from '../../interfaces/IUserContestController';



@injectable()
export class UserContestController implements IUserContestController {
    constructor(
        @inject('IRegisterForContestUseCase') private _registerForContestUseCase: IRegisterForContestUseCase,
        @inject('IStartContestProblemUseCase') private _startContestProblemUseCase: IStartContestProblemUseCase,
        @inject('IGetContestLeaderboardUseCase') private _getContestLeaderboardUseCase: IGetContestLeaderboardUseCase,
        @inject('IGetContestsListUseCase') private _getContestsListUseCase: IGetContestsListUseCase,
        @inject('IGetContestDetailUseCase') private _getContestDetailUseCase: IGetContestDetailUseCase,
        @inject('ISubmitContestSolutionUseCase') private _submitContestSolutionUseCase: ISubmitContestSolutionUseCase,
    ) { }


    registerForContest = async (httpRequest: IHttpRequest) => {

        const { contestId } = httpRequest.body;
        const userId = httpRequest.user?.userId;

        if (!userId) {
            throw new UnauthorizedError()
        }

        const participant = await this._registerForContestUseCase.execute(contestId, userId);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'Successfully registered for contest', { participant }),
        });
    }

    startContestProblem = async (httpRequest: IHttpRequest) => {

        const { contestNumber } = httpRequest.params;
        const userId = httpRequest.user?.userId;

        if (!userId) {
            throw new UnauthorizedError()
        }

        const problem = await this._startContestProblemUseCase.execute(+contestNumber, userId);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'Contest problem retrieved', problem),
        });
    }

    getLeaderboard = async (httpRequest: IHttpRequest) => {

        const { contestNumber } = httpRequest.params;

        const userId = httpRequest.user?.userId

        if (!userId) {
            throw new UnauthorizedError()
        }

        const leaderboard = await this._getContestLeaderboardUseCase.execute(+contestNumber, userId);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'Leaderboard retrieved', { leaderboard }),
        });
    }


    getActiveContests = async (httpRequest: IHttpRequest) => {

        const userId = httpRequest.user?.userId;
        const state = httpRequest.params.state as ContestListType

        if (!userId) {
            throw new UnauthorizedError()
        }

        const page = httpRequest.query?.page ? parseInt(httpRequest.query.page as string) : undefined;
        const limit = httpRequest.query?.limit ? parseInt(httpRequest.query.limit as string) : undefined;
        const search = httpRequest.query?.search as string | undefined;

        const result = await this._getContestsListUseCase.execute(state, userId, page, limit, search);

        const messages = {
            past: 'Past contests retrieved successfully',
            active: 'Active contests retrieved successfully',
            upcoming: 'Upcoming contests retrieved successfully'
        };

        const message = messages[state] || 'Contests fetched successfully';

        if (state === 'past') {
            return new HttpResponse(HTTP_STATUS.OK, {
                ...buildResponse(true, message, result),
            });
        }

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, message, { contests: result }),
        });
    }


    getContestDetail = async (httpRequest: IHttpRequest) => {

        const contestNumber = parseInt(httpRequest.params.contestNumber);

        if (isNaN(contestNumber) || contestNumber <= 0) {
            throw new BadRequestError()
        }

        const userId = httpRequest.user?.userId;
        const contest = await this._getContestDetailUseCase.execute(contestNumber, userId);

        if (!contest) {
            return new HttpResponse(HTTP_STATUS.OK, {
                ...buildResponse(true, MESSAGES.NOT_FOUND),
            });
        }

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'Contest details fetched successfully', { contest }),
        });
    }


    submitSolution = async (httpRequest: IHttpRequest) => {

        const { contestNumber, sourceCode, languageId, autoSubmit } = httpRequest.body;
        const userId = httpRequest.user?.userId || httpRequest.body.userId;

        if (!userId) {
            throw new UnauthorizedError()
        }

        if (!contestNumber || !sourceCode || !languageId) {
            throw new MissingFieldsError(["contestNumber", "sourceCode", "languageId"])
        }

        const result = await this._submitContestSolutionUseCase.execute(
            { contestNumber, sourceCode, languageId, autoSubmit },
            userId
        );

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'Contest details fetched successfully', result),
        });
    }

}
