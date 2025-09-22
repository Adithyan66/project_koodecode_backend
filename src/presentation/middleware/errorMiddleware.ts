

import { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/exceptions/AppError";

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  console.error("Unexpected Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};
