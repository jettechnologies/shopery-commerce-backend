import { Request, Response } from "express";
import { ProductService } from "@/services/product.admin.service";
import ApiResponse from "@/libs/ApiResponse";
import {
  CreateProductSchema,
  UpdateProductSchema,
} from "@/schema/zod-schema/product.schema";
import { handleError } from "@/libs/misc";

export class AdminProductController {
  static async createProduct(req: Request, res: Response) {
    try {
      const data = CreateProductSchema.parse(req.body);
      const files = req.files as Express.Multer.File[];
      const product = await ProductService.createProduct(data, files);
      return ApiResponse.success(
        res,
        201,
        "Product created successfully",
        product
      );
    } catch (error) {
      handleError(res, error);
    }
  }

  static async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = UpdateProductSchema.parse(req.body);
      const files = req.files as Express.Multer.File[];
      const product = await ProductService.updateProduct(id, data, files);
      return ApiResponse.success(
        res,
        200,
        "Product updated successfully",
        product
      );
    } catch (error: any) {
      handleError(res, error);
    }
  }

  static async toggleProductActive(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await ProductService.toggleActive(id);
      return ApiResponse.success(res, 200, result.message, result.product);
    } catch (error) {
      handleError(res, error);
    }
  }

  static async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await ProductService.deleteProduct(id);
      return ApiResponse.success(
        res,
        200,
        "Product deleted successfully",
        product
      );
    } catch (error: any) {
      handleError(res, error);
    }
  }
}
