import { Router } from "express";
import { AdminCategoryController } from "@/controllers/admin/category.controller";
import { authGuard } from "@/middlewares/auth.middleware";

const categoryRouter = Router();
categoryRouter.use(authGuard);

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category routes for users
 */

/**
 * @swagger
 * /admin/categories:
 *   get:
 *     summary: Get all categories (paginated)
 *     description: Retrieve a paginated list of all categories.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of categories per page
 *     responses:
 *       200:
 *         description: Successfully retrieved paginated list of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "ca34ad7b-7d5c-4e8b-87a4-99ac4b3e1c31"
 *                       name:
 *                         type: string
 *                         example: "Wireless Chargers"
 *                       description:
 *                         type: string
 *                         example: "Fast and efficient wireless chargers for devices"
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 */
categoryRouter.get("/", AdminCategoryController.getAllCategories);

/**
 * @swagger
 * /admin/categories/cursor:
 *   get:
 *     summary: Get all categories (cursor pagination)
 *     description: Retrieve categories using cursor-based pagination.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Cursor token for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of results to fetch
 *     responses:
 *       200:
 *         description: Successfully retrieved categories with cursor-based pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                 nextCursor:
 *                   type: string
 *                   example: "ca34ad7b-7d5c-4e8b-87a4-99ac4b3e1c31"
 */
categoryRouter.get("/cursor", AdminCategoryController.getAllCategoriesCursor);

export default categoryRouter;
