// export default class AppError extends Error {
//   public readonly statusCode: number;
//   public readonly isOperational: boolean;

//   constructor(message: string, statusCode: number, isOperational = true) {
//     super(message);

//     Object.setPrototypeOf(this, new.target.prototype);
//     this.statusCode = statusCode;
//     this.isOperational = isOperational;

//     Error.captureStackTrace(this, this.constructor);
//   }
// }

export class AppError extends Error {
  public statusCode: number;
  public errorType: string;

  constructor(statusCode: number, message: string, errorType: string) {
    super(message);
    this.statusCode = statusCode;
    this.errorType = errorType;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad Request") {
    super(400, message, "Bad Request");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(401, message, "Authentication Error");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(403, message, "Authorization Error");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not Found") {
    super(404, message, "Not Found");
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(409, message, "Conflict Error");
  }
}
