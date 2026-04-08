import { Router } from "express";
import { CartController } from "@/controllers/cart.controller";
import { authGuard, AuthRequest } from "@/middlewares/auth.middleware";
import rateLimit from "express-rate-limit";
import { GuestCartRequest } from "@/middlewares/guest-cart.middleware";

const cartRouter = Router();

cartRouter.use(authGuard);

// Combined type: either AuthRequest (user) or GuestCartRequest (guest)
type RateLimitRequest = AuthRequest & GuestCartRequest;

export const updateCartLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: (req: RateLimitRequest) => {
    if (req.user) return 50;

    if (req.guestCart) return 20;

    return 10;
  },
  keyGenerator: (req: RateLimitRequest) => {
    const key = req.user?.userId || req.guestCart?.token || req.ip;
    return key ?? "unknown";
  },
  message: {
    status: 429,
    message: "Too many requests. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

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
 *         - variantId
 *         - quantity
 *       properties:
 *         productId:
 *           type: string
 *           format: uuid
 *           example: "b231f010-daa1-42e3-bc87-984a0382b8d2"
 *         variantId:
 *           type: integer
 *           minimum: 1
 *           example: 2
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
 * /cart/{cartItemId}:
 *   patch:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Explicit Cart Item ID resolving accurate variant groupings
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
 *         description: Item not found
 */
cartRouter.patch(
  "/:cartItemId",
  updateCartLimiter,
  CartController.updateCartItem,
);

/**
 * @swagger
 * /cart/{cartItemId}:
 *   delete:
 *     summary: Remove explicitly isolated item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Explicit Cart Item ID mapped to exact variant bounds
 *     responses:
 *       200:
 *         description: Item removed from cart
 *       404:
 *         description: Item not found
 */
cartRouter.delete("/:cartItemId", CartController.removeFromCart);

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
