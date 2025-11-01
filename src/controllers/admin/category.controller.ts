import { Request, Response } from "express";
import { CategoryService } from "@/services/category.admin.service";
import {
  CreateCategorySchema,
  UpdateCategorySchema,
} from "@/schema/zod-schema/category.schema";
import ApiResponse from "@/libs/ApiResponse";
import { handleError } from "@/libs/misc";

export class AdminCategoryController {
  static async createCategory(req: Request, res: Response) {
    try {
      const data = CreateCategorySchema.parse(req.body);
      const category = await CategoryService.createCategory(data);
      return ApiResponse.success(
        res,
        201,
        "Category created successfully",
        category
      );
    } catch (error) {
      handleError(res, error);
    }
  }

  static async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = UpdateCategorySchema.parse(req.body);
      const category = await CategoryService.updateCategory(id, data);
      return ApiResponse.success(
        res,
        200,
        "Category updated successfully",
        category
      );
    } catch (error) {
      handleError(res, error);
    }
  }

  static async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await CategoryService.deleteCategory(id);
      return ApiResponse.success(res, 200, result.message);
    } catch (error) {
      handleError(res, error);
    }
  }

  static async getAllCategories(req: Request, res: Response) {
    try {
      const { page, limit, sortOrder } = req.query;
      const data = await CategoryService.getAllCategories({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        sortOrder: (sortOrder as "asc" | "desc") || "desc",
      });
      return ApiResponse.success(
        res,
        200,
        "Categories fetched successfully",
        data
      );
    } catch (error) {
      handleError(res, error);
    }
  }

  static async getAllCategoriesCursor(req: Request, res: Response) {
    try {
      const { cursor, limit, sortOrder } = req.query;
      const data = await CategoryService.getAllCategoriesCursor({
        cursor: cursor as string,
        limit: Number(limit) || 10,
        sortOrder: (sortOrder as "asc" | "desc") || "desc",
      });
      return ApiResponse.success(
        res,
        200,
        "Categories fetched successfully",
        data
      );
    } catch (error) {
      handleError(res, error);
    }
  }

  static async getCategoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const category = await CategoryService.getCategoryById(id);
      return ApiResponse.success(
        res,
        200,
        "Category retrieved successfully",
        category
      );
    } catch (error) {
      handleError(res, error);
    }
  }
}
