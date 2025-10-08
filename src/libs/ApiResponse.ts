import { Response as ExpressResponse } from "express";
import { json } from "zod";

class ApiResponse {
  static success<T>(
    res: ExpressResponse,
    status: number = 200,
    message: string = "Success",
    data?: T
  ) {
    const serializedData = data
      ? JSON.parse(
          JSON.stringify(data, (_, value) =>
            typeof value === "bigint" ? value.toString() : value
          )
        )
      : null;
    return res.status(status).json({
      status,
      message,
      data: serializedData,
    });
  }

  static error(
    res: ExpressResponse,
    status: number,
    message: string,
    errorType: string
  ) {
    return res.status(status).json({
      status,
      message,
      error: errorType,
    });
  }

  static badRequest(res: ExpressResponse, message: string) {
    return this.error(res, 400, message, "Bad Request");
  }

  static unauthorized(res: ExpressResponse, message: string) {
    return this.error(res, 401, message, "Authentication Error");
  }

  static forbidden(res: ExpressResponse, message: string) {
    return this.error(res, 403, message, "Authorization Error");
  }

  static notFound(res: ExpressResponse, message: string) {
    return this.error(res, 404, message, "Not Found");
  }

  static conflict(res: ExpressResponse, message: string) {
    return this.error(res, 409, message, "Conflict Error");
  }

  static validation(res: ExpressResponse, message: string) {
    return this.error(res, 422, message, "Validation Error");
  }

  static notAcceptable(res: ExpressResponse, message: string) {
    return this.error(res, 406, message, "Not Acceptable");
  }

  static internalServerError(res: ExpressResponse, message: string) {
    return this.error(res, 500, message, "Internal Server Error");
  }
}

export default ApiResponse;
