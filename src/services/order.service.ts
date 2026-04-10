import { prisma } from "@/prisma/client.js";
import { OrderStatus } from "@/prisma/generated/prisma/enums.js";
import { CreateOrderSchema, CreateOrderSchemaType } from "@/schema/zod-schema";
import { BadRequestError, NotFoundError } from "@/libs/AppError";
import { EmailService, EmailTemplate } from "@/libs/EmailService";

export class OrderService {
  static async createOrder(data: CreateOrderSchemaType) {
    const parsedData = CreateOrderSchema.parse(data);

    let cartItems: any[] = [];
    let cartIdBigInt: bigint | undefined;
    let guestCartIdBigInt: bigint | undefined;
    let userIdBigInt: bigint | undefined;

    if (parsedData.cartId) {
      // cartIdBigInt = BigInt(parsedData.cartId);
      const cart = await prisma.cart.findUnique({
        where: { cartId: parsedData.cartId },
        include: { items: { include: { product: true, variant: true } } },
      });
      if (!cart || cart.items.length === 0)
        throw new NotFoundError("Cart not found or empty");
      cartIdBigInt = cart.id;
      cartItems = cart.items;
    }

    if (parsedData.guestCartId) {
      guestCartIdBigInt = BigInt(parsedData.guestCartId);
      const guestCart = await prisma.guestCart.findUnique({
        where: { id: guestCartIdBigInt },
        include: { items: { include: { product: true, variant: true } } },
      });
      if (!guestCart || guestCart.items.length === 0)
        throw new NotFoundError("Guest cart not found or empty");

      cartItems = guestCart.items;
    }

    if (parsedData.userId) {
      const user = await prisma.user.findUnique({
        where: { userId: parsedData.userId },
      });
      if (!user) throw new NotFoundError("User not found");

      userIdBigInt = user.id;
    }

    const order = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: userIdBigInt ?? null,
          cartId: cartIdBigInt ?? null,
          guestCartId: guestCartIdBigInt ?? null,
          email: parsedData.email,
          total: parsedData.total,
          paymentId: parsedData.paymentId ?? null,
          shippingAddressId: parsedData.addressId
            ? BigInt(parsedData.addressId)
            : null,
          couponId: parsedData.couponId ?? null,
          status: OrderStatus.pending,
        },
      });

      for (const item of cartItems) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          },
        });
      }

      if (cartIdBigInt) {
        await tx.cartItem.deleteMany({ where: { cartId: cartIdBigInt } });
      }

      if (guestCartIdBigInt) {
        await tx.guestCart.delete({ where: { id: guestCartIdBigInt } });
      }

      return order;
    });

    const formattedItems = cartItems.map((item) => {
      const unitPrice = Number(
        item.unitPrice ??
          (item.variant ? (item.variant.salePrice ?? item.variant.price) : 0),
      );
      const quantity = item.quantity;
      const subtotal = unitPrice * quantity;

      return {
        name: item.product.name,
        quantity,
        unitPrice: unitPrice.toFixed(2),
        subtotal: subtotal.toFixed(2),
      };
    });

    try {
      await EmailService.sendMail({
        to: parsedData.email,
        subject: "Order Confirmation",
        template: EmailTemplate.ORDER_CONFIRMATION,
        context: {
          orderId: order.orderId,
          items: formattedItems,
          total: Number(order.total).toFixed(2),
        },
      });
    } catch (err) {
      console.warn("Order created but email failed:", err);
    }

    return order;
  }

  /** ✅ Get single order (by ID) */
  static async getOrderById(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { orderId },
      include: { OrderItems: { include: { product: true, variant: true } } },
    });

    if (!order) throw new NotFoundError("Order not found");
    return order;
  }

  /** ✅ Get all orders for a user */
  static async getOrdersByUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) throw new NotFoundError("User not found");

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { OrderItems: true },
      orderBy: { createdAt: "desc" },
    });

    return orders;
  }

  /** ✅ Update order shipping address */
  static async updateOrderAddress(
    orderId: string,
    addressId: number,
    userId: string,
    isAdmin: boolean,
  ) {
    const order = await prisma.order.findUnique({ where: { orderId } });
    if (!order) throw new NotFoundError("Order not found");

    if (!isAdmin && order.userId?.toString() !== userId) {
      throw new BadRequestError(
        "Forbidden: Cannot update address for an order you do not own",
      );
    }

    if (
      order.status === OrderStatus.shipped ||
      order.status === OrderStatus.delivered
    ) {
      throw new BadRequestError(
        "Cannot change address for shipped or delivered orders",
      );
    }

    const address = await prisma.address.findUnique({
      where: { id: BigInt(addressId) },
    });

    if (!address) throw new NotFoundError("Address not found");
    if (!isAdmin && address.userId.toString() !== userId) {
      throw new BadRequestError("Forbidden: Address does not belong to you");
    }

    const updatedOrder = await prisma.order.update({
      where: { orderId },
      data: { shippingAddressId: address.id },
    });

    return updatedOrder;
  }

  /** ✅ Update order status (admin or payment gateway callback) */
  static async updateOrderStatus(orderId: string, status: OrderStatus) {
    const validStatuses = Object.values(OrderStatus);
    if (!validStatuses.includes(status)) {
      throw new BadRequestError("Invalid order status");
    }

    const oldOrder = await prisma.order.findUnique({ where: { orderId } });
    if (!oldOrder) throw new NotFoundError("Order not found");
    const previousStatus = oldOrder.status;

    const order = await prisma.order.update({
      where: { orderId },
      data: { status },
    });

    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: order.id },
      include: { product: true, variant: true },
    });

    // 🔥 AUTOMATION TRIGGER: Reduce variant inventory precisely upon shipping
    if (
      previousStatus !== OrderStatus.shipped &&
      status === OrderStatus.shipped
    ) {
      await prisma.$transaction(async (tx) => {
        for (const item of orderItems) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stockQuantity: { decrement: item.quantity } },
            });

            // Re-map active aggregate product stocks globally mapping from arrays
            const allVariants = await tx.productVariant.findMany({
              where: { productId: item.productId },
            });
            const totalStock = allVariants.reduce(
              (sum, v) => sum + v.stockQuantity,
              0,
            );

            await tx.product.update({
              where: { id: item.productId },
              data: { stockQuantity: totalStock },
            });
          }
        }
      });
    }

    const formattedItems = orderItems.map((item) => {
      const unitPrice = Number(
        item.unitPrice ??
          (item.variant ? (item.variant.salePrice ?? item.variant.price) : 0),
      );
      const quantity = item.quantity;
      const subtotal = unitPrice * quantity;

      return {
        name: item.product.name,
        quantity,
        unitPrice: unitPrice.toFixed(2),
        subtotal: subtotal.toFixed(2),
      };
    });

    // Optional: Send email notification on status change
    await EmailService.sendMail({
      to: order.email,
      subject: `Order ${status}`,
      template: EmailTemplate.ORDER_STATUS_UPDATE,
      context: {
        orderId: order.orderId,
        items: formattedItems,
        total: Number(order.total).toFixed(2),
      },
    });

    return order;
  }

  /** ✅ Cancel order */
  static async cancelOrder(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { orderId: orderId },
    });
    if (!order) throw new NotFoundError("Order not found");

    if (
      order.status === OrderStatus.shipped ||
      order.status === OrderStatus.delivered
    ) {
      throw new BadRequestError("Cannot cancel shipped or delivered orders");
    }

    const updatedOrder = await prisma.order.update({
      where: { orderId },
      data: { status: OrderStatus.cancelled },
    });

    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: updatedOrder.id },
      include: { product: true, variant: true },
    });

    if (!order) throw new NotFoundError("Order not found");

    const formattedItems = orderItems.map((item) => {
      const unitPrice = Number(
        item.unitPrice ??
          (item.variant ? (item.variant.salePrice ?? item.variant.price) : 0),
      );
      const quantity = item.quantity;
      const subtotal = unitPrice * quantity;

      return {
        name: item.product.name,
        quantity,
        unitPrice: unitPrice.toFixed(2),
        subtotal: subtotal.toFixed(2),
      };
    });

    await EmailService.sendMail({
      to: updatedOrder.email,
      subject: "Order Cancelled",
      template: EmailTemplate.ORDER_CANCELLED,
      context: {
        orderId: updatedOrder.orderId,
        items: formattedItems,
        total: Number(updatedOrder.total).toFixed(2),
      },
    });

    return updatedOrder;
  }

  /** ✅ Get all orders (Admin - Paginated) */
  static async getAllOrders(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { email: true, name: true } } },
      }),
      prisma.order.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      orders,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  }

  /** ✅ Get all orders (Admin - Paginated) */
  static async getOrderHistory(
    page: number = 1,
    limit: number = 10,
    userId: string,
  ) {
    const user = await prisma.user.findUnique({ where: { userId: userId } });
    if (!user) throw new BadRequestError("Cant access orders for this user");

    const skip = (page - 1) * limit;
    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where: {
          userId: user.id,
          status: OrderStatus.delivered,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { email: true, name: true } } },
      }),
      prisma.order.count({
        where: {
          status: OrderStatus.delivered,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    console.log(orders, "order history");

    return {
      orderHistory: orders,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  }
}
