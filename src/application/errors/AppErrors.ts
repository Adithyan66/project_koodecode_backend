
import { HTTP_STATUS } from "../../shared/constants/httpStatus";
import { AppError } from "./AppError";



export class BadRequestError extends AppError {

    public readonly statusCode = HTTP_STATUS.BAD_REQUEST;

    constructor(message = "Bad request", details?: Record<string, string>) {

        super(message, HTTP_STATUS.BAD_REQUEST, true, details);
    }
}

export class UnauthorizedError extends AppError {

    public readonly statusCode = HTTP_STATUS.BAD_REQUEST;

    constructor(message = "not authorized", details?: Record<string, string>) {

        super(message, HTTP_STATUS.BAD_REQUEST, true, details);
    }
}


export class NotFoundError extends AppError {

    public readonly statusCode = HTTP_STATUS.BAD_REQUEST;

    constructor(message = "not found", details?: Record<string, string>) {

        super(message, HTTP_STATUS.BAD_REQUEST, true, details);
    }
}
