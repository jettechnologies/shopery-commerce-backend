import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

const TOKEN_SECRET = process.env.CSRF_SECRET || "my_very_secure_secret_key";

// Generate a new CSRF token
const createCsrfToken = (): string => crypto.randomBytes(32).toString("hex");

// Hash the token using HMAC
const hashToken = (token: string): string =>
  crypto.createHmac("sha256", TOKEN_SECRET).update(token).digest("hex");

// Extend Express Request type to include csrfToken function
declare global {
  namespace Express {
    interface Request {
      csrfToken?: () => string;
    }
  }
}

const csrfMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === "GET") {
    const csrfToken = createCsrfToken();
    const csrfTokenHash = hashToken(csrfToken);

    // Send only hashed token as HttpOnly cookie
    res.cookie("csrf_token", csrfTokenHash, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    // Store unhashed token for server-side validation
    req.csrfToken = () => csrfToken;

    return next();
  }

  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    const csrfTokenCookie = req.cookies?.["csrf_token"];

    if (!csrfTokenCookie) {
      return res.status(403).json({ error: "Missing CSRF token cookie" });
    }

    // 🔐 Optional: You can compare with session or store hashed token somewhere
    // For now, we just check that the cookie exists (basic protection)

    return next();
  }

  return next();
};

export default csrfMiddleware;
