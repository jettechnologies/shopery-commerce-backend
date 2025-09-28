// middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "@/libs/attach-jwt";
import { UnauthorizedError, ForbiddenError } from "@/libs/AppError";

export interface AuthRequest extends Request {
  user?: { userId: string; role: string };
}

export function authGuard(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new UnauthorizedError("Missing or invalid Authorization header")
    );
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token) as any;

  if (!decoded) {
    return next(new UnauthorizedError("Invalid or expired token"));
  }

  req.user = { userId: decoded.userId, role: decoded.role };
  next();
}

// Role-based + ownership guard
export function roleGuard(roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError("Unauthorized"));
    }

    // Role check
    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError("You do not have permission for this action")
      );
    }

    // Ownership check (e.g. /users/:userId route)
    if (
      req.user.role === "user" &&
      req.params.userId &&
      req.user.userId !== req.params.userId
    ) {
      return next(
        new ForbiddenError("You cannot modify another user's resource")
      );
    }

    next();
  };
}
