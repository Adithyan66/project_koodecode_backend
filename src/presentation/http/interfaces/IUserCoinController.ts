

import { IHttpRequest } from "./IHttpRequest";
import { IHttpResponse } from "./IHttpResponse";

export interface IUserCoinController {
  createOrder(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  completePurchase(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  getBalance(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  getTransactions(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  getStats(httpRequest: IHttpRequest): Promise<IHttpResponse>;
}
