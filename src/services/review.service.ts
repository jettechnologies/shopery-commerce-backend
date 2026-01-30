import { prisma } from "prisma/client";
import { NotFoundError, BadRequestError } from "@/libs/AppError";
import { CreateReviewSchemaType } from "@/schema/zod-schema/review.schema";

type ReviewCursor = {
  createdAt: string;
  id: string;
};

const encodeCursor = (cursor: ReviewCursor) =>
  Buffer.from(JSON.stringify(cursor)).toString("base64");

const decodeCursor = (cursor?: string): ReviewCursor | null =>
  cursor ? JSON.parse(Buffer.from(cursor, "base64").toString()) : null;

export class ReviewService {
  static async createReview(userUuid: string, data: CreateReviewSchemaType) {
    const user = await prisma.user.findUnique({
      where: { userId: userUuid },
    });
    if (!user) throw new NotFoundError("User not found");

    const product = await prisma.product.findUnique({
      where: { productId: data.productId },
    });
    if (!product || !product.isActive)
      throw new NotFoundError("Product not found");

    const existing = await prisma.review.findFirst({
      where: {
        userId: user.id,
        productId: product.id,
      },
    });

    if (existing) {
      throw new BadRequestError("You have already reviewed this product");
    }

    if (data.rating < 1 || data.rating > 5) {
      throw new BadRequestError("Invalid rating");
    }

    return prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          productId: product.id,
          userId: user.id,
          rating: data.rating,
          title: data.title,
          body: data.body,
        },
      });

      const stats = await tx.review.aggregate({
        where: {
          productId: product.id,
          isApproved: true,
        },
        _avg: { rating: true },
        _count: true,
      });

      console.log(stats, "stats");

      await tx.product.update({
        where: { id: product.id },
        data: {
          averageRating: stats._avg.rating ?? 0,
          reviewCount: stats._count,
        },
      });

      return review;
    });
  }

  static async getProductReviewsCursor(
    productUuid: string,
    opts: {
      cursor?: string;
      limit?: number;
      direction?: "next" | "prev";
      sortOrder?: "asc" | "desc";
    },
  ) {
    const limit = opts.limit ?? 10;
    const direction = opts.direction ?? "next";
    const sortOrder = opts.sortOrder ?? "desc";

    const product = await prisma.product.findUnique({
      where: { productId: productUuid },
    });

    if (!product || !product.isActive) {
      throw new NotFoundError("Product not found");
    }

    const decodedCursor = decodeCursor(opts.cursor);

    const isForward = direction === "next";
    const order = isForward ? sortOrder : sortOrder === "desc" ? "asc" : "desc";

    const reviews = await prisma.review.findMany({
      where: {
        productId: product.id,
        isApproved: true,
        ...(decodedCursor && {
          OR: [
            {
              createdAt: isForward
                ? sortOrder === "desc"
                  ? { lt: new Date(decodedCursor.createdAt) }
                  : { gt: new Date(decodedCursor.createdAt) }
                : sortOrder === "desc"
                  ? { gt: new Date(decodedCursor.createdAt) }
                  : { lt: new Date(decodedCursor.createdAt) },
            },
            {
              createdAt: new Date(decodedCursor.createdAt),
              id: isForward
                ? sortOrder === "desc"
                  ? { lt: BigInt(decodedCursor.id) }
                  : { gt: BigInt(decodedCursor.id) }
                : sortOrder === "desc"
                  ? { gt: BigInt(decodedCursor.id) }
                  : { lt: BigInt(decodedCursor.id) },
            },
          ],
        }),
      },
      take: limit + 1,
      orderBy: [{ createdAt: order }, { id: order }],
      include: {
        user: {
          select: { userId: true, email: true },
        },
      },
    });

    let data = reviews;
    let hasMore = reviews.length > limit;

    if (hasMore) {
      data = reviews.slice(0, -1);
    }

    // Reverse back if we paged backward
    if (!isForward) {
      data = data.reverse();
    }

    const nextCursor =
      isForward && hasMore
        ? encodeCursor({
            createdAt: data[data.length - 1].createdAt.toISOString(),
            id: data[data.length - 1].id.toString(),
          })
        : null;

    const prevCursor =
      !isForward && hasMore
        ? encodeCursor({
            createdAt: data[0].createdAt.toISOString(),
            id: data[0].id.toString(),
          })
        : decodedCursor
          ? encodeCursor({
              createdAt: data[0].createdAt.toISOString(),
              id: data[0].id.toString(),
            })
          : null;

    return {
      data,
      pagination: {
        limit,
        hasNextPage: isForward ? hasMore : !!opts.cursor,
        hasPreviousPage: isForward ? !!opts.cursor : hasMore,
        nextCursor,
        prevCursor,
        nextLink: nextCursor
          ? `/products/${productUuid}/reviews?cursor=${nextCursor}&direction=next&limit=${limit}`
          : null,
        prevLink: prevCursor
          ? `/products/${productUuid}/reviews?cursor=${prevCursor}&direction=prev&limit=${limit}`
          : null,
      },
    };
  }

  static async getProductReviewsPage(
    productUuid: string,
    opts: {
      page?: number;
      limit?: number;
      sortOrder?: "asc" | "desc";
    },
  ) {
    const page = opts.page ?? 1;
    const limit = opts.limit ?? 10;
    const sortOrder = opts.sortOrder ?? "desc";

    const skip = (page - 1) * limit;

    const product = await prisma.product.findUnique({
      where: { productId: productUuid },
    });

    if (!product || !product.isActive) {
      throw new NotFoundError("Product not found");
    }

    const [reviews, total] = await prisma.$transaction([
      prisma.review.findMany({
        where: {
          productId: product.id,
          isApproved: true,
        },
        skip,
        take: limit,
        orderBy: [{ createdAt: sortOrder }, { id: sortOrder }],
        include: {
          user: {
            select: { userId: true, email: true },
          },
        },
      }),
      prisma.review.count({
        where: {
          productId: product.id,
          isApproved: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: reviews,
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

  static async approveReview(reviewId: string, isApproved: boolean) {
    const review = await prisma.review.findUnique({
      where: { reviewId },
    });

    if (!review) throw new NotFoundError("Review not found");

    return prisma.review.update({
      where: { reviewId },
      data: { isApproved },
    });
  }
}
