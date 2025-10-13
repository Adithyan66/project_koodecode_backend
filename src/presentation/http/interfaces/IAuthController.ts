


import { IHttpRequest } from "./IHttpRequest";
import { IHttpResponse } from "./IHttpResponse";


export interface IAuthController {
  requestOtp(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  verifyOtpAndSignup(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  login(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  validateUser(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  verifyToken(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  logoutUser(): Promise<IHttpResponse>;
  forgotRequestOtp(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  verifyOtp(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  forgotChangePassword(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  googleLogin(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  githubLogin(httpRequest: IHttpRequest): Promise<IHttpResponse>;
  changePassword(httpRequest: IHttpRequest): Promise<IHttpResponse>;
}
