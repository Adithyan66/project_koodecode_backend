

// // import { Request, Response, NextFunction } from "express";
// // import { AppError } from "../../application/errors/AppError";

// // export const errorMiddleware = (
// //   err: Error,
// //   req: Request,
// //   res: Response,
// //   next: NextFunction
// // ) => {
// //   if (err instanceof AppError) {
// //     return res.status(err.statusCode).json({
// //       success: false,
// //       message: err.message,
// //     });
// //   }

// //   console.error("Unexpected Error:", err);
// //   res.status(500).json({
// //     success: false,
// //     message: "Internal Server Error",
// //   });
// // };



// // presentation/http/middlewares/errorMiddleware.ts
// import { Request, Response, NextFunction } from "express";
// import { AppError } from "../../application/errors/AppError";
// import { ErrorMapper } from "../../application/errors/ErrorMapper";
// import { DomainError } from "../../domain/errors/DomainError";

// export const errorMiddleware = (
//   err: unknown,
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   // 1️⃣ Normalize error to AppError
//   let appError: AppError;

//   if (err instanceof AppError) {
//     // Already an AppError (application level)
//     appError = err;
//   } else if (err instanceof DomainError) {
//     // Map domain error → AppError
//     appError = ErrorMapper.toAppError(err);
//   } else if (err instanceof Error) {
//     // Unexpected generic JS error
//     appError = new AppError(
//       err.message || "Internal Server Error",
//       500,
//       false
//     );
//   } else {
//     // Unknown thrown type (non-error object)
//     appError = new AppError("Unknown error", 500, false);
//   }

//   // 2️⃣ Log errors depending on type
//   if (!appError.isOperational) {
//     console.error("Unexpected Error:", err); // dev logging
//   }

//   // 3️⃣ Send response
//   res.status(appError.statusCode).json({
//     success: false,
//     message: appError.message,
//     ...(appError.details ? { details: appError.details } : {}),
//   });
// };

