import { Request, Response } from "express";
import { ProductService } from "@/services/product.admin.service";
import ApiResponse from "@/libs/ApiResponse";
import {
  CreateProductSchema,
  UpdateProductSchema,
} from "@/schema/zod-schema/product.schema";
import { handleError } from "@/libs/misc";
import { parseArrayField } from "@/utils/misc";

export class AdminProductController {
  static async createProduct(req: Request, res: Response) {
    try {
      const body = req.body;

      // 🧩 Convert string fields into correct types
      const transformedData = {
        ...body,
        price: body.price ? Number(body.price) : undefined,
        salePrice: body.salePrice ? Number(body.salePrice) : undefined,
        stockQuantity: body.stockQuantity ? Number(body.stockQuantity) : 0,
        weight: body.weight ? Number(body.weight) : undefined,

        // Handle JSON arrays (from multipart/form-data)
        categoryIds: parseArrayField<string>(body.categoryIds, {
          forceType: "string",
        }),
        tagIds: parseArrayField<number>(body.tagIds, {
          forceType: "number",
        }),
      };

      console.log(transformedData, "transformed data");

      const data = CreateProductSchema.parse(transformedData);
      const files = req.files as Express.Multer.File[];
      const product = await ProductService.createProduct(data, files);
      return ApiResponse.success(
        res,
        201,
        "Product created successfully",
        product,
      );
    } catch (error) {
      console.log(error, "error message");
      handleError(res, error);
    }
  }

  static async updateProduct(req: Request, res: Response) {
    try {
      const { productId } = req.params;

      const body = req.body;

      const transformedData = {
        name: body.name || undefined,
        description: body.description || undefined,
        shortDescription: body.shortDescription || undefined,
        sku: body.sku || undefined,
        dimensions: body.dimensions || undefined,

        price: body.price === "" ? undefined : Number(body.price),
        salePrice: body.salePrice === "" ? undefined : Number(body.salePrice),
        stockQuantity:
          body.stockQuantity === "" ? undefined : Number(body.stockQuantity),
        weight: body.weight === "" ? undefined : Number(body.weight),

        categoryIds:
          body.categoryIds && body.categoryIds !== ""
            ? typeof body.categoryIds === "string"
              ? body.categoryIds.split(",")
              : body.categoryIds
            : undefined,

        tagIds:
          body.tagIds && body.tagIds !== ""
            ? typeof body.tagIds === "string"
              ? body.tagIds.split(",").map(Number)
              : body.tagIds
            : undefined,
      };

      const data = UpdateProductSchema.parse(transformedData);
      const files = req.files as Express.Multer.File[];
      const product = await ProductService.updateProduct(
        productId,
        data,
        files,
      );
      return ApiResponse.success(
        res,
        200,
        "Product updated successfully",
        product,
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
        product,
      );
    } catch (error: any) {
      handleError(res, error);
    }
  }
}
