import express from "express";
import { ReviewController } from "@/controllers/customer/review.controller";
import { authGuard, roleGuard } from "@/middlewares/auth.middleware";

const reviewRouter = express.Router();

// Apply authentication for all review routes
reviewRouter.use(authGuard);

/**
 * @swagger
 * tags:
 *   - name: Reviews
 *     description: Endpoints for creating, fetching, and managing product reviews
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateReview:
 *       type: object
 *       required:
 *         - productId
 *         - rating
 *         - title
 *         - body
 *       properties:
 *         productId:
 *           type: string
 *           description: Unique ID of the product being reviewed
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: Rating score between 1 and 5
 *         title:
 *           type: string
 *           description: Short title for the review
 *         body:
 *           type: string
 *           description: Detailed review text
 *
 *     ReviewUser:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *         email:
 *           type: string
 *
 *     Review:
 *       type: object
 *       properties:
 *         reviewId:
 *           type: string
 *           description: Unique ID of the review
 *         productId:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/ReviewUser'
 *         rating:
 *           type: integer
 *         title:
 *           type: string
 *         body:
 *           type: string
 *         isApproved:
 *           type: boolean
 *           description: Approval status of the review
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     ReviewPaginationCursor:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Review'
 *         pagination:
 *           type: object
 *           properties:
 *             limit:
 *               type: integer
 *             hasNextPage:
 *               type: boolean
 *             hasPreviousPage:
 *               type: boolean
 *             nextCursor:
 *               type: string
 *               nullable: true
 *             prevCursor:
 *               type: string
 *               nullable: true
 *
 *     ReviewPaginationPage:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Review'
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             totalPages:
 *               type: integer
 *             currentPage:
 *               type: integer
 *             limit:
 *               type: integer
 *             hasNextPage:
 *               type: boolean
 *             hasPreviousPage:
 *               type: boolean
 */

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Submit a review for a product
 *     description: Create a review for a product. User can only submit one review per product.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReview'
 *     responses:
 *       201:
 *         description: Review submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Review submitted"
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 */
reviewRouter.post("/", ReviewController.create);

/**
 * @swagger
 * /reviews/product/{productId}/cursor:
 *   get:
 *     summary: Get product reviews (cursor pagination)
 *     description: Fetch product reviews using cursor-based pagination. Supports forward and backward paging.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID to fetch reviews for.
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Cursor token for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: direction
 *         schema:
 *           type: string
 *           enum: [next, prev]
 *           default: next
 *         description: Pagination direction.
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order by createdAt.
 *     responses:
 *       200:
 *         description: Product reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPreviousPage:
 *                       type: boolean
 *                     nextCursor:
 *                       type: string
 *                       nullable: true
 *                     prevCursor:
 *                       type: string
 *                       nullable: true
 */
reviewRouter.get(
  "/product/:productId/cursor",
  ReviewController.getCursorProductReviews,
);

/**
 * @swagger
 * /reviews/product/{productId}/page:
 *   get:
 *     summary: Get product reviews (page pagination)
 *     description: Fetch product reviews using traditional page-based pagination.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
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
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Product reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPreviousPage:
 *                       type: boolean
 */
reviewRouter.get(
  "/product/:productId/page",
  ReviewController.getPageProductReviews,
);

export default reviewRouter;
