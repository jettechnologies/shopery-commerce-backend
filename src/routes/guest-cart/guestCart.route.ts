import { Router, Request, Response, NextFunction } from "express";
import { GuestCartService } from "@/services/guest-cart.service";
import ApiResponse from "@/libs/ApiResponse";
import { BadRequestError } from "@/libs/AppError";
import { handleError } from "@/libs/misc";
import { guestCartMiddleware } from "@/middlewares/guest-cart.middleware";
import { guestCartToken } from "@/utils/misc";

const guestCartRouter = Router();
guestCartRouter.use(guestCartMiddleware);

/**
 * @swagger
 * tags:
 *   name: GuestCart
 *   description: Guest cart operations (non-authenticated users)
 */

/**
 * @swagger
 * /guest-cart/create:
 *   post:
 *     summary: Create a new guest cart
 *     tags: [GuestCart]
 *     responses:
 *       201:
 *         description: Guest cart created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/GuestCartSchema"
 */

guestCartRouter.post(
  "/create",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cart = await GuestCartService.createGuestCart(req);

      // Optionally set cookie
      res.cookie(guestCartToken, cart.token, {
        httpOnly: true,
        sameSite: "lax",
        expires: cart.expiresAt,
      });

      return ApiResponse.success(res, 201, "Guest cart created successfully", {
        id: cart.id,
        token: cart.token,
        expiresAt: cart.expiresAt,
        items: cart.items,
      });
    } catch (err) {
      handleError(res, err);
      next(err);
    }
  },
);

/**
 * @swagger
 * components:
 *   schemas:
 *     AddGuestCartItem:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *         - unitPrice
 *       properties:
 *         productId:
 *           type: integer
 *           example: 101
 *         quantity:
 *           type: integer
 *           example: 2
 *         unitPrice:
 *           type: number
 *           format: float
 *           example: 4500.50
 *     GuestCartItemResponse:
 *       type: object
 *       properties:
 *         guestCartToken:
 *           type: string
 *           example: "f82bcd10-22a1-45e3-93b0-01892908ea10"
 *         guestCartItem:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 12
 *             productId:
 *               type: integer
 *               example: 101
 *             quantity:
 *               type: integer
 *               example: 2
 *             unitPrice:
 *               type: number
 *               example: 4500.50
 *             guestCartId:
 *               type: integer
 *               example: 8
 *     GuestCartResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 8
 *         token:
 *           type: string
 *           example: "f82bcd10-22a1-45e3-93b0-01892908ea10"
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           example: "2025-10-14T09:10:35.123Z"
 *         items:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/AddGuestCartItem"
 */

/**
 * @swagger
 * /guest-cart/add:
 *   post:
 *     summary: Add item to guest cart (auto-creates cart if missing)
 *     tags: [GuestCart]
 *     parameters:
 *       - in: header
 *         name: x-guest-token
 *         schema:
 *           type: string
 *         required: false
 *         description: Token of the existing guest cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/AddGuestCartItem"
 *     responses:
 *       200:
 *         description: Item added to guest cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/GuestCartItemResponse"
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Guest cart not found
 */
guestCartRouter.post(
  "/add",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await GuestCartService.addItem(req, req.body);
      return ApiResponse.success(res, 200, "Item added to guest cart", data);
    } catch (err) {
      handleError(res, err);
      next(err);
    }
  },
);

/**
 * @swagger
 * /guest-cart:
 *   get:
 *     summary: Get current guest cart by token
 *     tags: [GuestCart]
 *     parameters:
 *       - in: header
 *         name: x-guest-token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token of the guest cart
 *     responses:
 *       200:
 *         description: Returns guest cart with items
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/GuestCartResponse"
 *       404:
 *         description: Guest cart not found
 */
guestCartRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token =
        (req.headers["x-guest-token"] as string) ||
        (req.cookies?.guestToken as string);

      if (!token) throw new BadRequestError("Guest token missing");

      const cart = await GuestCartService.getGuestCart(token);
      return ApiResponse.success(res, 200, "Guest cart fetched", cart);
    } catch (err) {
      handleError(res, err);
      next(err);
    }
  },
);

/**
 * @swagger
 * /guest-cart/item/{productId}:
 *   delete:
 *     summary: Remove a specific item from the guest cart
 *     tags: [GuestCart]
 *     parameters:
 *       - in: header
 *         name: x-guest-token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token of the guest cart
 *       - in: path
 *         name: productId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the product to remove
 *     responses:
 *       200:
 *         description: Item removed successfully
 */
guestCartRouter.delete(
  "/item/:productId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token =
        (req.headers["x-guest-token"] as string) ||
        (req.cookies?.guestToken as string);

      if (!token) throw new BadRequestError("Guest token missing");

      const productId = BigInt(req.params.productId);
      const result = await GuestCartService.removeItem(token, productId);

      return ApiResponse.success(
        res,
        200,
        "Item removed from guest cart",
        result,
      );
    } catch (err) {
      handleError(res, err);
      next(err);
    }
  },
);

/**
 * @swagger
 * /guest-cart/clear:
 *   delete:
 *     summary: Clear all items from the guest cart
 *     tags: [GuestCart]
 *     parameters:
 *       - in: header
 *         name: x-guest-token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token of the guest cart
 *     responses:
 *       200:
 *         description: Guest cart cleared successfully
 */
guestCartRouter.delete(
  "/clear",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token =
        (req.headers["x-guest-token"] as string) ||
        (req.cookies?.guestToken as string);

      if (!token) throw new BadRequestError("Guest token missing");

      const result = await GuestCartService.clearCart(token);
      return ApiResponse.success(res, 200, "Guest cart cleared", result);
    } catch (err) {
      handleError(res, err);
      next(err);
    }
  },
);

/**
 * @swagger
 * /guest-cart/merge:
 *   post:
 *     summary: Merge guest cart into logged-in user cart
 *     tags: [GuestCart]
 *     parameters:
 *       - in: header
 *         name: x-guest-token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token of the guest cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Guest cart merged into user cart
 */
guestCartRouter.post(
  "/merge",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token =
        (req.headers["x-guest-token"] as string) ||
        (req.cookies?.guestToken as string);

      if (!token) throw new BadRequestError("Guest token missing");
      if (!req.body.userId) throw new BadRequestError("User ID is required");

      const merged = await GuestCartService.mergeIntoUserCart(
        token,
        req.body.userId,
      );

      return ApiResponse.success(
        res,
        200,
        "Guest cart merged successfully",
        merged,
      );
    } catch (err) {
      handleError(res, err);
      next(err);
    }
  },
);

export default guestCartRouter;
