
import { IHttpRequest } from "./IHttpRequest";
import { IHttpResponse } from "./IHttpResponse";

export interface IUserProfileController {
    getProfile(httpRequest: IHttpRequest): Promise<IHttpResponse>;
    updateProfile(httpRequest: IHttpRequest): Promise<IHttpResponse>;
    getPublicProfile(httpRequest: IHttpRequest): Promise<IHttpResponse>;
    getEditProfile(httpRequest: IHttpRequest): Promise<IHttpResponse>;
    generateUploadUrl(httpRequest: IHttpRequest): Promise<IHttpResponse>;
    confirmUpload(httpRequest: IHttpRequest): Promise<IHttpResponse>;
}
