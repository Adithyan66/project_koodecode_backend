import { IHttpResponse } from "./IHttpResponse";


export interface IHealthController {
    checkJudge0Health(): Promise<IHttpResponse>;
    getSystemHealth(): Promise<IHttpResponse>;
}
