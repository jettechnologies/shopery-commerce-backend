// import { Router, type Application } from "express";
// import { AuthService } from "@/services/auth-service";
// // import { registerSchema, loginSchema } from "../schemas/authSchemas";
// import { CreateUserSchema, LoginUserSchema } from "@/schema/zod-schema";
// import ApiResponse from "@/libs/ApiResponse";

// const authRouter = Router();

// /**
//  * @swagger
//  * /auth/register:
//  *   post:
//  *     summary: Register a new user
//  *     tags:
//  *       - Auth
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/schemas/RegisterUser'
//  *     responses:
//  *       201:
//  *         description: User registered successfully
//  *       400:
//  *         description: Validation error
//  */

// authRouter.post("/register", async (req, res, next) => {
//   try {
//     const data = CreateUserSchema.parse(req.body);
//     const result = await AuthService.register(data);
//     // res.json(result);
//     return ApiResponse.success(
//       res,
//       201,
//       "User registered successfully",
//       result
//     );
//   } catch (err: any) {
//     // res.status(400).json({ error: err.message });
//     next(err);
//   }
// });

// authRouter.post("/login", async (req, res, next) => {
//   try {
//     const data = LoginUserSchema.parse(req.body);
//     const result = await AuthService.login(data);
//     res.json(result);
//   } catch (err: any) {
//     // res.status(401).json({ error: err.message });
//     next(err);
//   }
// });

// authRouter.post("/refresh", async (req, res, next) => {
//   try {
//     const { refreshToken } = req.body;
//     const result = await AuthService.refreshToken(refreshToken);
//     res.json(result);
//   } catch (err: any) {
//     // res.status(401).json({ error: err.message });
//     next(err);
//   }
// });

// authRouter.post("/logout", async (req, res, next) => {
//   try {
//     const { refreshToken } = req.body;
//     const result = await AuthService.logout(refreshToken);
//     res.json(result);
//   } catch (err: any) {
//     // res.status(400).json({ error: err.message });
//     next(err);
//   }
// });

// export default authRouter;

import { Router } from "express";
import { AuthService } from "@/services/auth-service";
import {
  CreateUserSchema,
  LoginUserSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "@/schema/zod-schema";
import ApiResponse from "@/libs/ApiResponse";

const authRouter = Router();

/**
 * @swagger
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
 *       properties:
 *         otp:
 *           type: string
 *           example: "123456"
 *         password:
 *           type: string
 *           example: "NewPassword123"
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUser'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
authRouter.post("/register", async (req, res, next) => {
  try {
    const data = CreateUserSchema.parse(req.body);
    const result = await AuthService.register(data);
    return ApiResponse.success(
      res,
      201,
      "User registered successfully",
      result
    );
  } catch (err) {
    next(err);
  }
});

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
authRouter.post("/login", async (req, res, next) => {
  try {
    const data = LoginUserSchema.parse(req.body);
    const result = await AuthService.login(data);
    return ApiResponse.success(res, 200, "Login successful", result);
  } catch (err) {
    next(err);
  }
});

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
authRouter.post("/forgot-password", async (req, res, next) => {
  try {
    const data = ForgotPasswordSchema.parse(req.body);
    const result = await AuthService.forgotPassword(data);
    return ApiResponse.success(res, 200, "OTP sent", result);
  } catch (err) {
    next(err);
  }
});

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
authRouter.post("/reset-password", async (req, res, next) => {
  try {
    const data = ResetPasswordSchema.parse(req.body);
    const result = await AuthService.resetPassword(data);
    return ApiResponse.success(res, 200, "Password reset successful", result);
  } catch (err) {
    next(err);
  }
});

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
authRouter.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await AuthService.refreshToken(refreshToken);
    return ApiResponse.success(res, 200, "Token refreshed", result);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout a user (invalidate refresh token)
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
 *         description: Logged out successfully
 */
authRouter.post("/logout", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await AuthService.logout(refreshToken);
    return ApiResponse.success(res, 200, "Logged out successfully", result);
  } catch (err) {
    next(err);
  }
});

export default authRouter;
