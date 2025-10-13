

import { IHttpRequest } from "./IHttpRequest";
import { IHttpResponse } from "./IHttpResponse";

export interface IAdminProblemController {
  createProblem(httpRequest: IHttpRequest): Promise<IHttpResponse>;
}
