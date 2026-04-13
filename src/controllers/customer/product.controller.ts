import { Request, Response } from "express";
import { PublicProductService } from "@/services/publicProduct.service";
import { PublicProductFilterService } from "@/services/publicProductFilter.service";
import ApiResponse from "@/libs/ApiResponse";
import { handleError } from "@/libs/misc";

export class PublicProductController {
  static async getAllProducts(req: Request, res: Response) {
    try {
      const { page, limit, sortOrder } = req.query;
      const data = await PublicProductService.getAllProducts({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        sortOrder: (sortOrder as "asc" | "desc") || "desc",
      });

      return ApiResponse.success(
        res,
        200,
        "All Products fetched successfully",
        data,
      );
    } catch (error) {
      handleError(res, error);
    }
  }

  static async getAllProductsCursor(req: Request, res: Response) {
    try {
      const { limit, cursor, sortOrder } = req.query;
      const data = await PublicProductService.getAllProductCursor({
        limit: Number(limit) || 10,
        cursor: cursor as string,
        sortOrder: (sortOrder as "asc" | "desc") || "desc",
      });

      return ApiResponse.success(
        res,
        200,
        "All Products fetched successfully",
        data,
      );
    } catch (error) {
      handleError(res, error);
    }
  }

  static async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await PublicProductService.getProductById(id);
      if (!product)
        return res.status(404).json({ message: "Product not found" });

      return ApiResponse.success(
        res,
        200,
        "Product details fetched successfully",
        product,
      );
    } catch (err) {
      handleError(res, err);
    }
  }

  static async getProductBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const product = await PublicProductService.getProductBySlug(slug);
      if (!product)
        return res.status(404).json({ message: "Product not found" });

      return ApiResponse.success(
        res,
        200,
        "Product details fetched successfully",
        product,
      );
    } catch (err) {
      handleError(res, err);
    }
  }

  static async getFilteredProducts(req: Request, res: Response) {
    try {
      const {
        page,
        limit,
        categorySlug,
        tagSlug,
        minPrice,
        maxPrice,
        minRating,
        sortBy,
      } = req.query;

      const data = await PublicProductFilterService.getFilteredProducts({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        categorySlug: categorySlug as string,
        tagSlug: tagSlug as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        minRating: minRating ? Number(minRating) : undefined,
        sortBy: sortBy as any,
      });

      return ApiResponse.success(
        res,
        200,
        "Filtered Products fetched successfully",
        data,
      );
    } catch (err) {
      handleError(res, err);
    }
  }

  static async getFilteredProductsCursor(req: Request, res: Response) {
    try {
      const {
        limit,
        cursor,
        categorySlug,
        tagSlug,
        minPrice,
        maxPrice,
        minRating,
        sortBy,
      } = req.query;

      const data = await PublicProductFilterService.getProductsCursor({
        limit: Number(limit) || 10,
        cursor: cursor as string,
        categorySlug: categorySlug as string,
        tagSlug: tagSlug as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        minRating: minRating ? Number(minRating) : undefined,
        sortBy: sortBy as any,
      });

      return ApiResponse.success(
        res,
        200,
        "Filtered Products fetched successfully",
        data,
      );
    } catch (err) {
      handleError(res, err);
    }
  }
}
