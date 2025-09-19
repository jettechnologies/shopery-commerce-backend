export const COOKIE_CONFIG = {
  httpOnly: true,
  sameSite: "strict",
  secure: process.env.NODE_ENV === "production",
  maxAge: 1 * 24 * 60 * 60 * 1000,
};
