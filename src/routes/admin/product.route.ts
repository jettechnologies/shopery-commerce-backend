import { Router } from "express";
import { AdminProductController } from "@/controllers/admin/product.controller";
import { authGuard, roleGuard } from "@/middlewares/auth.middleware";
import {
  uploadMultiple,
  handleMulterError,
} from "@/middlewares/multer.middleware"; // handles image uploadMultiples

const productRouter = Router();
productRouter.use(authGuard, handleMulterError);

/**
 * @swagger
 * tags:
 *   name: Products (Admin)
 *   description: Admin Routes
 */

/**
 * @swagger
 * /admin/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products (Admin)]
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
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Wireless Charging Pad"
 *               description:
 *                 type: string
 *                 example: "Fast 15W wireless charger for mobile devices"
 *               shortDescription:
 *                 type: string
 *                 example: "Compact wireless charger"
 *               price:
 *                 type: number
 *                 example: 2500
 *               salePrice:
 *                 type: number
 *                 example: 2200
 *               sku:
 *                 type: string
 *                 example: "GM-CHARGER-001"
 *               stockQuantity:
 *                 type: integer
 *                 example: 50
 *               weight:
 *                 type: number
 *                 example: 0.4
 *               dimensions:
 *                 type: string
 *                 example: "10x10x2cm"
 *               categoryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["c1f1bcb3-7a8f-4c19-9b2c-03d2e4f26a4d"]
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: number
 *                 example: [4, 5, 6]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */
productRouter.post(
  "/",
  roleGuard(["admin"]),
  uploadMultiple("images"),
  AdminProductController.createProduct,
);

/**
 * @swagger
 * /admin/products/{productId}:
 *   patch:
 *     summary: Update an existing product
 *     tags: [Products (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               shortDescription:
 *                 type: string
 *               price:
 *                 type: number
 *               salePrice:
 *                 type: number
 *               sku:
 *                 type: string
 *               stockQuantity:
 *                 type: integer
 *               weight:
 *                 type: number
 *               dimensions:
 *                 type: string
 *               categoryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 */
productRouter.patch(
  "/:productId",
  roleGuard(["admin"]),
  uploadMultiple("images"),
  AdminProductController.updateProduct,
);

/**
 * @swagger
 * /admin/products/{productId}/toggle:
 *   patch:
 *     summary: Toggle a product’s active state (soft delete / restore)
 *     tags: [Products (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product state toggled successfully
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 */
productRouter.patch(
  "/:productId/toggle",
  roleGuard(["admin"]),
  AdminProductController.toggleProductActive,
);

/**
 * @swagger
 * /admin/products/{productId}:
 *   delete:
 *     summary: Permanently delete a product
 *     tags: [Products (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 */
productRouter.delete(
  "/:productId",
  roleGuard(["admin"]),
  AdminProductController.deleteProduct,
);

export default productRouter;
