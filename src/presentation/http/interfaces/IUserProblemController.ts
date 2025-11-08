

import { IHttpRequest } from "./IHttpRequest";
import { IHttpResponse } from "./IHttpResponse";

export interface IUserProblemController {
  getProblemsWithFilters(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  getProblemDetail(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  submitSolution(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  getSubmissionResult(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  runTestCase(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  getLanguages(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  getProblemNames(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  getListPageData(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  getUserSubmissionHistory(httpRequest: IHttpRequest): Promise<IHttpResponse>;
}
