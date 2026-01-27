import { Request, Response } from "express";
import { PublicProductService } from "@/services/publicProduct.service";
import { PublicProductFilterService } from "@/services/publicProductFilter.service";

export class PublicProductController {
  static async getAllProducts(req: Request, res: Response) {
    try {
      const { page, limit, sortOrder } = req.query;
      const data = await PublicProductService.getAllProducts({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        sortOrder: (sortOrder as "asc" | "desc") || "desc",
      });

      console.log(data, "data");
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
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
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }

  static async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await PublicProductService.getProductById(id);
      if (!product)
        return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }

  static async getProductBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const product = await PublicProductService.getProductBySlug(slug);
      if (!product)
        return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
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
        minPrice: Number(minPrice),
        maxPrice: Number(maxPrice),
        minRating: Number(minRating),
        sortBy: sortBy as any,
      });

      res.json(data);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
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
        minPrice: Number(minPrice),
        maxPrice: Number(maxPrice),
        minRating: Number(minRating),
        sortBy: sortBy as any,
      });

      res.json(data);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
}
