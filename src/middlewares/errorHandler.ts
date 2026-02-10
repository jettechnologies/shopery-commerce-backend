// middlewares/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import ApiResponse from "@/libs/ApiResponse.js";
import AppError from "@/libs/AppError.js";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error("🔥 Error:", err);

  if (err instanceof AppError) {
    // Controlled (operational) error
    return ApiResponse.error(res, err.statusCode, err.message, "AppError");
  }

  // Unknown/unexpected errors → Internal Server Error
  return ApiResponse.error(
    res,
    500,
    "Something went wrong",
    "Internal Server Error",
  );
}
