import { Request, Response } from "express";
import { AuthService } from "@/services/auth-service";
import {
  CreateUserSchema,
  LoginUserSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "@/schema/zod-schema";
import ApiResponse from "@/libs/ApiResponse";
import { handleError } from "@/libs/misc";
import { guestCartToken } from "@/utils/misc";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const data = CreateUserSchema.parse(req.body);

      const guestToken =
        (req.headers["x-guest-token"] as string) ||
        (req.cookies?.guestToken as string);

      const result = await AuthService.register({ ...data, guestToken });

      res.clearCookie(guestCartToken, { httpOnly: true, sameSite: "lax" });

      return ApiResponse.success(
        res,
        201,
        "User registered successfully",
        result,
      );
    } catch (err) {
      handleError(res, err);
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const data = LoginUserSchema.parse(req.body);
      const result = await AuthService.login(data);
      return ApiResponse.success(res, 200, "Login successful", result);
    } catch (err) {
      handleError(res, err);
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const data = ForgotPasswordSchema.parse(req.body);
      const result = await AuthService.forgotPassword(data);
      return ApiResponse.success(res, 200, "OTP sent", result);
    } catch (err) {
      handleError(res, err);
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const data = ResetPasswordSchema.parse(req.body);
      const result = await AuthService.resetPassword(data);
      return ApiResponse.success(res, 200, "Password reset successful", result);
    } catch (err) {
      handleError(res, err);
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refreshToken(refreshToken);
      return ApiResponse.success(res, 200, "Token refreshed", result);
    } catch (err) {
      handleError(res, err);
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.logout(refreshToken);
      return ApiResponse.success(res, 200, "Logged out successfully", result);
    } catch (err) {
      handleError(res, err);
    }
  }
}
