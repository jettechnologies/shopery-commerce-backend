import { Request, Response } from "express";

import ApiResponse from "@/libs/ApiResponse";
import { handleError } from "@/libs/misc";
import { SearchQuerySchema } from "@/schema/zod-schema";
import { ProductSearchService } from "@/services/publicProduct.search.service";

export class ProductSearchController {
  static async search(req: Request, res: Response) {
    try {
      const parsed = SearchQuerySchema.parse(req.query);

      const data = await ProductSearchService.searchProducts(parsed);

      return ApiResponse.success(
        res,
        200,
        "Search results fetched successfully",
        data,
      );
    } catch (err) {
      handleError(res, err);
    }
  }

  static async autocomplete(req: Request, res: Response) {
    try {
      const { search } = req.query;

      if (!search) {
        return res.status(400).json({ message: "Query is required" });
      }

      const data = await ProductSearchService.autocomplete(search as string);

      return ApiResponse.success(
        res,
        200,
        "Autocomplete results fetched",
        data,
      );
    } catch (err) {
      handleError(res, err);
    }
  }
}
