import { prisma } from "@/prisma/client.js";
import slugify from "slugify";
import {
  CreateCategorySchemaType,
  UpdateCategorySchemaType,
} from "@/schema/zod-schema/category.schema";
import { ConflictError, NotFoundError } from "@/libs/AppError";
import { SortOrder } from "@/utils/types";
import { deleteFromCloudinary, uploadToCloudinary } from "./cloudinary.service";

export class CategoryService {
  /**
   * Create a new category
   */
  // static async createCategory(data: CreateCategorySchemaType) {
  //   const slug = slugify(data.name, { lower: true, strict: true });

  //   const existing = await prisma.category.findUnique({ where: { slug } });
  //   if (existing)
  //     throw new ConflictError("A category with this name already exists");

  //   const category = await prisma.category.create({
  //     data: {
  //       name: data.name,
  //       slug,
  //       description: data.description,
  //     },
  //   });

  //   return category;
  // }

  static async createCategory(
    data: CreateCategorySchemaType,
    file?: Express.Multer.File,
  ) {
    const slug = slugify(data.name, { lower: true, strict: true });

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) throw new ConflictError("Category already exists");

    let imageData = null;

    if (file) {
      const uploaded = await uploadToCloudinary(file.path, "categories");
      imageData = {
        imageUrl: uploaded.url,
        publicId: uploaded.public_id,
      };
    }

    const category = prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        categoryImage: imageData
          ? {
              create: imageData,
            }
          : undefined,
      },
      include: { categoryImage: true },
    });

    return category;
  }

  /**
   * Update an existing category
   */
  // static async updateCategory(id: string, data: UpdateCategorySchemaType) {
  //   const existing = await prisma.category.findUnique({
  //     where: { categoryId: id },
  //   });
  //   if (!existing) throw new NotFoundError("Category not found");

  //   const updatedSlug = data.name
  //     ? slugify(data.name, { lower: true, strict: true })
  //     : existing.slug;

  //   const updated = await prisma.category.update({
  //     where: { categoryId: id },
  //     data: {
  //       name: data.name ?? existing.name,
  //       slug: updatedSlug,
  //       description: data.description ?? existing.description,
  //     },
  //   });

  //   return updated;
  // }

  static async updateCategory(
    id: string,
    data: UpdateCategorySchemaType,
    file?: Express.Multer.File,
  ) {
    const existing = await prisma.category.findUnique({
      where: { categoryId: id },
      include: { categoryImage: true },
    });

    if (!existing) throw new NotFoundError("Category not found");

    let imageUpdate = undefined;

    if (file) {
      const uploaded = await uploadToCloudinary(file.path, "categories");

      if (existing.categoryImage) {
        await deleteFromCloudinary(existing.categoryImage.publicId);

        imageUpdate = {
          update: {
            imageUrl: uploaded.url,
            publicId: uploaded.public_id,
          },
        };
      } else {
        imageUpdate = {
          create: {
            imageUrl: uploaded.url,
            publicId: uploaded.public_id,
          },
        };
      }
    }

    const updatedCategory = prisma.category.update({
      where: { categoryId: id },
      data: {
        name: data.name ?? existing.name,
        description: data.description ?? existing.description,
        categoryImage: imageUpdate,
      },
      include: { categoryImage: true },
    });

    return updatedCategory;
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
        include: {
          products: {
            where: {
              product: { isActive: true },
            },
            select: { id: true },
          },
          categoryImage: true,
        },
      }),
      prisma.category.count(),
    ]);

    const formatted = categories.map((cat) => {
      const { products, ...rest } = cat;
      const productCount = products.length;
      return {
        ...rest,
        productCount,
      };
    });

    const totalPages = Math.ceil(total / limit);
    const pagination = {
      total,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    return { categories: formatted, pagination };
  }

  /**
   * Get all categories using cursor pagination
   */
  // static async getAllCategoriesCursor({
  //   limit = 10,
  //   cursor,
  //   sortOrder = "desc",
  // }: {
  //   limit?: number;
  //   cursor?: string;
  //   sortOrder?: SortOrder;
  // }) {
  //   const cursorObj = cursor ? { id: BigInt(cursor) } : undefined;

  //   console.log(cursor, "cursor");
  //   console.log(cursorObj, "cursorObj");
  //   const categories = await prisma.category.findMany({
  //     take: limit + 1,
  //     skip: cursor ? 1 : 0,
  //     cursor: cursorObj,
  //     orderBy: { id: sortOrder },
  //   });

  //   console.log(categories, "categories");

  //   let nextCursor: string | null = null;
  //   if (categories.length > limit) {
  //     const nextItem = categories.pop();
  //     nextCursor = nextItem ? nextItem.id.toString() : null;
  //   }

  //   const prevCursor = categories.length ? categories[0].id.toString() : null;

  //   const pagination = {
  //     limit,
  //     nextCursor,
  //     prevCursor,
  //     hasNextPage: !!nextCursor,
  //     hasPreviousPage: !!cursor,
  //     nextLink: nextCursor
  //       ? `/admin/categories/cursor?cursor=${nextCursor}&limit=${limit}`
  //       : null,
  //     prevLink: cursor
  //       ? `/admin/categories/cursor?cursor=${prevCursor}&limit=${limit}`
  //       : null,
  //   };

  //   return { categories, pagination };
  // }

  // modified cursor code

  static async getAllCategoriesCursor({
    limit = 10,
    cursor,
    sortOrder = "desc",
  }: {
    limit?: number;
    cursor?: string;
    sortOrder?: "asc" | "desc";
  }) {
    // Ensure cursor is properly parsed and valid
    const cursorObj =
      cursor && cursor !== "null" && cursor !== "undefined"
        ? { id: BigInt(cursor) }
        : undefined;

    const categories = await prisma.category.findMany({
      take: limit + 1, // Fetch one more to know if there’s a next page
      ...(cursorObj && { skip: 1, cursor: cursorObj }),
      orderBy: { id: sortOrder },
      include: {
        products: {
          where: {
            product: { isActive: true },
          },
          select: { id: true },
        },
        categoryImage: true,
      },
    });

    // If no categories, return early
    if (!categories.length) {
      return {
        categories: [],
        pagination: {
          limit,
          nextCursor: null,
          prevCursor: null,
          hasNextPage: false,
          hasPreviousPage: false,
          nextLink: null,
          prevLink: null,
        },
      };
    }

    const formatted = categories.map((cat) => {
      const { products, ...rest } = cat;
      const productCount = products.length;
      return {
        ...rest,
        productCount,
      };
    });

    // Compute nextCursor properly
    let nextCursor: string | null = null;
    if (categories.length > limit) {
      const nextItem = categories.pop();
      nextCursor = nextItem ? nextItem.id.toString() : null;
    }

    // Compute prevCursor (first element in returned list)
    const prevCursor = categories[0].id.toString();

    const pagination = {
      limit,
      nextCursor,
      prevCursor,
      hasNextPage: !!nextCursor,
      hasPreviousPage: !!cursorObj,
      nextLink: nextCursor
        ? `/admin/categories/cursor?cursor=${nextCursor}&limit=${limit}`
        : null,
      prevLink: cursorObj
        ? `/admin/categories/cursor?cursor=${prevCursor}&limit=${limit}`
        : null,
    };

    return { categories: formatted, pagination };
  }

  /**
   * Get a single category by ID
   */
  // static async getCategoryById(id: string) {
  //   const category = await prisma.category.findUnique({
  //     where: { categoryId: id },
  //     include: { products: true, children: true },
  //   });

  //   if (!category) throw new NotFoundError("Category not found");
  //   return category;
  // }

  static async getCategoryById({
    id,
    page = 1,
    limit = 10,
    sortOrder = "desc",
  }: {
    id: string;
    page?: number;
    limit?: number;
    sortOrder?: SortOrder;
  }) {
    const skip = (page - 1) * limit;

    const category = await prisma.category.findUnique({
      where: { categoryId: id },
      include: {
        categoryImage: true,
      },
    });

    if (!category) throw new NotFoundError("Category not found");

    const [productsData, total] = await prisma.$transaction([
      prisma.productCategory.findMany({
        where: {
          categoryId: category.id,
        },
        skip,
        take: limit,
        orderBy: {
          product: {
            createdAt: sortOrder,
          },
        },
        include: {
          product: {
            include: {
              images: true,
              variants: true,
            },
          },
        },
      }),
      prisma.productCategory.count({
        where: {
          categoryId: category.id,
        },
      }),
    ]);

    const products = productsData.map((pc) => pc.product);

    const totalPages = Math.ceil(total / limit);

    const pagination = {
      total,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    return {
      ...category,
      products,
      pagination,
    };
  }

  /**
   * Get products functionally tied to a category slug/name
   */
  static async getProductsByCategorySlug(slug: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    // Use findFirst to match either exactly the slug or case-insensitive name
    const category = await prisma.category.findFirst({
      where: {
        OR: [{ slug: slug }, { name: { equals: slug, mode: "insensitive" } }],
      },
    });

    if (!category) throw new NotFoundError(`Category '${slug}' not found`);

    const [productLinks, total] = await prisma.$transaction([
      prisma.productCategory.findMany({
        where: { categoryId: category.id },
        skip,
        take: limit,
        include: {
          product: { include: { images: true, wishlistItems: true } },
        },
      }),
      prisma.productCategory.count({ where: { categoryId: category.id } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      category,
      products: productLinks.map((pc) => pc.product),
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  }
}
