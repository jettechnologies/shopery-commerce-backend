import { Router } from "express";
import { AdminCategoryController } from "@/controllers/admin/category.controller";
import { authGuard, roleGuard } from "@/middlewares/auth.middleware";

const categoryRouter = Router();
categoryRouter.use(authGuard);

/**
 * @swagger
 * tags:
 *   name: Categories (Admin)
 *   description: Category management routes for administrators
 */

/**
 * @swagger
 * /admin/categories:
 *   post:
 *     summary: Create a new category
 *     description: Admin-only endpoint to create a new category.
 *     tags: [Categories (Admin)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Wireless Charging Pad"
 *               description:
 *                 type: string
 *                 example: "Fast 15W wireless charger for mobile devices"
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Invalid request payload
 *       401:
 *         description: Unauthorized access
 */
categoryRouter.post(
  "/",
  roleGuard(["admin"]),
  AdminCategoryController.createCategory,
);

/**
 * @swagger
 * /admin/categories/{id}:
 *   patch:
 *     summary: Update an existing category
 *     description: Admin-only endpoint to update a category by its ID.
 *     tags: [Categories (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the category to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Category Name"
 *               description:
 *                 type: string
 *                 example: "Updated description for this category"
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Invalid request payload
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Category not found
 */
categoryRouter.patch(
  "/:id",
  roleGuard(["admin"]),
  AdminCategoryController.updateCategory,
);

/**
 * @swagger
 * /admin/categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     description: Admin-only endpoint to permanently delete a category by ID.
 *     tags: [Categories (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Category not found
 */
categoryRouter.delete(
  "/:id",
  roleGuard(["admin"]),
  AdminCategoryController.deleteCategory,
);

/**
 * @swagger
 * /admin/categories/{id}:
 *   get:
 *     summary: Get a single category by ID
 *     description: Retrieve the details of a specific category by its ID.
 *     tags: [Categories (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "ca34ad7b-7d5c-4e8b-87a4-99ac4b3e1c31"
 *                 name:
 *                   type: string
 *                   example: "Wireless Chargers"
 *                 description:
 *                   type: string
 *                   example: "Fast and efficient wireless chargers for devices"
 *       404:
 *         description: Category not found
 */
categoryRouter.get(
  "/:id",
  roleGuard(["admin"]),
  AdminCategoryController.getCategoryById,
);

export default categoryRouter;

// /**
//  * @swagger
//  * /admin/categories:
//  *   get:
//  *     summary: Get all categories (paginated)
//  *     description: Retrieve a paginated list of all categories.
//  *     tags: [Categories (Admin)]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: page
//  *         schema:
//  *           type: integer
//  *         description: The page number for pagination
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *         description: Number of categories per page
//  *     responses:
//  *       200:
//  *         description: Successfully retrieved paginated list of categories
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 data:
//  *                   type: array
//  *                   items:
//  *                     type: object
//  *                     properties:
//  *                       id:
//  *                         type: string
//  *                         example: "ca34ad7b-7d5c-4e8b-87a4-99ac4b3e1c31"
//  *                       name:
//  *                         type: string
//  *                         example: "Wireless Chargers"
//  *                       description:
//  *                         type: string
//  *                         example: "Fast and efficient wireless chargers for devices"
//  *                 meta:
//  *                   type: object
//  *                   properties:
//  *                     total:
//  *                       type: integer
//  *                     page:
//  *                       type: integer
//  *                     limit:
//  *                       type: integer
//  */
// categoryRouter.get(
//   "/",
//   roleGuard(["admin"]),
//   AdminCategoryController.getAllCategories
// );

// /**
//  * @swagger
//  * /admin/categories/cursor:
//  *   get:
//  *     summary: Get all categories (cursor pagination)
//  *     description: Retrieve categories using cursor-based pagination.
//  *     tags: [Categories (Admin)]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: cursor
//  *         schema:
//  *           type: string
//  *         description: Cursor token for pagination
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *         description: Number of results to fetch
//  *     responses:
//  *       200:
//  *         description: Successfully retrieved categories with cursor-based pagination
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 data:
//  *                   type: array
//  *                   items:
//  *                     type: object
//  *                     properties:
//  *                       id:
//  *                         type: string
//  *                       name:
//  *                         type: string
//  *                       description:
//  *                         type: string
//  *                 nextCursor:
//  *                   type: string
//  *                   example: "ca34ad7b-7d5c-4e8b-87a4-99ac4b3e1c31"
//  */
// categoryRouter.get(
//   "/cursor",
//   roleGuard(["admin"]),
//   AdminCategoryController.getAllCategoriesCursor
// );
