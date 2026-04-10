import { Router } from "express";
import { AdminCategoryController } from "@/controllers/admin/category.controller";
import { authGuard, roleGuard } from "@/middlewares/auth.middleware";
import {
  handleMulterError,
  uploadSingle,
} from "@/middlewares/multer.middleware";

const categoryRouter = Router();
categoryRouter.use(authGuard, handleMulterError);

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
 *     description: Admin-only endpoint to create a new category with an optional image.
 *     tags: [Categories (Admin)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
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
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Category image file
 *     responses:
 *       201:
 *         description: Category created successfully
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
 *                   example: "Category created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "c1f1bcb3-7a8f-4c19-9b2c-03d2e4f26a4d"
 *                     name:
 *                       type: string
 *                       example: "Wireless Charging Pad"
 *                     slug:
 *                       type: string
 *                       example: "wireless-charging-pad"
 *                     description:
 *                       type: string
 *                       example: "Fast 15W wireless charger for mobile devices"
 *                     imageUrl:
 *                       type: string
 *                       example: "https://res.cloudinary.com/demo/image/upload/v123/category.jpg"
 *       400:
 *         description: Invalid request payload
 *       401:
 *         description: Unauthorized access
 */
categoryRouter.post(
  "/",
  roleGuard(["admin"]),
  uploadSingle("image"),
  AdminCategoryController.createCategory,
);

/**
 * @swagger
 * /admin/categories/{id}:
 *   patch:
 *     summary: Update an existing category
 *     description: Admin-only endpoint to update a category by its ID, including optional image replacement.
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
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Category Name"
 *               description:
 *                 type: string
 *                 example: "Updated description for this category"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New category image (optional, replaces existing one)
 *     responses:
 *       200:
 *         description: Category updated successfully
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
 *                   example: "Category updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "c1f1bcb3-7a8f-4c19-9b2c-03d2e4f26a4d"
 *                     name:
 *                       type: string
 *                       example: "Updated Category Name"
 *                     slug:
 *                       type: string
 *                       example: "updated-category-name"
 *                     description:
 *                       type: string
 *                       example: "Updated description for this category"
 *                     imageUrl:
 *                       type: string
 *                       example: "https://res.cloudinary.com/demo/image/upload/v123/category.jpg"
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
  uploadSingle("image"),
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
