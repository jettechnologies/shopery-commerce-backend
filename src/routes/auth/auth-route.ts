import { Router } from "express";
import { AuthController } from "@/controllers/auth/auth.controller";
import { authGuard } from "@/middlewares/auth.middleware";
import rateLimit from "express-rate-limit";

const authRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: "Too many login attempts. Please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 5 max attempts per hour for registration
  max: 5,
  message: "Too many registration attempts. Please try again after an hour.",
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 5 requests per 10 mins for OTP
  max: 5,
  message: "Too many OTP requests. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * tags:
 *   name: Auth
 *   description: Authentication and user management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterUser:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - name
 *       properties:
 *         email:
 *           type: string
 *           example: "john@example.com"
 *         password:
 *           type: string
 *           example: "Password123"
 *         name:
 *           type: string
 *           example: "John Doe"
 *
 *     VerifyEmail:
 *       type: object
 *       required:
 *         - otp
 *         - email
 *       properties:
 *         otp:
 *           type: string
 *           example: "1234"
 *         email:
 *           type: string
 *           example: "john@example.com"
 *
 *     ResendVerification:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           example: "john@example.com"
 *
 *     LoginUser:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: "john@example.com"
 *         password:
 *           type: string
 *           example: "Password123"
 *
 *     ForgotPassword:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           example: "john@example.com"
 *
 *     ResetPassword:
 *       type: object
 *       required:
 *         - otp
 *         - password
 *         - email
 *       properties:
 *         otp:
 *           type: string
 *           example: "1234"
 *         email:
 *           type: string
 *           example: "john@example.com"
 *         password:
 *           type: string
 *           example: "NewPassword123"
 *
 *     RegisterUserResponse:
 *       type: object
 *       properties:
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: "b231f010-daa1-42e3-bc87-984a0382b8d2"
 *             email:
 *               type: string
 *               example: "john@example.com"
 *         accessToken:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         refreshToken:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         guestCartMerged:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user (optionally merges guest cart)
 *     description: >
 *       Registers a new user account.
 *       If the request includes a `x-guest-token` header or `guestToken` cookie,
 *       the system will automatically merge the guest cart into the new user's active cart.
 *     tags: [Auth]
 *     parameters:
 *       - in: header
 *         name: x-guest-token
 *         schema:
 *           type: string
 *         required: false
 *         description: Guest cart token for merging into the new user's cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUser'
 *     responses:
 *       201:
 *         description: User registered successfully and cart merged (if applicable)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterUserResponse'
 *       400:
 *         description: Validation error or missing required fields
 *       409:
 *         description: Email already in use
 *       500:
 *         description: Internal server error
 */
authRouter.post("/register", registerLimiter, AuthController.register);

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify user email using OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyEmail'
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       401:
 *         description: Invalid or expired OTP
 */
authRouter.post("/verify-email", otpLimiter, AuthController.verifyEmail);

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     summary: Resend email verification OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResendVerification'
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *       404:
 *         description: User not found
 *       409:
 *         description: Maximum resend attempts reached
 */
authRouter.post("/resend-verification", otpLimiter, AuthController.resendOTP);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginUser'
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Invalid email or password
 */
authRouter.post("/login", loginLimiter, AuthController.login);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset (sends OTP to email)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPassword'
 *     responses:
 *       200:
 *         description: OTP sent to user email
 *       404:
 *         description: User not found
 */
authRouter.post("/forgot-password", otpLimiter, AuthController.forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPassword'
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid OTP or expired
 */
authRouter.post("/reset-password", otpLimiter, AuthController.resetPassword);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "your-refresh-token"
 *     responses:
 *       200:
 *         description: New access token issued
 *       401:
 *         description: Invalid or expired refresh token
 */
authRouter.post("/refresh", AuthController.refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout a user (invalidate refresh token)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
authRouter.post("/logout", authGuard, AuthController.logout);

export default authRouter;
