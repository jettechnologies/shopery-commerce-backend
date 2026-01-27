import { Router } from "express";
import { AdminOrderController } from "@/controllers/admin/order.controller";
import { authGuard, roleGuard } from "@/middlewares/auth.middleware";

const orderRouter = Router();
orderRouter.use(authGuard, roleGuard(["admin"]));

/**
 * @swagger
 * tags:
 *   name: Orders (Admin)
 *   description: Admin Order Management
 */

/**
 * @swagger
 * /admin/orders:
 *   get:
 *     summary: Get all orders (paginated)
 *     tags: [Orders (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 */
orderRouter.get("/", AdminOrderController.getAllOrders);

/**
 * @swagger
 * /admin/orders/{orderId}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Orders (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, paid, failed, cancelled, shipped, delivered, refunded]
 *     responses:
 *       200:
 *         description: Order status updated
 *       400:
 *         description: Invalid status
 */
orderRouter.patch("/:orderId/status", AdminOrderController.updateOrderStatus);

export default orderRouter;
