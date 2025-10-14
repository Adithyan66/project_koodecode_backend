import { IHttpRequest } from "./IHttpRequest";
import { IHttpResponse } from "./IHttpResponse";

export interface IAdminContestController {
    createContest(httpRequest: IHttpRequest): Promise<IHttpResponse>;
}
