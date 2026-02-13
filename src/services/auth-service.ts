import {
  bcryptHash,
  bcryptCompare,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "@/libs/password-hash-verify";
import {
  CreateUserInput,
  LoginUserInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
  ResendVerificationEmailInput,
} from "@/schema/zod-schema";
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from "@/libs/AppError";
import { EmailService, EmailTemplate } from "@/libs/EmailService";
import { GuestCartService } from "./guest-cart.service";
import { prisma } from "@/prisma/client.js";
import { generateOTP, OTP_TIMER } from "@/utils/misc";

export class AuthService {
  static async register(data: CreateUserInput & { guestToken?: string }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) throw new ConflictError("Email already in use");

    const passwordHash = await bcryptHash(data.password);

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
        await GuestCartService.mergeIntoUserCart(data.guestToken, newUser.id);
      } catch (err) {
        console.error("Failed to merge guest cart:", err);
      }
    }

    const otp = generateOTP();
    const otpHash = await bcryptHash(otp);

    // Generate tokens
    const accessToken = generateAccessToken(
      newUser.userId,
      newUser.role,
      newUser.email,
    );
    const refreshToken = generateRefreshToken(
      newUser.userId,
      newUser.role,
      newUser.email,
    );

    await prisma.$transaction([
      prisma.userSession.create({
        data: {
          userId: newUser.id,
          refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }),
      prisma.emailVerification.create({
        data: {
          userId: newUser.id,
          otpHash,
          expiresAt: OTP_TIMER,
        },
      }),
    ]);

    try {
      await EmailService.sendMail({
        to: newUser.email,
        subject: "Welcome to Shopery Organic store 🎉",
        template: EmailTemplate.OTP_VERIFICATION,
        context: {
          name: data.name,
          otp,
          expiry_time: "2 mintues",
        },
      });
    } catch (err) {
      console.error("Failed to send welcome email:", err);
    }

    return {
      user: { id: newUser.userId, email: newUser.email },
      accessToken,
      refreshToken,
    };
  }

  static async login(data: LoginUserInput) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new NotFoundError("Unregistered email");

    const isValid = await bcryptCompare(data.password, user.passwordHash!);
    if (!isValid) throw new UnauthorizedError("Invalid password");

    // Generate tokens
    const accessToken = generateAccessToken(user.userId, user.role, user.email);
    const refreshToken = generateRefreshToken(
      user.userId,
      user.role,
      user.email,
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

  static async verifyEmail({ otp, email }: VerifyEmailInput) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid or expired OTP");
    }

    if (user.isEmailVerified) {
      throw new ConflictError("Email already verified");
    }

    const record = await prisma.emailVerification.findFirst({
      where: {
        userId: user.id,
        used: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!record) {
      throw new UnauthorizedError("Invalid or expired OTP");
    }

    if (record.expiresAt < new Date()) {
      throw new UnauthorizedError("OTP expired");
    }

    const isValid = await bcryptCompare(otp, record.otpHash);

    if (!isValid) {
      throw new UnauthorizedError("Invalid or expired OTP");
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true },
      }),
      prisma.emailVerification.update({
        where: { id: record.id },
        data: { used: true },
      }),
    ]);

    try {
      await EmailService.sendMail({
        to: user.email,
        subject: "Email Verification Successful",
        template: EmailTemplate.WELCOME,
        context: {
          name: user.name,
        },
      });
    } catch (err) {
      console.error("Failed to send OTP email:", err);
    }

    return { message: "Email verified successfully" };
  }

  static async resendEmailVerification({
    email,
  }: ResendVerificationEmailInput) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundError("User not found");

    if (user.isEmailVerified) {
      throw new ConflictError("Email already verified");
    }

    const latestOtp = await prisma.emailVerification.findFirst({
      where: {
        userId: user.id,
        used: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (latestOtp) {
      const secondsSinceLastOtp =
        (Date.now() - latestOtp.createdAt.getTime()) / 1000;

      if (secondsSinceLastOtp < 60) {
        throw new ConflictError(
          `Please wait ${Math.ceil(60 - secondsSinceLastOtp)} seconds before requesting another OTP`,
        );
      }
    }

    const rawOtp = generateOTP();
    const hashedOtp = await bcryptHash(rawOtp);

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        otpHash: hashedOtp,
        expiresAt: new Date(Date.now() + 2 * 60 * 1000),
      },
    });

    try {
      await EmailService.sendMail({
        to: user.email,
        subject: "OTP Verification Resend",
        template: EmailTemplate.OTP_VERIFICATION,
        context: {
          name: user.name,
          otp: rawOtp,
          expiry_time: "2 minutes",
        },
      });
    } catch (err) {
      console.error("Failed to send OTP email:", err);
    }

    return { message: "OTP re-sent successfully" };
  }

  static async forgotPassword(data: ForgotPasswordInput) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new NotFoundError("User not found");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save reset request
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        otp,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
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

    if (resetRequest.expiresAt < new Date()) {
      throw new UnauthorizedError("OTP expired");
    }

    const newHash = await bcryptHash(data.password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRequest.userId },
        data: { passwordHash: newHash },
      }),

      prisma.passwordReset.update({
        where: { id: resetRequest.id },
        data: { used: true },
      }),

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
      payload.email,
    );
    return { accessToken };
  }

  static async logout(refreshToken: string) {
    await prisma.userSession.deleteMany({ where: { refreshToken } });
    return { message: "Logged out successfully" };
  }
}
