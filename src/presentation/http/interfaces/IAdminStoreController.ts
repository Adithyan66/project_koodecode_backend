import { IHttpRequest } from "./IHttpRequest";
import { IHttpResponse } from "./IHttpResponse";

export interface IAdminStoreController {
    getAllStoreItems(httpRequest: IHttpRequest): Promise<IHttpResponse>;
    updateStoreItem(httpRequest: IHttpRequest): Promise<IHttpResponse>;
    toggleStoreItemActive(httpRequest: IHttpRequest): Promise<IHttpResponse>;
}

