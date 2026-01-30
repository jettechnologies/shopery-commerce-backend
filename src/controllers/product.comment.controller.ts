import { Response } from "express";
import { AuthRequest } from "@/middlewares/auth.middleware";
import { ProductCommentService } from "@/services/product.comment.service";
import ApiResponse from "@/libs/ApiResponse";
import { handleError } from "@/libs/misc";
import { BadRequestError } from "@/libs/AppError";
import { CreateProductCommentSchema } from "@/schema/zod-schema";

export class ProductCommentController {
  static async create(req: AuthRequest, res: Response) {
    try {
      if (!req.user) throw new BadRequestError("User not authenticated");

      const data = CreateProductCommentSchema.parse(req.body);

      const comment = await ProductCommentService.createComment(
        req.user.userId,
        data,
      );

      return ApiResponse.success(
        res,
        201,
        "Comment created successfully",
        comment,
      );
    } catch (err) {
      handleError(res, err);
    }
  }

  static async getComments(req: AuthRequest, res: Response) {
    try {
      const { productId } = req.params;
      if (!productId) throw new BadRequestError("Product ID is required");

      const { cursor, limit, sortOrder } = req.query;

      const comments = await ProductCommentService.getCommentsCursor(
        productId,
        {
          cursor: cursor as string | undefined,
          limit: limit ? Number(limit) : undefined,
          sortOrder: sortOrder as "asc" | "desc" | undefined,
        },
      );

      return ApiResponse.success(
        res,
        200,
        "Comments fetched successfully",
        comments,
      );
    } catch (err) {
      handleError(res, err);
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      if (!req.user) throw new BadRequestError("User not authenticated");

      const { commentId } = req.params;
      if (!commentId) throw new BadRequestError("Comment ID is required");

      const isAdmin = req.user.role === "admin";

      const result = await ProductCommentService.deleteComment(
        commentId,
        req.user.userId,
        isAdmin,
      );

      return ApiResponse.success(
        res,
        200,
        "Comment deleted successfully",
        result,
      );
    } catch (err) {
      handleError(res, err);
    }
  }

  static async react(req: AuthRequest, res: Response) {
    try {
      if (!req.user) throw new BadRequestError("User not authenticated");

      const { commentId } = req.params;
      const { type } = req.body;

      if (!commentId) throw new BadRequestError("Comment ID is required");
      if (!["like", "dislike"].includes(type))
        throw new BadRequestError("Invalid reaction type");

      const result = await ProductCommentService.reactComment(
        commentId,
        req.user.userId,
        type,
      );

      return ApiResponse.success(
        res,
        200,
        `Comment ${type}d successfully`,
        result,
      );
    } catch (err) {
      handleError(res, err);
    }
  }

  static async adminUpdate(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== "admin")
        throw new BadRequestError("Admin access required");

      const { commentId } = req.params;
      const { body } = req.body;

      if (!commentId) throw new BadRequestError("Comment ID is required");
      if (!body) throw new BadRequestError("Body is required");

      const updated = await ProductCommentService.updateCommentAdmin(
        commentId,
        body,
      );

      return ApiResponse.success(
        res,
        200,
        "Comment updated successfully",
        updated,
      );
    } catch (err) {
      handleError(res, err);
    }
  }
}
