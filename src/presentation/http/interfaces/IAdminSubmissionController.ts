
import { IHttpRequest } from "./IHttpRequest";
import { IHttpResponse } from "./IHttpResponse";

export interface IAdminSubmissionController {
  getAllSubmissions(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  getSubmissionDetail(httpRequest: IHttpRequest): Promise<IHttpResponse>;
}

