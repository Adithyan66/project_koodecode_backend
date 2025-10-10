export interface IHttpRequest<B = any, H = any, P = any, Q = any, F = any> {
    body?: B;
    headers?: H;
    params?: P;
    query?: Q;
    file?: F;
}