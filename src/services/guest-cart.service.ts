import { Request } from "express";
import { NotFoundError } from "@/libs/AppError";
import {
  AddGuestCartItemSchema,
  type AddGuestCartItemSchemaType,
} from "@/schema/zod-schema";
import { CartStatus } from "../../prisma/generated/prisma/client";
import { prisma } from "prisma/client";

export class GuestCartService {
  // Create a new guest cart (default 7-day expiry)
  static async createGuestCart(req: Request) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const ipAddress =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.socket.remoteAddress ||
      null;

    const macAddress = (req.headers["x-mac-address"] as string) || null;

    const userAgent = req.headers["user-agent"] || null;

    const cart = await prisma.guestCart.create({
      data: { ipAddress, macAddress, userAgent, expiresAt },
      include: { items: true },
    });

    return cart;
  }

  // adding the items to the user cart and creating the cart
  static async addItem(req: Request, data: AddGuestCartItemSchemaType) {
    const parsedData = AddGuestCartItemSchema.parse(data);

    // Try to find guest cart by token (sent in header or cookie)
    const token =
      (req.headers["x-guest-token"] as string) ||
      (req.cookies?.guestToken as string) ||
      null;

    let cart = token
      ? await prisma.guestCart.findFirst({
          where: { token },
          include: { items: true },
        })
      : null;

    // Automatically create cart if missing
    if (!cart) {
      cart = await GuestCartService.createGuestCart(req);
      cart.items = [];
    }

    // Check if item already exists
    const existingItem = cart.items.find(
      (i) => i.productId === parsedData.productId,
    );

    if (existingItem) {
      return prisma.guestCartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + parsedData.quantity },
      });
    }

    // Extend expiry if first item added
    if (cart.items.length === 0) {
      await prisma.guestCart.update({
        where: { id: cart.id },
        data: {
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    // Add new item
    const guestCartItem = await prisma.guestCartItem.create({
      data: {
        guestCartId: cart.id,
        productId: parsedData.productId,
        quantity: parsedData.quantity,
        unitPrice: parsedData.unitPrice,
      },
    });

    // Return both item + cart token for frontend to save
    return {
      guestCartItem,
      guestCartToken: cart.token,
    };
  }

  // Remove a specific item from the guest cart
  static async removeItem(token: string, productId: bigint) {
    const cart = await prisma.guestCart.findFirst({
      where: { token },
      include: { items: true },
    });

    if (!cart) throw new NotFoundError("Guest cart not found");

    const item = cart.items.find((i) => i.productId === productId);
    if (!item) throw new NotFoundError("Item not found in cart");

    await prisma.guestCartItem.delete({ where: { id: item.id } });

    return { message: "Item removed successfully" };
  }

  //  Clear all items from the guest cart
  static async clearCart(token: string) {
    const cart = await prisma.guestCart.findFirst({
      where: { token },
      include: { items: true },
    });

    if (!cart) throw new NotFoundError("Guest cart not found");

    await prisma.guestCartItem.deleteMany({
      where: { guestCartId: cart.id },
    });

    return { message: "Guest cart cleared successfully" };
  }

  // Merge guest cart into user cart
  static async mergeIntoUserCart(token: string, userId: string) {
    const guestCart = await prisma.guestCart.findFirst({
      where: { token },
      include: { items: true },
    });

    if (!guestCart) return null;

    const user = await prisma.user.findUnique({
      where: { userId },
    });

    if (!user) return null;

    let userCart = await prisma.cart.findFirst({
      where: { userId: BigInt(user.id), status: CartStatus.active },
      include: { items: true },
    });

    if (!userCart) {
      userCart = await prisma.cart.create({
        data: { userId: BigInt(user.id), status: CartStatus.active },
        include: { items: true },
      });
    }

    for (const item of guestCart.items) {
      const existing = userCart.items.find(
        (i) => i.productId === item.productId,
      );
      if (existing) {
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + item.quantity },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          },
        });
      }
    }

    await prisma.guestCart.delete({ where: { id: guestCart.id } });

    return userCart;
  }

  // Get guest cart by token
  static async getGuestCart(token: string) {
    const cart = await prisma.guestCart.findFirst({
      where: { token },
      include: { items: { include: { product: true } } },
    });

    if (!cart) throw new NotFoundError("Guest cart not found");
    return cart;
  }
}
