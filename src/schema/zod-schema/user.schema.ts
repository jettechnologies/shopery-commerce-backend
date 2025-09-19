import { z } from "zod";

export const CreateUserSchema = z.object({
  email: z.string().regex(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, {
    message: "Invalid email address",
  }),
  password: z
    .string()
    .min(6)
    .refine(
      (value) => {
        const hasUppercase = /[A-Z]/.test(value);
        const hasLowercase = /[a-z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        return hasUppercase && hasLowercase && hasNumber;
      },
      {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        path: ["password"],
      }
    ),
  name: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const LoginUserSchema = z.object({
  email: z.string().regex(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, {
    message: "Invalid email address",
  }),
  password: z
    .string()
    .min(6)
    .refine(
      (value) => {
        const hasUppercase = /[A-Z]/.test(value);
        const hasLowercase = /[a-z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        return hasUppercase && hasLowercase && hasNumber;
      },
      {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        path: ["password"],
      }
    ),
});

export type LoginUserInput = z.infer<typeof LoginUserSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().regex(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, {
    message: "Invalid email address",
  }),
});

export const ResetPasswordSchema = z.object({
  otp: z.string().max(6),
  password: z
    .string()
    .min(6)
    .refine(
      (value) => {
        const hasUppercase = /[A-Z]/.test(value);
        const hasLowercase = /[a-z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        return hasUppercase && hasLowercase && hasNumber;
      },
      {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        path: ["password"],
      }
    ),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
