

import { IHttpRequest } from "./IHttpRequest";
import { IHttpResponse } from "./IHttpResponse";

export interface IAdminProblemController {
  createProblem(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  getAllProblems(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  getAllLanguages(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  getProblemDetail(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  getProblemTestCases(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  updateProblem(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  updateTestCase(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  addTestCase(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  deleteTestCase(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  deleteProblem(httpRequest: IHttpRequest): Promise<IHttpResponse>;
}
