import { Response } from "express";
import { AuthRequest } from "@/middlewares/auth.middleware";
import { CartService } from "@/services/cart.service";
import ApiResponse from "@/libs/ApiResponse";
import { handleError } from "@/libs/misc";
import {
  AddToCartSchema,
  UpdateCartItemSchema,
} from "@/schema/zod-schema/cart.schema";
import { BadRequestError } from "@/libs/AppError";

export class CartController {
  static async getCart(req: AuthRequest, res: Response) {
    try {
      if (!req.user) throw new BadRequestError("User not authenticated");
      const cart = await CartService.getCart(req.user.userId);
      return ApiResponse.success(res, 200, "Cart fetched successfully", cart);
    } catch (err) {
      handleError(res, err);
    }
  }

  static async addToCart(req: AuthRequest, res: Response) {
    try {
      if (!req.user) throw new BadRequestError("User not authenticated");
      const data = AddToCartSchema.parse(req.body);
      const cart = await CartService.addToCart(req.user.userId, data);
      return ApiResponse.success(res, 200, "Item added to cart", cart);
    } catch (err) {
      handleError(res, err);
    }
  }

  static async removeFromCart(req: AuthRequest, res: Response) {
    try {
      if (!req.user) throw new BadRequestError("User not authenticated");
      const { productId } = req.params;
      const cart = await CartService.removeFromCart(req.user.userId, productId);
      return ApiResponse.success(res, 200, "Item removed from cart", cart);
    } catch (err) {
      handleError(res, err);
    }
  }

  static async updateCartItem(req: AuthRequest, res: Response) {
    try {
      if (!req.user) throw new BadRequestError("User not authenticated");
      const { productId } = req.params;
      const data = UpdateCartItemSchema.parse(req.body);
      const cart = await CartService.updateCartItem(
        req.user.userId,
        productId,
        data.quantity
      );
      return ApiResponse.success(res, 200, "Cart item updated", cart);
    } catch (err) {
      handleError(res, err);
    }
  }

  static async clearCart(req: AuthRequest, res: Response) {
    try {
      if (!req.user) throw new BadRequestError("User not authenticated");
      const result = await CartService.clearCart(req.user.userId);
      return ApiResponse.success(res, 200, "Cart cleared", result);
    } catch (err) {
      handleError(res, err);
    }
  }
}
