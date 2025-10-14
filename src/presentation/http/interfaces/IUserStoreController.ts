import { IHttpRequest } from "./IHttpRequest";
import { IHttpResponse } from "./IHttpResponse";



export interface IUserStoreController {
    getStoreItems(httpRequest: IHttpRequest): Promise<IHttpResponse>;
    purchaseItem(httpRequest: IHttpRequest): Promise<IHttpResponse>;
    getUserInventory(httpRequest: IHttpRequest): Promise<IHttpResponse>;
    checkItemOwnership(httpRequest: IHttpRequest): Promise<IHttpResponse>;
}
