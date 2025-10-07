import { Router } from "express";
import { AuthService } from "@/services/auth-service";
import { Request, Response, NextFunction } from "express";
import {
  CreateUserSchema,
  LoginUserSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "@/schema/zod-schema";
import ApiResponse from "@/libs/ApiResponse";
import { AppError, ErrorType } from "@/libs/AppError";
import { ZodError } from "zod";

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
// authRouter.post("/register", async (req, res, next) => {
//   try {
//     const data = CreateUserSchema.parse(req.body);
//     const result = await AuthService.register(data);
//     return ApiResponse.success(
//       res,
//       201,
//       "User registered successfully",
//       result
//     );
//   } catch (err) {
//     console.error(err, "error");

//     const error = err as AppError;

//     // Zod validation errors
//     if (err instanceof ZodError) {
//       const errors = err.issues.map((e) => e.message).join(", ");
//       return ApiResponse.validation(res, errors);
//     }

//     // Custom errors from your service (e.g. duplicate email)
//     if (error.errorType === ErrorType.CONFLICT) {
//       return ApiResponse.conflict(
//         res,
//         error.message || "User with this email already exists"
//       );
//     }

//     // Known auth errors
//     if (error.errorType === ErrorType.UNAUTHORIZED) {
//       return ApiResponse.unauthorized(
//         res,
//         error.message || "Unauthorized access"
//       );
//     }

//     // server error (500)
//     if (error.statusCode === 500) {
//       return ApiResponse.internalServerError(res, "Something went wrong");
//     }

//     // If it’s still not handled, send a generic bad request
//     return ApiResponse.badRequest(
//       res,
//       "Something went wrong during registration"
//     );
//   }
// });

authRouter.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse and validate body
      const data = CreateUserSchema.parse(req.body);

      // Extract guest token (from headers or cookies)
      const guestToken =
        (req.headers["x-guest-token"] as string) ||
        (req.cookies?.guestToken as string);

      // Pass token to AuthService
      const result = await AuthService.register({ ...data, guestToken });

      return ApiResponse.success(
        res,
        201,
        "User registered successfully",
        result
      );
    } catch (err) {
      console.error("Registration error:", err);

      // 🧩 Handle Zod validation errors
      if (err instanceof ZodError) {
        const errors = err.issues.map((e) => e.message).join(", ");
        return ApiResponse.validation(res, errors);
      }

      // 🧩 Custom app errors
      const error = err as AppError;

      if (error.errorType === ErrorType.CONFLICT) {
        return ApiResponse.conflict(
          res,
          error.message || "User with this email already exists"
        );
      }

      if (error.errorType === ErrorType.UNAUTHORIZED) {
        return ApiResponse.unauthorized(
          res,
          error.message || "Unauthorized access"
        );
      }

      if (error.statusCode === 500) {
        return ApiResponse.internalServerError(res, "Something went wrong");
      }

      // 🧩 Generic fallback
      return ApiResponse.badRequest(
        res,
        "Something went wrong during registration"
      );
    }
  }
);

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
    console.error(err, "error");

    const error = err as AppError;

    // Unauthorization error
    if (error.errorType === ErrorType.UNAUTHORIZED) {
      return ApiResponse.unauthorized(
        res,
        error.message || "Invalid email or password"
      );
    }

    // notFoundError
    if (error.errorType === ErrorType.NOT_FOUND) {
      return ApiResponse.notFound(res, error.message || "User not found");
    }

    // server error (500)
    if (error.statusCode === 500) {
      return ApiResponse.internalServerError(res, "Something went wrong");
    }

    // If it’s still not handled, send a generic bad request
    return ApiResponse.badRequest(res, "Something went wrong during login");
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
    console.error(err, "error");

    const error = err as AppError;

    // notFoundError
    if (error.errorType === ErrorType.NOT_FOUND) {
      return ApiResponse.notFound(res, "User not found");
    }

    // server error (500)
    if (error.statusCode === 500) {
      return ApiResponse.internalServerError(res, "Something went wrong");
    }

    // If it’s still not handled, send a generic bad request
    return ApiResponse.badRequest(
      res,
      "Something went wrong during forgot password"
    );
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
    console.error(err, "error");

    const error = err as AppError;

    // Unauthorization error
    if (error.errorType === ErrorType.UNAUTHORIZED) {
      return ApiResponse.unauthorized(res, error.message);
    }

    // notFoundError
    if (error.errorType === ErrorType.NOT_FOUND) {
      return ApiResponse.notFound(res, error.message || "User not found");
    }

    // server error (500)
    if (error.statusCode === 500) {
      return ApiResponse.internalServerError(res, "Something went wrong");
    }

    // If it’s still not handled, send a generic bad request
    return ApiResponse.badRequest(
      res,
      "Something went wrong during reset password"
    );
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
    console.error(err, "error");

    const error = err as AppError;

    // server error (500)
    if (error.statusCode === 500) {
      return ApiResponse.internalServerError(res, "Something went wrong");
    }

    // If it’s still not handled, send a generic bad request
    return ApiResponse.badRequest(
      res,
      "Something went wrong during reset password"
    );
  }
});

export default authRouter;
