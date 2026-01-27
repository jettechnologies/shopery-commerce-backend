import { Response } from "express";
import { AuthRequest } from "@/middlewares/auth.middleware";
import { WishlistService } from "@/services/wishlist.service";
import ApiResponse from "@/libs/ApiResponse";
import { handleError } from "@/libs/misc";
import { AddToWishlistSchema } from "@/schema/zod-schema/wishlist.schema";
import { BadRequestError } from "@/libs/AppError";

export class WishlistController {
  static async getWishlist(req: AuthRequest, res: Response) {
    try {
      if (!req.user) throw new BadRequestError("User not authenticated");
      const wishlist = await WishlistService.getWishlist(req.user.userId);
      return ApiResponse.success(res, 200, "Wishlist fetched", wishlist);
    } catch (err) {
      handleError(res, err);
    }
  }

  static async addToWishlist(req: AuthRequest, res: Response) {
    try {
      if (!req.user) throw new BadRequestError("User not authenticated");
      const data = AddToWishlistSchema.parse(req.body);
      const wishlist = await WishlistService.addToWishlist(
        req.user.userId,
        data
      );
      return ApiResponse.success(res, 200, "Item added to wishlist", wishlist);
    } catch (err) {
      handleError(res, err);
    }
  }

  static async removeFromWishlist(req: AuthRequest, res: Response) {
    try {
      if (!req.user) throw new BadRequestError("User not authenticated");
      const { productId } = req.params;
      const wishlist = await WishlistService.removeFromWishlist(
        req.user.userId,
        productId
      );
      return ApiResponse.success(
        res,
        200,
        "Item removed from wishlist",
        wishlist
      );
    } catch (err) {
      handleError(res, err);
    }
  }
}
