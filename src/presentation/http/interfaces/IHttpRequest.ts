export interface IHttpRequest<B = any, H = any, P = any, Q = any, F = any, C = any> {
    user?: any;
    cookies?: C;
    body?: B;
    headers?: H;
    params?: P;
    query?: Q;
    file?: F;
    ip?: string;
    hostname?: string;
    protocol?: string;
}