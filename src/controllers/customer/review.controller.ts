import { Response } from "express";
import { AuthRequest } from "@/middlewares/auth.middleware";
import { ReviewService } from "@/services/review.service";
import ApiResponse from "@/libs/ApiResponse";
import { handleError } from "@/libs/misc";
import { CreateReviewSchema } from "@/schema/zod-schema/review.schema";
import { BadRequestError } from "@/libs/AppError";

export class ReviewController {
  static async create(req: AuthRequest, res: Response) {
    try {
      const data = CreateReviewSchema.parse(req.body);

      const userId = req.user ? req.user.userId : null;

      const review = await ReviewService.createReview(userId!, data);

      return ApiResponse.success(res, 201, "Review submitted", review);
    } catch (err) {
      handleError(res, err);
    }
  }

  static async getCursorProductReviews(req: AuthRequest, res: Response) {
    try {
      const { productId } = req.params;

      const { cursor, limit, direction, sortOrder } = req.query;

      const reviews = await ReviewService.getProductReviewsCursor(productId, {
        cursor: cursor as string | undefined,
        limit: limit ? Number(limit) : undefined,
        direction: direction as "next" | "prev" | undefined,
        sortOrder: sortOrder as "asc" | "desc" | undefined,
      });

      return ApiResponse.success(res, 200, "Reviews fetched", reviews);
    } catch (err) {
      handleError(res, err);
    }
  }

  static async getPageProductReviews(req: AuthRequest, res: Response) {
    try {
      const { productId } = req.params;
      const { page, limit, sortOrder } = req.query;

      const reviews = await ReviewService.getProductReviewsPage(productId, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        sortOrder: sortOrder as "asc" | "desc" | undefined,
      });

      return ApiResponse.success(res, 200, "Reviews fetched", reviews);
    } catch (err) {
      handleError(res, err);
    }
  }

  static async approve(req: AuthRequest, res: Response) {
    try {
      const { reviewId } = req.params;
      const { isApproved } = req.body;

      const review = await ReviewService.approveReview(
        reviewId,
        Boolean(isApproved),
      );

      return ApiResponse.success(res, 200, "Review updated", review);
    } catch (err) {
      handleError(res, err);
    }
  }
}
