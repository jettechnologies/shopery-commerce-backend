import { prisma } from "@/prisma/client.js";
import {
  AddToCartSchema,
  AddToCartSchemaType,
  UpdateCartItemSchemaType,
} from "@/schema/zod-schema/cart.schema";
import { NotFoundError, BadRequestError } from "@/libs/AppError";
import { CartStatus } from "@/prisma/generated/prisma/enums.js";
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
            variant: true,
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
              variant: true,
            },
            orderBy: { addedAt: "desc" },
          },
        },
      });
    }

    const total = cart.items.reduce((acc, item) => {
      const price = item.variant ? (item.variant.salePrice ?? item.variant.price) : 0;
      return acc + item.quantity * price;
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

    const variant = await prisma.productVariant.findUnique({
      where: { id: BigInt(data.variantId) }
    });
    if (!variant || variant.productId !== product.id) {
       throw new NotFoundError("Variant not found for this product");
    }

    if (variant.stockQuantity < data.quantity) {
      throw new BadRequestError("Insufficient stock for this specific variant");
    }

    let cart = await prisma.cart.findFirst({
      where: { userId: user.id, status: CartStatus.active },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id, status: CartStatus.active },
      });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: product.id,
        variantId: variant.id,
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + data.quantity;
      if (variant.stockQuantity < newQuantity) {
        throw new BadRequestError("Insufficient stock for requested variant quantity");
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
          variantId: variant.id,
          quantity: data.quantity,
          unitPrice: variant.salePrice ?? variant.price,
        },
      });
    }

    return this.getCart(userId);
  }

  /**
   * Remove item from cart
   */
  static async removeFromCart(userId: string, cartItemId: string) {
    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) throw new NotFoundError("User not found");

    const cart = await prisma.cart.findFirst({
      where: { userId: user.id, status: CartStatus.active },
    });

    if (!cart) throw new NotFoundError("Cart not found");

    const item = await prisma.cartItem.findFirst({
      where: {
        id: BigInt(cartItemId),
        cartId: cart.id,
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
    cartItemId: string,
    quantity: number,
  ) {
    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) throw new NotFoundError("User not found");

    const cart = await prisma.cart.findFirst({
      where: { userId: user.id, status: CartStatus.active },
    });

    if (!cart) throw new NotFoundError("Cart not found");

    const item = await prisma.cartItem.findFirst({
      where: {
        id: BigInt(cartItemId),
        cartId: cart.id,
      },
      include: { variant: true }
    });

    if (!item) throw new NotFoundError("Item not found in cart");

    if (item.variant && item.variant.stockQuantity < quantity) {
      throw new BadRequestError("Insufficient stock for this specific variant");
    }

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
