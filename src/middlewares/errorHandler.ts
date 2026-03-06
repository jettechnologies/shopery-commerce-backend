// // middlewares/errorHandler.ts
// middlewares/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import ApiResponse from "@/libs/ApiResponse.js";
import AppError, { ErrorType } from "@/libs/AppError.js";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error("🔥 Error:", err);

  // Zod validation
  if (err instanceof ZodError) {
    return ApiResponse.validation(
      res,
      err.issues.map((e) => e.message).join(", "),
    );
  }

  // App errors
  if (err instanceof AppError) {
    switch (err.errorType) {
      case ErrorType.NOT_FOUND:
        return ApiResponse.notFound(res, err.message);

      case ErrorType.BAD_REQUEST:
        return ApiResponse.badRequest(res, err.message);

      case ErrorType.CONFLICT:
        return ApiResponse.conflict(res, err.message);

      case ErrorType.UNAUTHORIZED:
        return ApiResponse.unauthorized(res, err.message);

      default:
        return ApiResponse.error(
          res,
          500,
          "Something went wrong",
          "Internal Server Error",
        );
    }
  }

  // Unknown errors
  return ApiResponse.internalServerError(
    res,
    err?.message || "Unexpected error occurred",
  );
}

// import { Request, Response, NextFunction } from "express";
// import ApiResponse from "@/libs/ApiResponse.js";
// import AppError from "@/libs/AppError.js";

// export function errorHandler(
//   err: any,
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) {
//   console.error("🔥 Error:", err);

//   if (err instanceof AppError) {
//     // Controlled (operational) error
//     return ApiResponse.error(res, err.statusCode, err.message, "AppError");
//   }

//   // Unknown/unexpected errors → Internal Server Error
// return ApiResponse.error(
//   res,
//   500,
//   "Something went wrong",
//   "Internal Server Error",
// );
// }
