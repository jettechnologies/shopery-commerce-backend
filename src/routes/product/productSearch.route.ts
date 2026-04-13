import express from "express";
import {
  ProductSearchController,
  PublicProductController,
} from "@/controllers/customer";
import {
  authGuard,
  AuthRequest,
  roleGuard,
} from "@/middlewares/auth.middleware";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { GuestCartRequest } from "@/middlewares/guest-cart.middleware";

const publicSearchRouter = express.Router();

type RateLimitRequest = AuthRequest & GuestCartRequest;

export const searchLimiter = rateLimit({
  windowMs: 60 * 1000,

  max: (req: RateLimitRequest) => {
    if (req.user) return 100;
    if (req.guestCart) return 40;
    return 20;
  },

  keyGenerator: (req: RateLimitRequest) => {
    if (req.user) return `user-${req.user.userId}`;
    if (req.guestCart) return `guest-${req.guestCart.token}`;
    return `ip-${ipKeyGenerator(req.ip!)}`;
  },

  message: {
    status: 429,
    message: "Too many search requests. Slow down.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});

// Search routes for public access

/**
 * @swagger
 * tags:
 *   - name: product-search
 *     description: Endpoints for retrieving and filtering product information for users and admins.
 */

/**
 * @swagger
 * /product-search:
 *   get:
 *     summary: Search products
 *     description: Full-text search across products with ranking and filters.
 *     tags: [product-search]
 *     parameters:
 *       - in: query
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *           example: "iphone charger"
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
 *         description: Search results
 */
publicSearchRouter.get("/", searchLimiter, ProductSearchController.search);

/**
 * @swagger
 * /product-search/autocomplete:
 *   get:
 *     summary: Autocomplete suggestions
 *     description: Returns quick search suggestions for products.
 *     tags: [product-search]
 *     parameters:
 *       - in: query
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *           example: "iph"
 *     responses:
 *       200:
 *         description: Autocomplete results
 */
publicSearchRouter.get(
  "/autocomplete",
  searchLimiter,
  ProductSearchController.autocomplete,
);

export default publicSearchRouter;
