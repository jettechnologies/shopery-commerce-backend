import { Router } from "express";
import { ProductCommentController } from "@/controllers/product.comment.controller";
import { authGuard, roleGuard } from "@/middlewares/auth.middleware";

const adminProductCommentRouter = Router();
adminProductCommentRouter.use(authGuard, roleGuard(["admin"]));

/**
 * @swagger
 * tags:
 *   name: Product Comments
 *   description: Product comments, replies, reactions, and moderation
 */

/**
 * @swagger
 * /admin/comments/{commentId}/:
 *   patch:
 *     summary: Admin update comment body
 *     tags: [Product Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               body:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       403:
 *         description: Admin access required
 */
adminProductCommentRouter.patch(
  "/comments/:commentId/",
  ProductCommentController.adminUpdate,
);

export default adminProductCommentRouter;
