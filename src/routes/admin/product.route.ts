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
 *
 *               categoryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["c1f1bcb3-7a8f-4c19-9b2c-03d2e4f26a4d"]
 *
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: number
 *                 example: [4, 5, 6]
 *
 *               variants:
 *                 type: string
 *                 description: JSON stringified array of product variants
 *                 example: |
 *                   [
 *                     {
 *                       "sku": "VAR-001",
 *                       "size": "M",
 *                       "color": ["black"],
 *                       "stockQuantity": 20,
 *                       "price": 2500,
 *                       "salePrice": 2200,
 *                       "isActive": true
 *                     }
 *                   ]
 *
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
 *
 *               variants:
 *                 type: string
 *                 description: JSON stringified array of variants
 *                 example: |
 *                   [
 *                     {
 *                       "sku": "VAR-001",
 *                       "size": "M",
 *                       "color": ["red"],
 *                       "stockQuantity": 10,
 *                       "price": 100,
 *                       "salePrice": 90,
 *                       "isActive": true
 *                     },
 *                     {
 *                       "sku": "VAR-002",
 *                       "size": "L",
 *                       "color": ["blue"],
 *                       "stockQuantity": 5,
 *                       "price": 120
 *                     }
 *                   ]
 *
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

/**
 * @swagger
 * /admin/products/{productId}/variants/{variantId}/inventory:
 *   patch:
 *     summary: Adjust the inventory stock of a specific product variant
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
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Variant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - change
 *             properties:
 *               change:
 *                 type: integer
 *                 example: -2
 *     responses:
 *       200:
 *         description: Variant stock updated successfully
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Product or Variant not found
 *       401:
 *         description: Unauthorized
 */
productRouter.patch(
  "/:productId/variants/:variantId/inventory",
  roleGuard(["admin"]),
  AdminProductController.adjustVariantInventory,
);

/**
 * @swagger
 * /admin/products/{productId}/variants/{variantId}:
 *   patch:
 *     summary: Update specific product variant details (price, color array, size)
 *     tags: [Products (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *       - in: path
 *         name: variantId
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               price:
 *                 type: number
 *               salePrice:
 *                 type: number
 *               size:
 *                 type: string
 *               color:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Variant updated successfully
 */
productRouter.patch(
  "/:productId/variants/:variantId",
  roleGuard(["admin"]),
  AdminProductController.updateVariantDetails,
);

/**
 * @swagger
 * /admin/products/{productId}/variants/{variantId}/toggle:
 *   patch:
 *     summary: Visually toggle variant availability independently (soft-delete mapping)
 *     tags: [Products (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *       - in: path
 *         name: variantId
 *         required: true
 *     responses:
 *       200:
 *         description: Variant toggled successfully
 */
productRouter.patch(
  "/:productId/variants/:variantId/toggle",
  roleGuard(["admin"]),
  AdminProductController.toggleVariantActive,
);

/**
 * @swagger
 * /admin/products/{productId}/variants/{variantId}:
 *   delete:
 *     summary: Permanently delete an isolated product variant
 *     tags: [Products (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *       - in: path
 *         name: variantId
 *         required: true
 *     responses:
 *       200:
 *         description: Variant permanently deleted
 */
productRouter.delete(
  "/:productId/variants/:variantId",
  roleGuard(["admin"]),
  AdminProductController.deleteVariant,
);

export default productRouter;
