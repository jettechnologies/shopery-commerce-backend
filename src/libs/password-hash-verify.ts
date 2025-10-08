import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "supersecret";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "refreshsecret";

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Compare password
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate Access Token
export function generateAccessToken(
  userId: string,
  role: string,
  email: string
) {
  return jwt.sign({ userId, role, email }, ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
}

// Generate Refresh Token
export function generateRefreshToken(
  userId: string,
  role: string,
  email: string
) {
  return jwt.sign({ userId, role, email }, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
}

// Verify Refresh Token
export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as {
    userId: string;
    role: string;
    email: string;
  };
}

//  verify access token
export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as {
    userId: string;
    role: string;
    email: string;
  };
}
