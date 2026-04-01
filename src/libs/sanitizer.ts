import { Request, Response, NextFunction } from "express";
import validator from "validator";

/**
 * Recursive sanitizer middleware — protects against XSS by escaping
 * HTML entities in all string fields, including nested objects and arrays.
 */

function sanitizeValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  if (typeof value === "string") {
    let sanitized = validator.trim(value);
    sanitized = validator.stripLow(sanitized);
    sanitized = validator.escape(sanitized);
    return sanitized;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (typeof value === "object") {
    const sanitizedObj: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>)) {
      sanitizedObj[key] = sanitizeValue(
        (value as Record<string, unknown>)[key],
      );
    }
    return sanitizedObj;
  }

  // numbers, booleans — pass through unchanged
  return value;
}

const sanitizer = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body);
  }
  next();
};

export default sanitizer;
