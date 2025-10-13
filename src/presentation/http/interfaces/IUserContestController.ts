
import { IHttpRequest } from "./IHttpRequest";
import { IHttpResponse } from "./IHttpResponse";

export interface IUserContestController {
  registerForContest(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  startContestProblem(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  getLeaderboard(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  getActiveContests(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  getContestDetail(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  submitSolution(httpRequest: IHttpRequest): Promise<IHttpResponse>;
}
