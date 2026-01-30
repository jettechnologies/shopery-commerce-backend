import { Router } from "express";
import { ProductCommentController } from "@/controllers/product.comment.controller";
import { authGuard, roleGuard } from "@/middlewares/auth.middleware";

const productCommentRouter = Router();

productCommentRouter.use(authGuard);

/**
 * @swagger
 * tags:
 *   name: Product Comments
 *   description: Product comments, replies, reactions, and moderation
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateProductComment:
 *       type: object
 *       required:
 *         - productId
 *         - body
 *       properties:
 *         productId:
 *           type: string
 *           format: uuid
 *           example: "b231f010-daa1-42e3-bc87-984a0382b8d2"
 *         parentId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           example: "9e0a2c6a-6f25-4e58-b9e3-61b8fcbdf4b1"
 *         body:
 *           type: string
 *           example: "This product is really solid and well-built."
 *
 *     CommentUser:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           example: "user_123"
 *         email:
 *           type: string
 *           example: "user@example.com"
 *
 *     ProductComment:
 *       type: object
 *       properties:
 *         commentId:
 *           type: string
 *           example: "cmt_123"
 *         body:
 *           type: string
 *         isDeleted:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         user:
 *           $ref: '#/components/schemas/CommentUser'
 *         replies:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductComment'
 *         likes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CommentUser'
 *         dislikes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CommentUser'
 *
 *     CommentReaction:
 *       type: object
 *       required:
 *         - type
 *       properties:
 *         type:
 *           type: string
 *           enum: [like, dislike]
 */

/**
 * @swagger
 * /products/{productId}/comments:
 *   get:
 *     summary: Get product comments (cursor pagination)
 *     tags: [Product Comments]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: cursor
 *     security:
 *       - bearerAuth: []
 *         schema:
 *           type: string
 *         description: Cursor for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Comments fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProductComment'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                     nextCursor:
 *                       type: string
 *                       nullable: true
 */
productCommentRouter.get(
  "/products/:productId/comments",
  ProductCommentController.getComments,
);

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a product comment or reply
 *     tags: [Product Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductComment'
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
productCommentRouter.post("/comments", ProductCommentController.create);

/**
 * @swagger
 * /comments/{commentId}:
 *   delete:
 *     summary: Delete a comment (soft delete)
 *     tags: [Product Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       403:
 *         description: Forbidden
 */
productCommentRouter.delete(
  "/comments/:commentId",
  roleGuard(["admin", "user"]),
  ProductCommentController.delete,
);

/**
 * @swagger
 * /comments/{commentId}/react:
 *   post:
 *     summary: Like or dislike a comment
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
 *             $ref: '#/components/schemas/CommentReaction'
 *     responses:
 *       200:
 *         description: Comment reaction updated
 */
productCommentRouter.post(
  "/comments/:commentId/react",
  ProductCommentController.react,
);

export default productCommentRouter;
