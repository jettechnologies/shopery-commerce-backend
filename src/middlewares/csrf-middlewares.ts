import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import logger from "@/libs/logger.js";

const TOKEN_SECRET = process.env.CSRF_SECRET;
if (!TOKEN_SECRET) {
  logger.warn(
    "CSRF_SECRET is not set. Add it to your environment variables. Falling back to an insecure default — fix this before going to production.",
  );
}
const SECRET = TOKEN_SECRET ?? "must-set-csrf-secret-in-env";

// Generate a random token
const createCsrfToken = (): string => crypto.randomBytes(32).toString("hex");

// Hash the token using HMAC-SHA256
const hashToken = (token: string): string =>
  crypto.createHmac("sha256", SECRET).update(token).digest("hex");

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      csrfToken?: () => string;
    }
  }
}

const csrfMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for Bearer-token authenticated requests (mobile clients)
  // const authHeader = req.headers["authorization"];
  // if (authHeader?.startsWith("Bearer ")) {
  //   return next();
  // }

  // const isAuthRoute =
  //   req.path.startsWith("/shopery/auth/login") ||
  //   req.path.startsWith("/shopery/auth/register");

  const isAuthRoute = req.path.startsWith("/shopery/auth/");

  const isBearerAuth = req.headers.authorization?.startsWith("Bearer ");

  if (isAuthRoute || isBearerAuth) {
    return next();
  }

  if (req.method === "GET") {
    const rawToken = createCsrfToken();
    const hashed = hashToken(rawToken);

    // Store the HASH in a HttpOnly cookie so it can't be read by JS
    res.cookie("csrf_hash", hashed, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    // Expose the RAW token via a readable cookie so the client can send it back
    res.cookie("csrf_token", rawToken, {
      httpOnly: false,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    req.csrfToken = () => rawToken;
    return next();
  }

  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    // Client must echo back the raw token in X-CSRF-Token header
    const clientToken =
      (req.headers["x-csrf-token"] as string) || req.body?._csrf;
    const storedHash = req.cookies?.["csrf_hash"];

    if (!clientToken || !storedHash) {
      return res.status(403).json({ error: "Missing CSRF token" });
    }

    // Re-hash what the client sent and compare with stored hash
    const expectedHash = hashToken(clientToken);
    const valid = crypto.timingSafeEqual(
      Buffer.from(expectedHash, "hex"),
      Buffer.from(storedHash, "hex"),
    );

    if (!valid) {
      return res.status(403).json({ error: "Invalid CSRF token" });
    }
  }

  return next();
};

export default csrfMiddleware;
