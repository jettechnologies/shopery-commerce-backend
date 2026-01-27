import { prisma } from "prisma/client";
import { OrderStatus } from "prisma/generated/prisma";
import { CreateOrderSchema, CreateOrderSchemaType } from "@/schema/zod-schema";
import { BadRequestError, NotFoundError } from "@/libs/AppError";
import { EmailService, EmailTemplate } from "@/libs/EmailService";

export class OrderService {
  /** ✅ Create a new order (registered or guest) */
  static async createOrder(data: CreateOrderSchemaType) {
    const parsedData = CreateOrderSchema.parse(data);

    let cartItems: any[] = [];

    if (parsedData.cartId) {
      const cart = await prisma.cart.findUnique({
        where: { id: parsedData.cartId },
        include: { items: { include: { product: true } } },
      });
      if (!cart || cart.items.length === 0)
        throw new NotFoundError("Cart not found or empty");
      cartItems = cart.items;
    }

    if (parsedData.guestCartId) {
      const guestCart = await prisma.guestCart.findUnique({
        where: { id: parsedData.guestCartId },
        include: { items: { include: { product: true } } },
      });
      if (!guestCart || guestCart.items.length === 0)
        throw new NotFoundError("Guest cart not found or empty");
      cartItems = guestCart.items;
    }

    // ✅ Transaction ensures atomicity
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: parsedData.userId,
          cartId: parsedData.cartId,
          guestCartId: parsedData.guestCartId,
          email: parsedData.email,
          total: parsedData.total,
          paymentId: parsedData.paymentId,
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

      // 📨 Send confirmation email
      await EmailService.sendMail({
        to: parsedData.email,
        subject: "Order Confirmation",
        template: EmailTemplate.ORDER_CONFIRMATION,
        context: { orderId: order.id, items: cartItems, total: order.total },
      });

      return order;
    });
  }

  /** ✅ Get single order (by ID) */
  static async getOrderById(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { orderId },
      include: { OrderItems: { include: { product: true } } },
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

  /** ✅ Update order status (admin or payment gateway callback) */
  static async updateOrderStatus(orderId: string, status: OrderStatus) {
    const validStatuses = Object.values(OrderStatus);
    if (!validStatuses.includes(status)) {
      throw new BadRequestError("Invalid order status");
    }

    const order = await prisma.order.update({
      where: { orderId },
      data: { status },
    });

    // Optional: Send email notification on status change
    await EmailService.sendMail({
      to: order.email,
      subject: `Order ${status}`,
      template: EmailTemplate.ORDER_STATUS_UPDATE,
      context: { orderId: order.id, status },
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

    await EmailService.sendMail({
      to: order.email,
      subject: "Order Cancelled",
      template: EmailTemplate.ORDER_CANCELLED,
      context: { orderId: order.id },
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
}


// import { PrismaClient } from "@prisma/client";
// import { CreateOrderSchema, CreateOrderSchemaType } from "@/schema/zod-schema";
// import { BadRequestError, NotFoundError } from "@/libs/AppError";
// import { EmailService, EmailTemplate } from "@/libs/EmailService";
// import { OrderStatus } from "@prisma/client";

// const prisma = new PrismaClient();

// export class OrderService {
//   static async createOrder(data: CreateOrderSchemaType) {
//     const parsedData = CreateOrderSchema.parse(data);

//     let cartItems: any[] = [];

//     if (parsedData.cartId) {
//       const cart = await prisma.cart.findUnique({
//         where: { id: parsedData.cartId },
//         include: { items: { include: { product: true } } },
//       });
//       if (!cart || cart.items.length === 0) {
//         throw new NotFoundError("Cart not found or empty");
//       }
//       cartItems = cart.items;
//     }

//     if (parsedData.guestCartId) {
//       const guestCart = await prisma.guestCart.findUnique({
//         where: { id: parsedData.guestCartId },
//         include: { items: { include: { product: true } } },
//       });
//       if (!guestCart || guestCart.items.length === 0) {
//         throw new NotFoundError("Guest cart not found or empty");
//       }
//       cartItems = guestCart.items;
//     }

//     // Transaction ensures atomicity
//     return prisma.$transaction(async (tx) => {
//       const order = await tx.order.create({
//         data: {
//           userId: parsedData.userId,
//           cartId: parsedData.cartId,
//           guestCartId: parsedData.guestCartId,
//           email: parsedData.email,
//           total: parsedData.total,
//           paymentId: parsedData.paymentId,
//           status: OrderStatus.pending,
//         },
//       });
//       for (const item of cartItems) {
//         await tx.orderItem.create({
//           data: {
//             orderId: order.id,
//             productId: item.productId,
//             quantity: item.quantity,
//             unitPrice: item.unitPrice,
//           },
//         });
//       }

//       await EmailService.sendMail({
//         to: parsedData.email,
//         subject: "Order Confirmation",
//         template: EmailTemplate.ORDER_CONFIRMATION,
//         context: { orderId: order.id, items: cartItems, total: order.total },
//       });
//       return order;
//     });
//   }
// }
