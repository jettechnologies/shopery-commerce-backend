// services/profile.service.ts
import { PrismaClient } from "@prisma/client";
import { NotFoundError, BadRequestError, ConflictError } from "@/libs/AppError";

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
  static async updateProfile(
    userId: string,
    data: Partial<{ name: string; email: string }>
  ) {
    try {
      return await prisma.user.update({
        where: { userId },
        data,
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
  static async addAddress(
    userId: string,
    address: Omit<
      Parameters<typeof prisma.address.create>[0]["data"],
      "userId" | "user"
    >
  ) {
    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) throw new NotFoundError("User not found");

    try {
      return await prisma.address.create({
        data: {
          ...address,
          userId: user.id,
        },
      });
    } catch {
      throw new BadRequestError("Failed to add address");
    }
  }

  // Update an address
  static async updateAddress(
    addressId: bigint,
    data: Partial<{
      address1: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    }>
  ) {
    const existing = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existing) throw new NotFoundError("Address not found");

    return prisma.address.update({
      where: { id: addressId },
      data,
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
