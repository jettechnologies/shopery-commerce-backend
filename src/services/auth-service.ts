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

    // Generate refreshToken
    const refreshToken = generateRefreshToken(
      newUser.userId,
      newUser.role,
      newUser.email,
    );

    const refreshTokenHash = await bcryptHash(refreshToken);

    const session = await prisma.$transaction([
      prisma.userSession.create({
        data: {
          userId: newUser.id,
          refreshTokenHash,
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

    // Generate accessToken
    const accessToken = generateAccessToken({
      userId: newUser.userId,
      role: newUser.role,
      email: newUser.email,
      sessionId: session[0].sessionId,
    });

    EmailService.sendMail({
      to: newUser.email,
      subject: "Welcome to Shopery Organic store 🎉",
      template: EmailTemplate.OTP_VERIFICATION,
      context: {
        name: data.name,
        otp,
        expiry_time: "2 mintues",
      },
    }).catch((err) => {
      console.error("Failed to send welcome email:", err);
    });

    return {
      user: { id: newUser.userId, email: newUser.email, name: newUser.name },
      accessToken,
      refreshToken,
    };
  }

  static async login(data: LoginUserInput) {
    // const user = await prisma.user.findUnique({
    //   where: { email: data.email, isEmailVerified: true },
    // });
    // if (!user)
    //   throw new UnauthorizedError(
    //     "Unauthorized user, Please verify your email",
    //   );

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    console.log(user, "user in login");

    if (user.role !== "admin" && !user.isEmailVerified) {
      throw new UnauthorizedError("Please verify your email before logging in");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("Account is disabled");
    }

    const isValid = await bcryptCompare(data.password, user.passwordHash!);
    if (!isValid) throw new UnauthorizedError("Invalid password");

    // Generate tokens
    const refreshToken = generateRefreshToken(
      user.userId,
      user.role,
      user.email,
    );

    const refreshTokenHash = await bcryptHash(refreshToken);

    const existingSession = await prisma.userSession.findFirst({
      where: {
        userId: user.id,
        revoked: false,
      },
    });

    if (existingSession) {
      await prisma.userSession.update({
        where: {
          sessionId: existingSession.sessionId,
        },
        data: {
          revoked: true,
        },
      });
    }

    // Store refresh token
    const session = await prisma.userSession.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const accessToken = generateAccessToken({
      userId: user.userId,
      role: user.role,
      email: user.email,
      sessionId: session.sessionId,
    });

    return {
      user: { id: user.userId, email: user.email, name: user.name },
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
    if (!user) {
      // User enumeration prevention: Return success even if user doesn't exist.
      return {
        message:
          "If this email is registered, a password reset OTP has been sent.",
      };
    }

    const rawOtp = generateOTP();
    const hashedOtp = await bcryptHash(rawOtp);

    // Save reset request
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        otpHash: hashedOtp,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    await EmailService.sendMail({
      to: user.email,
      subject: "Password Reset Request",
      template: EmailTemplate.PASSWORD_RESET,
      context: { otp: rawOtp },
    });

    return { message: "Password reset OTP sent to your email" };
  }

  //   reset password service
  static async resetPassword(data: ResetPasswordInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid or expired OTP");
    }

    const resetRequest = await prisma.passwordReset.findFirst({
      where: {
        userId: user.id,
        used: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!resetRequest) {
      throw new UnauthorizedError("Invalid or expired OTP");
    }

    if (resetRequest.expiresAt < new Date()) {
      throw new UnauthorizedError("OTP expired");
    }

    const isValid = await bcryptCompare(data.otp, resetRequest.otpHash);

    if (!isValid) {
      throw new UnauthorizedError("Invalid or expired OTP");
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

      prisma.userSession.updateMany({
        where: {
          userId: resetRequest.userId,
          revoked: false,
        },
        data: {
          revoked: true,
        },
      }),
    ]);

    return {
      message: "Password reset successful. All sessions have been logged out.",
    };
  }

  // static async refreshToken(token: string) {
  //   const payload = verifyRefreshToken(token);

  //   const existing

  //   const session = await prisma.userSession.findUnique({
  //     where: { refreshToken: token },
  //   });
  //   if (!session) throw new UnauthorizedError("Invalid refresh token");

  //   const sessionId = String(session.id);

  //   // If expired
  //   if (session.expiresAt < new Date()) {
  //     await prisma.session.delete({ where: { id: sessionId } });
  //     throw new Error("Refresh token expired");
  //   }

  //   // Issue new access token
  //   const accessToken = generateAccessToken(
  //     payload.userId,
  //     payload.role,
  //     payload.email,
  //   );
  //   return { accessToken };
  // }

  static async refreshToken(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);

    const sessions = await prisma.userSession.findMany({
      where: {
        user: {
          userId: payload.userId,
        },
        revoked: false,
      },
    });

    if (!sessions.length) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    let matchedSession = null;

    for (const session of sessions) {
      const isMatch = await bcryptCompare(
        refreshToken,
        session.refreshTokenHash,
      );

      if (isMatch) {
        matchedSession = session;
        break;
      }
    }

    if (!matchedSession) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    if (matchedSession.expiresAt < new Date()) {
      await prisma.userSession.update({
        where: { sessionId: matchedSession.sessionId },
        data: { revoked: true },
      });

      throw new UnauthorizedError("Refresh token expired");
    }

    // ROTATE refresh token
    const newRefreshToken = generateRefreshToken(
      payload.userId,
      payload.role,
      payload.email,
    );

    const newRefreshTokenHash = await bcryptHash(newRefreshToken);

    await prisma.userSession.update({
      where: { sessionId: matchedSession.sessionId },
      data: {
        refreshTokenHash: newRefreshTokenHash,
      },
    });

    const accessToken = generateAccessToken({
      userId: payload.userId,
      role: payload.role,
      email: payload.email,
      sessionId: matchedSession.sessionId,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async logout(sessionId: string) {
    await prisma.userSession.update({
      where: { sessionId },
      data: {
        revoked: true,
      },
    });

    return { message: "Logged out successfully" };
  }
}
