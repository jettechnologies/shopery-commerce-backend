import express from "express";
import { ReviewController } from "@/controllers/customer/review.controller";
import { authGuard, roleGuard } from "@/middlewares/auth.middleware";

const adminReviewRouter = express.Router();

adminReviewRouter.use(authGuard, roleGuard(["admin"]));

/**
 * @swagger
 * tags:
 *   name: Reviews (Admin)
 *   description: Admin Reviews Management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ApproveReviewRequest:
 *       type: object
 *       required:
 *         - isApproved
 *       properties:
 *         isApproved:
 *           type: boolean
 *           description: Set to true to approve the review, false to reject.
 *
 * /admin/reviews/{reviewId}/approve:
 *   patch:
 *     summary: Approve or reject a review
 *     description: Admin-only endpoint to approve or reject a review.
 *     tags: [Reviews (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the review to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApproveReviewRequest'
 *     responses:
 *       200:
 *         description: Review approval status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       404:
 *         description: Review not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – Admin access required
 */

/**
 * @swagger
 * /admin/reviews/{reviewId}/approve:
 *   patch:
 *     summary: Approve or reject a review
 *     description: Admin-only endpoint to approve or reject a review.
 *     tags: [Reviews (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: The review ID to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isApproved:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Review approval status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 */
adminReviewRouter.patch("/:reviewId/approve", ReviewController.approve);

export default adminReviewRouter;
