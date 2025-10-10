


import { IHttpRequest } from "./IHttpRequest";
import { IHttpResponse } from "./IHttpResponse";

export interface IAuthController {
    requestOtp(httpRequest: IHttpRequest): Promise<IHttpResponse>;
    verifyOtpAndSignup(httpRequest: IHttpRequest): Promise<IHttpResponse>;
}
