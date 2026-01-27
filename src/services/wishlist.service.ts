import { prisma } from "prisma/client";
import { AddToWishlistSchemaType } from "@/schema/zod-schema/wishlist.schema";
import { NotFoundError, BadRequestError } from "@/libs/AppError";

export class WishlistService {
  static async getWishlist(userId: string) {
    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) throw new NotFoundError("User not found");

    let wishlist = await prisma.wishlist.findUnique({
      where: { userId: BigInt(user.id) },
      include: {
        items: {
          include: {
            product: {
              include: { images: true },
            },
          },
        },
      },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId: BigInt(user.id) },
        include: {
          items: {
            include: {
              product: {
                include: { images: true },
              },
            },
          },
        },
      });
    }

    return wishlist;
  }

  static async addToWishlist(userId: string, data: AddToWishlistSchemaType) {
    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) throw new NotFoundError("User not found");

    let wishlist = await prisma.wishlist.findUnique({
      where: { userId: BigInt(user.id) },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId: BigInt(user.id) },
      });
    }

    const product = await prisma.product.findUnique({
      where: { productId: data.productId },
    });
    if (!product) throw new NotFoundError("Product not found");

    const exists = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId: product.id,
        },
      },
    });

    if (exists) {
      throw new BadRequestError("Item already in wishlist");
    }

    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId: product.id,
      },
    });

    return this.getWishlist(userId);
  }

  static async removeFromWishlist(userId: string, productId: string) {
    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) throw new NotFoundError("User not found");

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: BigInt(user.id) },
    });
    if (!wishlist) throw new NotFoundError("Wishlist not found");

    const product = await prisma.product.findUnique({ where: { productId } });
    if (!product) throw new NotFoundError("Product not found");

    try {
      await prisma.wishlistItem.delete({
        where: {
          wishlistId_productId: {
            wishlistId: wishlist.id,
            productId: product.id,
          },
        },
      });
    } catch (e) {
      throw new NotFoundError("Item not found in wishlist");
    }

    return this.getWishlist(userId);
  }
}
