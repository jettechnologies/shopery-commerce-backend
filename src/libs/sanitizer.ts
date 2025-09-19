import { Request, Response, NextFunction } from "express";
import validator from "validator";

/**
 * Custom sanitizer middleware to sanitize and escape inputs.
 * Helps protect against XSS attacks.
 */

// Helper function to sanitize each value
const sanitizeValue = (value: unknown): string | unknown => {
  if (value !== null && typeof value === "string") {
    // Trim excess spaces
    let sanitized = validator.trim(value);

    // Strip low ASCII chars (non-printable characters)
    sanitized = validator.stripLow(sanitized);

    // Escape HTML entities (<, >, &, ', ", /)
    sanitized = validator.escape(sanitized);

    return sanitized;
  }
  return value;
};

// Middleware function
export const sanitizer = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (req.body && typeof req.body === "object") {
    for (const property in req.body) {
      if (Object.prototype.hasOwnProperty.call(req.body, property)) {
        req.body[property] = sanitizeValue(req.body[property]);
      }
    }
  }
  next();
};
