import { Router, Response } from "express";
import { OrderService } from "@/services/order.service";
import ApiResponse from "@/libs/ApiResponse";
import { handleError } from "@/libs/misc";
import { authGuard, AuthRequest } from "@/middlewares/auth.middleware";
import { guestCartToken } from "@/utils/misc";

const orderRouter = Router();
orderRouter.use(authGuard);

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management for both guest and registered users
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateOrder:
 *       type: object
 *       required:
 *         - email
 *         - total
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *           description: Optional ID of the logged-in user
 *         cartId:
 *           type: string
 *           format: int64
 *           description: Optional ID of the user's cart
 *         guestCartId:
 *           type: string
 *           format: int64
 *           description: Optional ID of the guest cart
 *         email:
 *           type: string
 *           format: email
 *           description: Email address to send the order confirmation
 *         total:
 *           type: number
 *           format: float
 *           description: Total amount for the order
 *         paymentId:
 *           type: string
 *           nullable: true
 *           description: Optional payment provider ID
 *       example:
 *         userId: "09f3ef2a-2030-409c-9f2a-4c1f61daa9c7"
 *         cartId: "1"
 *         guestCartId: null
 *         email: "john.doe@maildrop.cc"
 *         total: 120.5
 *         paymentId: "pay_12345"
 *
 * /orders/create:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrder'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Order ID
 *                 userId:
 *                   type: string
 *                   nullable: true
 *                 cartId:
 *                   type: string
 *                   nullable: true
 *                 guestCartId:
 *                   type: string
 *                   nullable: true
 *                 email:
 *                   type: string
 *                 total:
 *                   type: number
 *                 paymentId:
 *                   type: string
 *                   nullable: true
 *                 status:
 *                   type: string
 *                   enum: [pending, paid, failed, cancelled, shipped, delivered, refunded]
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 */

orderRouter.post("/create", async (req: AuthRequest, res: Response) => {
  try {
    const payload = {
      ...req.body,
      userId: req.user?.userId ?? req.body.userId,
      email: req.user?.email ?? req.body.email,
    };

    const order = await OrderService.createOrder(payload);
    res.clearCookie(guestCartToken, { httpOnly: true, sameSite: "lax" });
    return ApiResponse.success(res, 201, "Order created successfully", order);
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get a single order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 */
orderRouter.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const order = await OrderService.getOrderById(req.params.id);
    return ApiResponse.success(res, 200, "Order fetched successfully", order);
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * @swagger
 * /orders/user/{userId}:
 *   get:
 *     summary: Get all orders for a specific user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of orders
 */
orderRouter.get("/user/:userId", async (req: AuthRequest, res: Response) => {
  try {
    const orders = await OrderService.getOrdersByUser(req.params.userId);
    return ApiResponse.success(res, 200, "Orders fetched successfully", orders);
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, paid, failed, cancelled, shipped, delivered, refunded]
 *     responses:
 *       200:
 *         description: Order status updated
 */
orderRouter.patch("/:id/status", async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const order = await OrderService.updateOrderStatus(req.params.id, status);
    return ApiResponse.success(res, 200, "Order status updated", order);
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * @swagger
 * /orders/{id}/cancel:
 *   patch:
 *     summary: Cancel an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 */
orderRouter.patch("/:id/cancel", async (req: AuthRequest, res: Response) => {
  try {
    const order = await OrderService.cancelOrder(req.params.id);
    return ApiResponse.success(res, 200, "Order cancelled successfully", order);
  } catch (err) {
    handleError(res, err);
  }
});

export default orderRouter;
