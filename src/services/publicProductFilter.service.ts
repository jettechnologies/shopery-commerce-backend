import { FilterSortedBy } from "@/utils/types";
import { prisma } from "@/prisma/client.js";

export class PublicProductFilterService {
  static async getFilteredProducts({
    page = 1,
    limit = 10,
    categorySlug,
    tagSlug,
    minPrice,
    maxPrice,
    minRating,
    sortBy = "newest",
  }: {
    page?: number;
    limit?: number;
    categorySlug?: string;
    tagSlug?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sortBy?: FilterSortedBy;
  }) {
    const skip = (page - 1) * limit;

    const filters: any = {
      isActive: true,
    };

    // CATEGORY FILTER
    if (categorySlug) {
      filters.categories = {
        some: { category: { slug: categorySlug } },
      };
    }

    // TAG FILTER
    if (tagSlug) {
      filters.tags = {
        some: { tag: { slug: tagSlug } },
      };
    }

    // PRICE FILTER (DYNAMIC)
    if (
      minPrice !== undefined &&
      minPrice !== null &&
      minPrice !== 0 &&
      !Number.isNaN(minPrice)
    ) {
      filters.minPrice = {
        gte: minPrice ?? 0,
      };
    }

    if (
      maxPrice !== undefined &&
      maxPrice !== null &&
      maxPrice !== 0 &&
      !Number.isNaN(maxPrice)
    ) {
      filters.maxPrice = {
        gte: maxPrice ?? 0,
      };
    }

    // RATING FILTER (FIXED FIELD)
    if (minRating !== undefined) {
      filters.averageRating = {
        gte: minRating,
      };
    }

    // SORTING
    let orderBy: any = { createdAt: "desc" };

    switch (sortBy) {
      case "price-asc":
        orderBy = { minPrice: "asc" };
        break;
      case "price-desc":
        orderBy = { minPrice: "desc" };
        break;
      case "rating-desc":
        orderBy = { averageRating: "desc" };
        break;
      case "rating-asc":
        orderBy = { averageRating: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where: filters,
        skip,
        take: limit,
        orderBy,
        include: {
          images: true,
          categories: {
            include: {
              category: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          reviews: {
            where: { isApproved: true },
            select: {
              rating: true,
            },
          },
        },
      }),

      prisma.product.count({ where: filters }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      products,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  static async getProductsCursor({
    limit = 10,
    cursor,
    categorySlug,
    tagSlug,
    minPrice,
    maxPrice,
    minRating,
    sortBy = "newest",
  }: {
    limit?: number;
    cursor?: string;
    categorySlug?: string;
    tagSlug?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sortBy?: FilterSortedBy;
  }) {
    const filters: any = {
      isActive: true,
    };

    if (categorySlug) {
      filters.categories = {
        some: { category: { slug: categorySlug } },
      };
    }

    if (tagSlug) {
      filters.tags = {
        some: { tag: { slug: tagSlug } },
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filters.minPrice = {
        gte: minPrice ?? 0,
      };

      filters.maxPrice = {
        lte: maxPrice ?? 999999,
      };
    }

    if (minRating !== undefined) {
      filters.averageRating = {
        gte: minRating,
      };
    }

    let orderBy: any = { createdAt: "desc" };

    switch (sortBy) {
      case "price-asc":
        orderBy = { minPrice: "asc" };
        break;
      case "price-desc":
        orderBy = { minPrice: "desc" };
        break;
      case "rating-desc":
        orderBy = { averageRating: "desc" };
        break;
      case "rating-asc":
        orderBy = { averageRating: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const cursorObj = cursor ? { id: BigInt(cursor) } : undefined;

    console.log(cursor, "cursor");
    console.log(cursorObj, "cursorObj");

    const products = await prisma.product.findMany({
      where: filters,
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursorObj,
      orderBy,
      include: {
        images: true,
        categories: {
          include: { category: true },
        },
        tags: {
          include: { tag: true },
        },
        reviews: {
          where: { isApproved: true },
          select: {
            rating: true,
          },
        },
      },
    });

    let nextCursor: string | null = null;

    if (products.length > limit) {
      const nextItem = products.pop();
      nextCursor = nextItem ? nextItem.id.toString() : null;
    }

    const prevCursor = products.length ? products[0].id.toString() : null;

    return {
      products,
      pagination: {
        limit,
        nextCursor,
        prevCursor,
        hasNextPage: !!nextCursor,
        hasPreviousPage: !!cursor,
      },
    };
  }
}

// import { FilterSortedBy } from "@/utils/types";
// import { prisma } from "@/prisma/client.js";

// export class PublicProductFilterService {
//   static async getFilteredProducts({
//     page = 1,
//     limit = 10,
//     categorySlug,
//     tagSlug,
//     minPrice,
//     maxPrice,
//     minRating,
//     sortBy = "newest",
//   }: {
//     page?: number;
//     limit?: number;
//     categorySlug?: string;
//     tagSlug?: string;
//     minPrice?: number;
//     maxPrice?: number;
//     minRating?: number;
//     sortBy?: FilterSortedBy;
//   }) {
//     const skip = (page - 1) * limit;

//     const filters: any = { isActive: true };

//     if (categorySlug) {
//       filters.categories = {
//         some: { category: { slug: categorySlug } },
//       };
//     }

//     if (tagSlug) {
//       filters.tags = {
//         some: { tag: { slug: tagSlug } },
//       };
//     }

//     if (minPrice || maxPrice) {
//       filters.price = {
//         gte: minPrice ?? 0,
//         lte: maxPrice ?? 999999,
//       };
//     }

//     if (minRating) {
//       filters.rating = { gte: minRating };
//     }

//     let orderBy: any = { createdAt: "desc" };

//     switch (sortBy) {
//       case "price-asc":
//         orderBy = { price: "asc" };
//         break;
//       case "price-desc":
//         orderBy = { price: "desc" };
//         break;
//       case "rating-desc":
//         orderBy = { rating: "desc" };
//         break;
//       case "rating-asc":
//         orderBy = { rating: "asc" };
//         break;
//       default:
//         orderBy = { createdAt: "desc" };
//     }

//     console.log(filters, "filters query");

//     const [products, total] = await prisma.$transaction([
//       prisma.product.findMany({
//         where: filters,
//         skip,
//         take: limit,
//         orderBy,
//         include: {
//           images: true,
//           categories: { include: { category: true } },
//           tags: { include: { tag: true } },
//         },
//       }),
//       prisma.product.count({ where: filters }),
//     ]);

//     const totalPages = Math.ceil(total / limit);
//     const pagination = {
//       total,
//       totalPages,
//       currentPage: page,
//       limit,
//       hasNextPage: page < totalPages,
//       hasPreviousPage: page > 1,
//     };

//     return { products, pagination };
//   }

//   static async getProductsCursor({
//     limit = 10,
//     cursor,
//     categorySlug,
//     tagSlug,
//     minPrice,
//     maxPrice,
//     minRating,
//     sortBy = "newest",
//   }: {
//     limit?: number;
//     cursor?: string;
//     categorySlug?: string;
//     tagSlug?: string;
//     minPrice?: number;
//     maxPrice?: number;
//     minRating?: number;
//     sortBy?: FilterSortedBy;
//   }) {
//     const filters: any = { isActive: true };

//     if (categorySlug) {
//       filters.categories = {
//         some: { category: { slug: categorySlug } },
//       };
//     }

//     if (tagSlug) {
//       filters.tags = {
//         some: { tag: { slug: tagSlug } },
//       };
//     }

//     if (minPrice || maxPrice) {
//       filters.price = {
//         gte: minPrice ?? 0,
//         lte: maxPrice ?? 999999,
//       };
//     }

//     if (minRating) {
//       filters.rating = { gte: minRating };
//     }

//     // 🧭 Determine sorting order
//     let orderBy: any = { createdAt: "desc" };

//     switch (sortBy) {
//       case "price-asc":
//         orderBy = { price: "asc" };
//         break;
//       case "price-desc":
//         orderBy = { price: "desc" };
//         break;
//       case "rating-desc":
//         orderBy = { rating: "desc" };
//         break;
//       case "rating-asc":
//         orderBy = { rating: "asc" };
//         break;
//       default:
//         orderBy = { createdAt: "desc" };
//     }

//     const cursorObj = cursor ? { id: BigInt(cursor) } : undefined;

//     const products = await prisma.product.findMany({
//       where: filters,
//       take: limit + 1,
//       skip: cursor ? 1 : 0,
//       cursor: cursorObj,
//       orderBy,
//       include: {
//         images: true,
//         categories: { include: { category: true } },
//         tags: { include: { tag: true } },
//       },
//     });

//     let nextCursor: string | null = null;
//     if (products.length > limit) {
//       const nextItem = products.pop();
//       nextCursor = nextItem ? nextItem.id.toString() : null;
//     }

//     const prevCursor = products.length ? products[0].id.toString() : null;

//     const pagination = {
//       limit,
//       nextCursor,
//       prevCursor,
//       hasNextPage: !!nextCursor,
//       hasPreviousPage: !!cursor,
//       nextLink: nextCursor
//         ? `/products/cursor?cursor=${nextCursor}&limit=${limit}`
//         : null,
//       prevLink: cursor
//         ? `/products/cursor?cursor=${prevCursor}&limit=${limit}`
//         : null,
//     };

//     return { products, pagination };
//   }
// }
