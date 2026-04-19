// services/profile.service.ts
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from "@/libs/AppError";
import {
  UpdateAddressSchema,
  CreateAddressSchema,
  UpdateProfileSchema,
  type UpdateAddressSchemaType,
  type UpdateProfileSchemaType,
  type CreateAddressSchemaType,
  ChangePasswordInput,
} from "@/schema/zod-schema/profile.schema";
import { prisma } from "@/prisma/client.js";
import { bcryptCompare, bcryptHash } from "@/libs/password-hash-verify";

export class ProfileService {
  // Get a user profile by uuid (include relations)
  static async getProfileByUserId(userId: string) {
    const user = await prisma.user.findUnique({
      where: { userId },
      include: {
        Address: true,
        wishlist: {
          include: { items: { include: { product: true } } },
        },
        carts: {
          include: { items: { include: { product: true } } },
        },
        Order: true,
        userProfileImage: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User profile not found");
    }

    return user;
  }

  // Update basic profile info
  static async updateProfile(userId: string, data: UpdateProfileSchemaType) {
    const parsedData = UpdateProfileSchema.parse(data);
    try {
      return await prisma.user.update({
        where: { userId },
        data: parsedData,
      });
    } catch (err: any) {
      if (err.code === "P2002") {
        // Unique constraint violation (e.g. email already taken)
        throw new ConflictError("Email already exists");
      }
      throw new BadRequestError("Failed to update profile");
    }
  }

  // Add a new address
  static async addAddress(userId: string, address: CreateAddressSchemaType) {
    const parsedAddress = CreateAddressSchema.parse(address);

    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) throw new NotFoundError("User not found");

    const existingAddress = await prisma.address.findFirst({
      where: { userId: user.id, ...parsedAddress },
    });

    if (existingAddress) throw new ConflictError("Address already exists");

    return await prisma.address.create({
      data: {
        ...parsedAddress,
        userId: user.id,
      },
    });
  }

  // Update an address
  static async updateAddress(addressId: bigint, data: UpdateAddressSchemaType) {
    const parsedData = UpdateAddressSchema.parse(data);
    const existing = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existing) throw new NotFoundError("Address not found");

    return prisma.address.update({
      where: { id: addressId },
      data: parsedData,
    });
  }

  // Deactivate profile
  static async deactivateProfile(userId: string) {
    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) throw new NotFoundError("User not found");

    return prisma.user.update({
      where: { userId },
      data: { isActive: false },
    });
  }

  // changing password and then logout the user out of all active sessions
  static async changePassword(userId: string, data: ChangePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { userId },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const isValid = await bcryptCompare(data.oldPassword, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedError("Old password is incorrect");
    }

    const newHash = await bcryptHash(data.newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      }),

      // revoke all active sessions
      prisma.userSession.updateMany({
        where: {
          userId: user.id,
          revoked: false,
        },
        data: {
          revoked: true,
        },
      }),
    ]);

    return {
      message: "Password changed successfully. Please log in again.",
    };
  }
}
