// schemas/profile.schema.ts
import { z } from "zod";

// Profile update schema
export const UpdateProfileSchema = z.object({
  name: z.string().min(3, "Name is required").optional(),
  email: z
    .string()
    .regex(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, {
      message: "Invalid email address",
    })
    .optional(),
});

export type UpdateProfileSchemaType = z.infer<typeof UpdateProfileSchema>;

// Address schema
const AddressSchema = z.object({
  address1: z.string().min(3, "Address1 is required"),
  address2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zip: z.string().min(2, "ZIP is required"),
  country: z.string().min(2, "Country is required"),
});

export const changePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(6, "Old password must be at least 6 characters"),

    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password must be different from old password",
    path: ["newPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// Address update schema (all optional fields)
export const UpdateAddressSchema = AddressSchema.partial();
export const CreateAddressSchema = AddressSchema;

export type UpdateAddressSchemaType = z.infer<typeof UpdateAddressSchema>;
export type CreateAddressSchemaType = z.infer<typeof CreateAddressSchema>;
