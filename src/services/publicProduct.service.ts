import { PrismaClient } from "@prisma/client";
import { SortOrder } from "@/utils/types";

const prisma = new PrismaClient();

type ProductQueryParams = {
  page?: number;
  limit?: number;
  sortOrder?: SortOrder;
};

type ProductCursorQueryParams = {
  cursor?: string;
  limit?: number;
  sortOrder?: SortOrder;
};

export class PublicProductService {
  static async getAllProducts({
    page = 1,
    limit = 10,
    sortOrder = "desc",
  }: ProductQueryParams) {
    const skip = (page - 1) * limit;

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where: { isActive: true },
        skip,
        take: limit,
        orderBy: { createdAt: sortOrder },
        include: {
          images: true,
          categories: { include: { category: true } },
          tags: { include: { tag: true } },
        },
      }),
      prisma.product.count({ where: { isActive: true } }),
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

    return { products, pagination };
  }

  static async getAllProductCursor({
    limit = 10,
    cursor,
    sortOrder = "desc",
  }: ProductCursorQueryParams) {
    const cursorObj = cursor ? { id: BigInt(cursor) } : undefined;
    const products = await prisma.product.findMany({
      where: { isActive: true },
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursorObj,
      orderBy: { id: sortOrder },
      include: {
        images: true,
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
    });

    let nextCursor: string | null = null;
    if (products.length > limit) {
      const nextItem = products.pop();
      nextCursor = nextItem ? nextItem.id.toString() : null;
    }

    const prevCursor = products.length ? products[0].id.toString() : null;

    const pagination = {
      limit,
      nextCursor,
      prevCursor,
      hasNextPage: !!nextCursor,
      hasPreviousPage: !!cursor,
      nextLink: nextCursor
        ? `/products/cursor?cursor=${nextCursor}&limit=${limit}`
        : null,
      prevLink: cursor
        ? `/products/cursor?cursor=${prevCursor}&limit=${limit}`
        : null,
    };

    return { products, pagination };
  }

  static async getProductById(productId: string) {
    const product = await prisma.product.findUnique({
      where: { productId },
      include: {
        images: true,
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
        reviews: true,
      },
    });

    if (!product) return null;
    return product;
  }

  static async getProductBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: true,
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
        reviews: true,
      },
    });

    if (!product) return null;
    return product;
  }
}

// const products = await prisma.product.findMany({
//   where: { isActive: true },
//   orderBy: { createdAt: "desc" },
//   include: {
//     images: true,
//     categories: { include: { category: true } },
//     tags: { include: { tag: true } },
//   },
// });
