import { Router, Response, NextFunction } from "express";
import { OrderService } from "@/services/order.service";
// import { PrismaClient } from ;
import { prisma } from "prisma/client";
import { AuthRequest } from "@/middlewares/auth.middleware";
import { GuestCartRequest } from "@/middlewares/guest-cart.middleware";
import { BadRequestError, NotFoundError } from "@/libs/AppError";
import ApiResponse from "@/libs/ApiResponse";
import { handleError } from "@/libs/misc";

const checkoutRouter = Router();

/**
 * @swagger
 * /checkout:
 *   post:
 *     summary: Initiate checkout for both registered and guest users
 *     tags: [Checkout]
 *     description: >
 *       Creates a **pending order** when a user clicks checkout.
 *       This captures the cart, user (or guest) info, and initializes an order
 *       before payment confirmation. The order will remain in a *pending* state
 *       until payment verification updates it.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "guest@example.com"
 *               paymentId:
 *                 type: string
 *                 nullable: true
 *                 example: "razorpay_123456"
 *     responses:
 *       201:
 *         description: Checkout initiated successfully — pending order created
 *       400:
 *         description: Invalid request or missing cart
 *       404:
 *         description: User or Cart not found
 *       500:
 *         description: Server error
 */

checkoutRouter.post(
  "/",
  async (
    req: AuthRequest & GuestCartRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      let cart: any;

      // ✅ 1. Identify checkout source (registered or guest)
      if (req.user) {
        const user = await prisma.user.findUnique({
          where: { userId: req.user.userId },
        });

        if (!user) throw new NotFoundError("User not found");

        cart = await prisma.cart.findFirst({
          where: { userId: BigInt(user.id) },
          include: { items: true },
        });

        if (!cart || cart.items.length === 0)
          throw new NotFoundError("Cart not found or empty for user");
      } else if (req.guestCart) {
        cart = await prisma.guestCart.findUnique({
          where: { id: req.guestCart.id },
          include: { items: true },
        });

        if (!cart || cart.items.length === 0)
          throw new NotFoundError("Guest cart not found or empty");
      } else {
        throw new BadRequestError("No valid cart found for checkout");
      }

      // ✅ 2. Compute total cost
      const total = cart.items.reduce(
        (sum: number, item: any) => sum + item.quantity * item.unitPrice,
        0,
      );

      // ✅ 3. Create "intermediate" (pending) order
      const order = await OrderService.createOrder({
        userId: req.user ? BigInt(cart.userId) : null,
        cartId: req.user ? cart.id : null,
        guestCartId: !req.user && req.guestCart ? cart.id : null,
        email: req.user?.email ?? req.body.email,
        total,
        paymentId: req.body.paymentId ?? null,
      });

      // ✅ 4. Clear cart after initiating checkout
      if (req.user) {
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      } else if (req.guestCart) {
        await prisma.guestCartItem.deleteMany({
          where: { guestCartId: cart.id },
        });
      }

      // ✅ 5. Respond with pending order info
      return ApiResponse.success(
        res,
        201,
        "Checkout initiated successfully — pending order created",
        order,
      );
    } catch (err) {
      handleError(res, err);
      next(err);
    }
  },
);

export default checkoutRouter;
