import { Router } from "express";
import { CartController } from "@/controllers/cart.controller";
import { authGuard } from "@/middlewares/auth.middleware";

const cartRouter = Router();

cartRouter.use(authGuard);

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Authenticated user cart operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AddToCart:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *       properties:
 *         productId:
 *           type: string
 *           format: uuid
 *           example: "b231f010-daa1-42e3-bc87-984a0382b8d2"
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           example: 2
 *     UpdateCartItem:
 *       type: object
 *       required:
 *         - quantity
 *       properties:
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           example: 3
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get current user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart fetched successfully
 *       404:
 *         description: Cart not found
 */
cartRouter.get("/", CartController.getCart);

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddToCart'
 *     responses:
 *       200:
 *         description: Item added to cart
 *       400:
 *         description: Invalid input or insufficient stock
 *       404:
 *         description: Product not found
 */
cartRouter.post("/", CartController.addToCart);

/**
 * @swagger
 * /cart/{productId}:
 *   patch:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCartItem'
 *     responses:
 *       200:
 *         description: Cart item updated
 *       404:
 *         description: Item or product not found
 */
cartRouter.patch("/:productId", CartController.updateCartItem);

/**
 * @swagger
 * /cart/{productId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Item removed from cart
 *       404:
 *         description: Item or product not found
 */
cartRouter.delete("/:productId", CartController.removeFromCart);

/**
 * @swagger
 * /cart:
 *   delete:
 *     summary: Clear cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared
 */
cartRouter.delete("/", CartController.clearCart);

export default cartRouter;
