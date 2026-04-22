import { Router, Response } from "express";
import { OrderService } from "@/services/order.service";
import ApiResponse from "@/libs/ApiResponse";
import { handleError } from "@/libs/misc";
import { BadRequestError } from "@/libs/AppError";
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
 *
 *     OrderItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: OrderItem ID (BigInt serialized as string)
 *           example: "123"
 *         orderId:
 *           type: string
 *           example: "456"
 *         productId:
 *           type: string
 *           example: "789"
 *         variantId:
 *           type: string
 *           nullable: true
 *           example: "1011"
 *         quantity:
 *           type: integer
 *           example: 2
 *         unitPrice:
 *           type: string
 *           description: Decimal serialized as string
 *           example: "49.99"
 *         product:
 *           type: object
 *           properties:
 *             productId:
 *               type: string
 *             name:
 *               type: string
 *             slug:
 *               type: string
 *         variant:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: string
 *             size:
 *               type: string
 *             color:
 *               type: array
 *               items:
 *                 type: string
 *             price:
 *               type: number
 *             salePrice:
 *               type: number
 *               nullable: true
 *
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         status:
 *           type: string
 *           example: delivered
 *         total:
 *           type: string
 *           description: Decimal serialized as string
 *           example: "250.50"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         OrderItems:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *
 *     OrderHistory:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "1"
 *         orderId:
 *           type: string
 *           example: "ORD-12345"
 *         status:
 *           type: string
 *           example: "delivered"
 *         total:
 *           type: string
 *           example: "250.50"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         user:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               example: "john@example.com"
 *             name:
 *               type: string
 *               example: "John Doe"
 *
 *     Pagination:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 100
 *         totalPages:
 *           type: integer
 *           example: 10
 *         currentPage:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 10
 *
 *     OrdersResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Orders fetched successfully
 *         data:
 *           type: object
 *           properties:
 *             orders:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *             pagination:
 *               $ref: '#/components/schemas/Pagination'
 */

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
    if (
      req.user?.role !== "admin" &&
      order.userId !== BigInt(req.user!.userId)
    ) {
      return ApiResponse.error(
        res,
        403,
        "Forbidden: you do not own this order",
        "Authorization Error",
      );
    }
    return ApiResponse.success(res, 200, "Order fetched successfully", order);
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * @swagger
 * /orders/user/{userId}:
 *   get:
 *     summary: Get paginated orders for a user
 *     description: Returns a paginated list of orders for a user. Only the user or an admin can access.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         description: Page number (default is 1)
 *         schema:
 *           type: integer
 *           example: 1
 *
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Number of records per page (default is 10)
 *         schema:
 *           type: integer
 *           example: 10
 *
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrdersResponse'
 *
 *       403:
 *         description: Forbidden - cannot access another user's orders
 *
 *       404:
 *         description: User not found
 */
orderRouter.get("/user/:userId", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return ApiResponse.error(
        res,
        403,
        "Forbidden: cannot read another user's orders",
        "Authorization Error",
      );
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const orders = await OrderService.getOrdersByUser(
      req.user?.userId,
      page,
      limit,
    );

    return ApiResponse.success(res, 200, "Orders fetched successfully", orders);
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * @swagger
 * /orders/history:
 *   get:
 *     summary: Get all delivered orders - Paginated
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         required: false
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         required: false
 *         description: Number of orders per page
 *     responses:
 *       200:
 *         description: Successfully fetched order history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Order history fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderHistory:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/OrderHistory'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */

orderRouter.get("/history", async (req: AuthRequest, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const data = await OrderService.getOrderHistory(
      page,
      limit,
      req.user?.userId!,
    );

    return ApiResponse.success(
      res,
      200,
      "Order history fetched successfully",
      data,
    );
  } catch (err) {
    handleError(res, err);
  }
});

// /**
//  * @swagger
//  * /orders/{id}/status:
//  *   patch:
//  *     summary: Update order status
//  *     tags: [Orders]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               status:
//  *                 type: string
//  *                 enum: [pending, paid, failed, cancelled, shipped, delivered, refunded]
//  *     responses:
//  *       200:
//  *         description: Order status updated
//  */
// orderRouter.patch("/:id/status", async (req: AuthRequest, res: Response) => {
//   try {
//     if (req.user?.role !== "admin") {
//       return ApiResponse.error(res, 403, "Forbidden: only admins can update order status", "Authorization Error");
//     }
//     const { status } = req.body;
//     const order = await OrderService.updateOrderStatus(req.params.id, status);
//     return ApiResponse.success(res, 200, "Order status updated", order);
//   } catch (err) {
//     handleError(res, err);
//   }
// });

/**
 * @swagger
 * /orders/{id}/address:
 *   patch:
 *     summary: Update order shipping address
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               addressId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Order address updated
 *       400:
 *         description: Forbidden or invalid status
 *       404:
 *         description: Order or address not found
 */
orderRouter.patch("/:id/address", async (req: AuthRequest, res: Response) => {
  try {
    const { addressId } = req.body;
    if (!addressId) throw new BadRequestError("addressId is required");
    const isAdmin = req.user?.role === "admin";
    const order = await OrderService.updateOrderAddress(
      req.params.id,
      addressId,
      req.user!.userId,
      isAdmin,
    );
    return ApiResponse.success(res, 200, "Order address updated", order);
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
