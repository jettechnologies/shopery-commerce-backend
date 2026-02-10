import AppError from "./AppError";
import { ZodError } from "zod";
import { Response } from "express";
import ApiResponse from "./ApiResponse";
import { ErrorType } from "./AppError";

export function handleError(res: Response, err: any) {
  const error = err as AppError;
  if (err instanceof ZodError)
    return ApiResponse.validation(
      res,
      err.issues.map((e) => e.message).join(", "),
    );
  if (error.errorType === ErrorType.NOT_FOUND)
    return ApiResponse.notFound(res, error.message);
  if (error.errorType === ErrorType.BAD_REQUEST)
    return ApiResponse.badRequest(res, error.message);
  if (error.errorType === ErrorType.CONFLICT)
    return ApiResponse.conflict(res, error.message);
  if (error.errorType === ErrorType.UNAUTHORIZED)
    return ApiResponse.unauthorized(res, error.message);
  return ApiResponse.internalServerError(
    res,
    error.message || "Unexpected error occurred",
  );
}
