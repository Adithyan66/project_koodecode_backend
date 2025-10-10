


import { Request, Response, NextFunction } from "express";
import { AppError } from "../../application/errors/AppError";
import { DomainError } from "../../domain/errors/DomainError";
import { mapDomainErrorToHttpError } from "../../shared/errors/ErrorMapper";

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  let handledError = err;

  if (err instanceof DomainError) {
    handledError = mapDomainErrorToHttpError(err);
  }

  if (handledError instanceof AppError) {
    const statusCode = (handledError as any).statusCode || 500;
    return res.status(statusCode).json({
      message: handledError.message,
      details: handledError.details || null,
    });
  }

  return res.status(500).json({ message: "Unexpected error" });
}
