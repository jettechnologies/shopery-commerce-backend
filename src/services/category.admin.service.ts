import { PrismaClient } from "@prisma/client";
import slugify from "slugify";
import {
  CreateCategorySchemaType,
  UpdateCategorySchemaType,
} from "@/schema/zod-schema/category.schema";
import { ConflictError, NotFoundError } from "@/libs/AppError";
import { SortOrder } from "@/utils/types";

const prisma = new PrismaClient();

export class CategoryService {
  /**
   * Create a new category
   */
  static async createCategory(data: CreateCategorySchemaType) {
    const slug = slugify(data.name, { lower: true, strict: true });

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing)
      throw new ConflictError("A category with this name already exists");

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
      },
    });

    return category;
  }

  /**
   * Update an existing category
   */
  static async updateCategory(id: string, data: UpdateCategorySchemaType) {
    const existing = await prisma.category.findUnique({
      where: { categoryId: id },
    });
    if (!existing) throw new NotFoundError("Category not found");

    const updatedSlug = data.name
      ? slugify(data.name, { lower: true, strict: true })
      : existing.slug;

    const updated = await prisma.category.update({
      where: { categoryId: id },
      data: {
        name: data.name ?? existing.name,
        slug: updatedSlug,
        description: data.description ?? existing.description,
      },
    });

    return updated;
  }

  /**
   * Delete category
   */
  static async deleteCategory(id: string) {
    const existing = await prisma.category.findUnique({
      where: { categoryId: id },
    });
    if (!existing) throw new NotFoundError("Category not found");

    await prisma.category.delete({ where: { categoryId: id } });
    return { message: "Category deleted successfully" };
  }

  /**
   * Get all categories with page-based pagination
   */
  static async getAllCategories({
    page = 1,
    limit = 10,
    sortOrder = "desc",
  }: {
    page?: number;
    limit?: number;
    sortOrder?: SortOrder;
  }) {
    const skip = (page - 1) * limit;

    const [categories, total] = await prisma.$transaction([
      prisma.category.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: sortOrder },
      }),
      prisma.category.count(),
    ]);

    const totalPages = Math.ceil(total / limit);
    const pagination = {
      total,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    return { categories, pagination };
  }

  /**
   * Get all categories using cursor pagination
   */
  static async getAllCategoriesCursor({
    limit = 10,
    cursor,
    sortOrder = "desc",
  }: {
    limit?: number;
    cursor?: string;
    sortOrder?: SortOrder;
  }) {
    const cursorObj = cursor ? { id: BigInt(cursor) } : undefined;
    const categories = await prisma.category.findMany({
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursorObj,
      orderBy: { id: sortOrder },
    });

    let nextCursor: string | null = null;
    if (categories.length > limit) {
      const nextItem = categories.pop();
      nextCursor = nextItem ? nextItem.id.toString() : null;
    }

    const prevCursor = categories.length ? categories[0].id.toString() : null;

    const pagination = {
      limit,
      nextCursor,
      prevCursor,
      hasNextPage: !!nextCursor,
      hasPreviousPage: !!cursor,
      nextLink: nextCursor
        ? `/admin/categories/cursor?cursor=${nextCursor}&limit=${limit}`
        : null,
      prevLink: cursor
        ? `/admin/categories/cursor?cursor=${prevCursor}&limit=${limit}`
        : null,
    };

    return { categories, pagination };
  }

  /**
   * Get a single category by ID
   */
  static async getCategoryById(id: string) {
    const category = await prisma.category.findUnique({
      where: { categoryId: id },
      include: { products: true },
    });

    if (!category) throw new NotFoundError("Category not found");
    return category;
  }
}
