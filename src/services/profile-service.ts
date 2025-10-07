// services/profile.service.ts
import { PrismaClient } from "@prisma/client";
import { NotFoundError, BadRequestError, ConflictError } from "@/libs/AppError";
import {
  UpdateAddressSchema,
  CreateAddressSchema,
  UpdateProfileSchema,
  type UpdateAddressSchemaType,
  type UpdateProfileSchemaType,
  type CreateAddressSchemaType,
} from "@/schema/zod-schema/profile.schema";

const prisma = new PrismaClient();

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
        Session: true,
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

    try {
      return await prisma.address.create({
        data: {
          ...parsedAddress,
          userId: user.id,
        },
      });
    } catch {
      throw new BadRequestError("Failed to add address");
    }
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
}
