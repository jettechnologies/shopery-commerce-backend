import { Router } from "express";
import { WishlistController } from "@/controllers/wishlist.controller";
import { authGuard } from "@/middlewares/auth.middleware";

const wishlistRouter = Router();

wishlistRouter.use(authGuard);

/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: User wishlist management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AddToWishlist:
 *       type: object
 *       required:
 *         - productId
 *       properties:
 *         productId:
 *           type: string
 *           format: uuid
 */

/**
 * @swagger
 * /wishlist:
 *   get:
 *     summary: Get user wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist fetched
 */
wishlistRouter.get("/", WishlistController.getWishlist);

/**
 * @swagger
 * /wishlist:
 *   post:
 *     summary: Add item to wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddToWishlist'
 *     responses:
 *       200:
 *         description: Item added
 *       400:
 *         description: Item already in wishlist or invalid input
 */
wishlistRouter.post("/", WishlistController.addToWishlist);

/**
 * @swagger
 * /wishlist/{productId}:
 *   delete:
 *     summary: Remove item from wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Item removed
 *       404:
 *         description: Item not in wishlist
 */
wishlistRouter.delete("/:productId", WishlistController.removeFromWishlist);

export default wishlistRouter;
