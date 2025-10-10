import { IHttpResponse } from '../interfaces/IHttpResponse';

export class HttpResponse implements IHttpResponse {
    constructor(public statusCode: number, public body: any) { }
}