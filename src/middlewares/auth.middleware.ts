// middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { UnauthorizedError, ForbiddenError } from "@/libs/AppError";
import { verifyAccessToken } from "@/libs/password-hash-verify";
import { prisma } from "@/prisma/client.js";

// export interface AuthRequest extends Request {
//   user?: { userId: string; role: string; email: string };
// }

// export function authGuard(
//   req: AuthRequest,
//   _res: Response,
//   next: NextFunction,
// ) {
//   const authHeader = req.headers["authorization"];

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return next(
//       new UnauthorizedError("Missing or invalid Authorization header"),
//     );
//   }

//   const token = authHeader.split(" ")[1];
//   const decoded = verifyAccessToken(token);

//   if (!decoded) {
//     return next(new UnauthorizedError("Invalid or expired token"));
//   }

//   req.user = {
//     userId: decoded.userId,
//     role: decoded.role,
//     email: decoded.email,
//   };
//   next();
// }

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
    email: string;
    sessionId: string;
  };
}

export async function authGuard(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(
        new UnauthorizedError("Missing or invalid Authorization header"),
      );
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return next(new UnauthorizedError("Invalid or expired token"));
    }

    const session = await prisma.userSession.findUnique({
      where: { sessionId: decoded.sessionId },
    });

    if (!session || session.revoked) {
      return next(new UnauthorizedError("Session revoked"));
    }

    if (session.expiresAt < new Date()) {
      return next(new UnauthorizedError("Session expired"));
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      email: decoded.email,
      sessionId: decoded.sessionId,
    };

    next();
  } catch {
    return next(new UnauthorizedError("Invalid or expired token"));
  }
}

export async function optionalAuthGuard(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers["authorization"];

    // ✅ No header → just continue (guest)
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) return next();

    const session = await prisma.userSession.findUnique({
      where: { sessionId: decoded.sessionId },
    });

    if (!session || session.revoked || session.expiresAt < new Date()) {
      return next();
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      email: decoded.email,
      sessionId: decoded.sessionId,
    };

    next();
  } catch {
    next();
  }
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
        new ForbiddenError("You do not have permission for this action"),
      );
    }

    // Ownership check (e.g. /users/:userId route)
    if (
      req.user.role === "user" &&
      req.params.userId &&
      req.user.userId !== req.params.userId
    ) {
      return next(
        new ForbiddenError("You cannot modify another user's resource"),
      );
    }

    next();
  };
}
