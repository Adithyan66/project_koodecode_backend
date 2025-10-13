

import { Request, Response, NextFunction } from "express";
import { AppError } from "../../../application/errors/AppError";
import { ErrorMapper } from "../../../application/errors/ErrorMapper";
import { DomainError } from "../../../domain/errors/DomainError";
import { HTTP_STATUS } from "../../../shared/constants/httpStatus";

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {

  console.error(" Error:", err);

  let appError: AppError;

  if (err instanceof AppError) {

    appError = err;

  } else if (err instanceof DomainError) {

    appError = ErrorMapper.toAppError(err);

  } else if (err instanceof Error) {

    appError = new AppError(
      err.message || "Internal Server Error",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      false
    );
  } else {

    appError = new AppError("Unknown error", HTTP_STATUS.INTERNAL_SERVER_ERROR, false);
  }
  console.log("appError.statusCode", appError.statusCode);


  if (!appError.isOperational) {
    console.error("Unexpected Error:", err);
  }

  res.status(appError.statusCode).json({
    success: false,
    message: appError.message,
    ...(appError.details ? { details: appError.details } : {}),
  });
};

