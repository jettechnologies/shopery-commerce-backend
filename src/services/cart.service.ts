import { prisma } from "prisma/client";
import {
  AddToCartSchema,
  AddToCartSchemaType,
  UpdateCartItemSchemaType,
} from "@/schema/zod-schema/cart.schema";
import { NotFoundError, BadRequestError } from "@/libs/AppError";
import { CartStatus } from "prisma/generated/prisma";

export class CartService {
  /**
   * Get or create active cart for user
   */
  static async getCart(userId: string) {
    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) throw new NotFoundError("User not found");

    let cart = await prisma.cart.findFirst({
      where: { userId: user.id, status: CartStatus.active },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
          orderBy: { addedAt: "desc" },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id, status: CartStatus.active },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
            },
            orderBy: { addedAt: "desc" },
          },
        },
      });
    }

    const total = cart.items.reduce((acc, item) => {
      return acc + item.quantity * item.product.salePrice!;
    }, 0);

    return { ...cart, total };
  }

  /**
   * Add item to cart
   */
  static async addToCart(userId: string, data: AddToCartSchemaType) {
    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) throw new NotFoundError("User not found");

    const product = await prisma.product.findUnique({
      where: { productId: data.productId },
    });

    if (!product) throw new NotFoundError("Product not found");
    if (!product.isActive)
      throw new BadRequestError("Product is not available");
    if (product.stockQuantity < data.quantity) {
      throw new BadRequestError("Insufficient stock");
    }

    let cart = await prisma.cart.findFirst({
      where: { userId: user.id, status: CartStatus.active },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id, status: CartStatus.active },
      });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: product.id,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + data.quantity;
      if (product.stockQuantity < newQuantity) {
        throw new BadRequestError("Insufficient stock for requested quantity");
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          quantity: data.quantity,
          unitPrice: product.salePrice || product.price,
        },
      });
    }

    return this.getCart(userId);
  }

  /**
   * Remove item from cart
   */
  static async removeFromCart(userId: string, productId: string) {
    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) throw new NotFoundError("User not found");

    const cart = await prisma.cart.findFirst({
      where: { userId: user.id, status: CartStatus.active },
    });

    if (!cart) throw new NotFoundError("Cart not found");

    const product = await prisma.product.findUnique({
      where: { productId },
    });

    if (!product) throw new NotFoundError("Product not found");

    const item = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: product.id,
        },
      },
    });

    if (!item) throw new NotFoundError("Item not found in cart");

    await prisma.cartItem.delete({ where: { id: item.id } });

    return this.getCart(userId);
  }

  /**
   * Update cart item quantity
   */
  static async updateCartItem(
    userId: string,
    productId: string,
    quantity: number,
  ) {
    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) throw new NotFoundError("User not found");

    const cart = await prisma.cart.findFirst({
      where: { userId: user.id, status: CartStatus.active },
    });

    if (!cart) throw new NotFoundError("Cart not found");

    const product = await prisma.product.findUnique({
      where: { productId },
    });

    if (!product) throw new NotFoundError("Product not found");

    if (product.stockQuantity < quantity) {
      throw new BadRequestError("Insufficient stock");
    }

    const item = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: product.id,
        },
      },
    });

    if (!item) throw new NotFoundError("Item not found in cart");

    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity },
    });

    return this.getCart(userId);
  }

  /**
   * Clear cart
   */
  static async clearCart(userId: string) {
    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) throw new NotFoundError("User not found");

    const cart = await prisma.cart.findFirst({
      where: { userId: user.id, status: CartStatus.active },
    });

    if (!cart) throw new NotFoundError("Cart not found");

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return { message: "Cart cleared successfully" };
  }
}
