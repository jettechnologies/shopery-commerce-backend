import { PrismaClient } from "@prisma/client";
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "@/libs/password-hash-verify";
import {
  CreateUserInput,
  LoginUserInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@/schema/zod-schema";
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from "@/libs/AppError";
import { EmailService, EmailTemplate } from "@/libs/EmailService";
import { GuestCartService } from "./guest-cart.service";

const prisma = new PrismaClient();

export class AuthService {
  static async register(data: CreateUserInput & { guestToken?: string }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) throw new ConflictError("Email already in use");

    const passwordHash = await hashPassword(data.password);

    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
      },
    });

    // Merge guest cart if token exists
    if (data.guestToken) {
      try {
        await GuestCartService.mergeIntoUserCart(
          data.guestToken,
          newUser.userId
        );
      } catch (err) {
        console.error("Failed to merge guest cart:", err);
      }
    }

    // Generate tokens
    const accessToken = generateAccessToken(
      newUser.userId,
      newUser.role,
      newUser.email
    );
    const refreshToken = generateRefreshToken(
      newUser.userId,
      newUser.role,
      newUser.email
    );

    await prisma.userSession.create({
      data: {
        userId: newUser.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await EmailService.sendMail({
      to: newUser.email,
      subject: "Welcome to Shopery Organic store 🎉",
      template: EmailTemplate.WELCOME,
      context: { name: data.name },
    });

    return {
      user: { id: newUser.userId, email: newUser.email },
      accessToken,
      refreshToken,
    };
  }

  // static async register(data: CreateUserInput) {
  //   const existingUser = await prisma.user.findUnique({
  //     where: { email: data.email },
  //   });
  //   // if (existingUser) throw new Error("Email already in use");
  //   if (existingUser) throw new ConflictError("Email already in use");

  //   const passwordHash = await hashPassword(data.password);

  //   const newUser = await prisma.user.create({
  //     data: {
  //       email: data.email,
  //       passwordHash,
  //       name: data.name,
  //     },
  //   });

  //   // Generate tokens
  //   const accessToken = generateAccessToken(newUser.userId, newUser.role);
  //   const refreshToken = generateRefreshToken(newUser.userId, newUser.role);

  //   // Store refresh token in DB
  //   await prisma.userSession.create({
  //     data: {
  //       userId: newUser.id,
  //       refreshToken,
  //       expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  //     },
  //   });

  //   await EmailService.sendMail({
  //     to: newUser.email,
  //     subject: "Welcome to Shopery Organic store 🎉",
  //     template: EmailTemplate.WELCOME,
  //     context: { name: data.name },
  //   });

  //   return {
  //     user: { id: newUser.userId, email: newUser.email },
  //     accessToken,
  //     refreshToken,
  //   };
  // }

  static async login(data: LoginUserInput) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new NotFoundError("Unregistered email");

    const isValid = await comparePassword(data.password, user.passwordHash!);
    if (!isValid) throw new UnauthorizedError("Invalid password");

    // Generate tokens
    const accessToken = generateAccessToken(user.userId, user.role, user.email);
    const refreshToken = generateRefreshToken(
      user.userId,
      user.role,
      user.email
    );

    // Store refresh token
    await prisma.userSession.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: { id: user.userId, email: user.email },
      accessToken,
      refreshToken,
    };
  }

  static async forgotPassword(data: ForgotPasswordInput) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new NotFoundError("User not found");

    // Generate OTP (6-digit numeric code)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save reset request
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        otp,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
      },
    });

    await EmailService.sendMail({
      to: user.email,
      subject: "Password Reset Request",
      template: EmailTemplate.PASSWORD_RESET,
      context: { otp },
    });

    return { message: "Password reset OTP sent to your email" };
  }

  //   reset password service
  static async resetPassword(data: ResetPasswordInput) {
    // Find password reset request by OTP and ensure it's not used yet
    const resetRequest = await prisma.passwordReset.findFirst({
      where: {
        otp: data.otp,
        used: false,
      },
      include: { user: true },
    });

    if (!resetRequest) {
      throw new UnauthorizedError("Invalid or expired OTP");
    }

    // Check expiry
    if (resetRequest.expiresAt < new Date()) {
      throw new UnauthorizedError("OTP expired");
    }

    // Hash the new password
    const newHash = await hashPassword(data.password);

    // Update user password and mark reset request as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRequest.userId },
        data: { passwordHash: newHash },
      }),

      // Mark reset request as used
      prisma.passwordReset.update({
        where: { id: resetRequest.id },
        data: { used: true },
      }),

      // Invalidate all refresh tokens / sessions
      prisma.userSession.deleteMany({
        where: { userId: resetRequest.userId },
      }),
    ]);

    return {
      message: "Password reset successful. All sessions have been logged out.",
    };
  }

  static async refreshToken(token: string) {
    const payload = verifyRefreshToken(token);

    const session = await prisma.userSession.findUnique({
      where: { refreshToken: token },
    });
    if (!session) throw new UnauthorizedError("Invalid refresh token");

    const sessionId = String(session.id);

    // If expired
    if (session.expiresAt < new Date()) {
      await prisma.session.delete({ where: { id: sessionId } });
      throw new Error("Refresh token expired");
    }

    // Issue new access token
    const accessToken = generateAccessToken(
      payload.userId,
      payload.role,
      payload.email
    );
    return { accessToken };
  }

  static async logout(refreshToken: string) {
    await prisma.userSession.deleteMany({ where: { refreshToken } });
    return { message: "Logged out successfully" };
  }
}
