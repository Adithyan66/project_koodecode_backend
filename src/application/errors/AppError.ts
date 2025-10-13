


export  class AppError extends Error {
    public readonly isOperational: boolean; // true = expected, safe to show to client
    public readonly details?: Record<string, string>; // optional extra info
    public readonly statusCode: number; // HTTP status

    constructor(
        message: string,
        statusCode: number,
        isOperational = true,
        details?: Record<string, string>
    ) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;

        Object.setPrototypeOf(this, new.target.prototype); 
        Error.captureStackTrace(this, this.constructor); 
    }
}
