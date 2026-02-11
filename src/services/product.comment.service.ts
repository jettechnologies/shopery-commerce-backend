import { prisma } from "@/prisma/client.js";
import { NotFoundError, BadRequestError } from "@/libs/AppError";
import { CreateProductCommentSchemaType } from "@/schema/zod-schema";

type CommentCursor = {
  createdAt: string;
  id: string;
};

const encodeCursor = (cursor: CommentCursor) =>
  Buffer.from(JSON.stringify(cursor)).toString("base64");

const decodeCursor = (cursor?: string): CommentCursor | null =>
  cursor ? JSON.parse(Buffer.from(cursor, "base64").toString()) : null;

export class ProductCommentService {
  // Create a comment or reply
  static async createComment(
    userId: string,
    data: CreateProductCommentSchemaType,
  ) {
    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) throw new NotFoundError("User not found");

    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });
    if (!product) throw new NotFoundError("Product not found");

    if (data.parentId) {
      const parent = await prisma.productComment.findUnique({
        where: { id: data.parentId },
      });
      if (!parent) throw new NotFoundError("Parent comment not found");
    }

    return prisma.productComment.create({
      data: {
        productId: data.productId,
        userId: user.id,
        parentId: data.parentId ?? null,
        body: data.body,
      },
    });
  }

  // Cursor pagination for top-level comments
  static async getCommentsCursor(
    productId: string,
    opts: { cursor?: string; limit?: number; sortOrder?: "asc" | "desc" } = {},
  ) {
    const limit = opts.limit ?? 10;
    const sortOrder = opts.sortOrder ?? "desc";

    const product = await prisma.product.findUnique({ where: { productId } });
    if (!product) throw new NotFoundError("Product not found");

    const decodedCursor = decodeCursor(opts.cursor);

    const comments = await prisma.productComment.findMany({
      where: {
        productId: product.id,
        parentId: null,
        isDeleted: false,
        ...(decodedCursor && {
          OR: [
            {
              createdAt:
                sortOrder === "desc"
                  ? { lt: new Date(decodedCursor.createdAt) }
                  : { gt: new Date(decodedCursor.createdAt) },
            },
            {
              createdAt: new Date(decodedCursor.createdAt),
              id:
                sortOrder === "desc"
                  ? { lt: BigInt(decodedCursor.id) }
                  : { gt: BigInt(decodedCursor.id) },
            },
          ],
        }),
      },
      take: limit + 1,
      orderBy: [{ createdAt: sortOrder }, { id: sortOrder }],
      include: {
        user: { select: { userId: true, email: true } },
        replies: {
          where: { isDeleted: false },
          include: {
            user: { select: { userId: true, email: true } },
            replies: true, // unlimited nested replies
          },
        },
        likes: true,
        dislikes: true,
      },
    });

    const hasNextPage = comments.length > limit;
    const data = hasNextPage ? comments.slice(0, -1) : comments;

    const nextCursor = hasNextPage
      ? encodeCursor({
          createdAt: data[data.length - 1].createdAt.toISOString(),
          id: data[data.length - 1].id.toString(),
        })
      : null;

    return {
      data,
      pagination: {
        limit,
        hasNextPage,
        nextCursor,
      },
    };
  }

  // Soft delete comment
  static async deleteComment(
    commentId: string,
    userId: string,
    isAdmin = false,
  ) {
    const comment = await prisma.productComment.findUnique({
      where: { commentId: commentId },
    });
    if (!comment) throw new NotFoundError("Comment not found");

    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) throw new NotFoundError("User not found");

    if (comment.userId !== user.id || !isAdmin)
      throw new BadRequestError("You cannot delete this comment");

    return prisma.productComment.update({
      where: { commentId: commentId },
      data: { isDeleted: true },
    });
  }

  static async reactComment(
    commentId: string,
    userId: string,
    type: "like" | "dislike",
  ) {
    const comment = await prisma.productComment.findUnique({
      where: { id: BigInt(commentId) },
      include: { likes: true, dislikes: true },
    });
    if (!comment) throw new NotFoundError("Comment not found");

    const user = await prisma.user.findFirst({ where: { userId } });
    if (!user) throw new NotFoundError("User not found");

    if (type === "like") {
      // Create entry in CommentLikes and remove from CommentDislikes
      return prisma.$transaction([
        prisma.commentLikes.upsert({
          where: {
            productCommentId_userId: {
              productCommentId: BigInt(commentId),
              userId: user.id,
            },
          },
          update: {},
          create: { productCommentId: BigInt(commentId), userId: user.id },
        }),
        prisma.commentDislikes.deleteMany({
          where: { productCommentId: BigInt(commentId), userId: user.id },
        }),
      ]);
    } else {
      // Create entry in CommentDislikes and remove from CommentLikes
      return prisma.$transaction([
        prisma.commentDislikes.upsert({
          where: {
            productCommentId_userId: {
              productCommentId: BigInt(commentId),
              userId: user.id,
            },
          },
          update: {},
          create: { productCommentId: BigInt(commentId), userId: user.id },
        }),
        prisma.commentLikes.deleteMany({
          where: { productCommentId: BigInt(commentId), userId: user.id },
        }),
      ]);
    }
  }

  // Admin moderation: update comment body
  static async updateCommentAdmin(commentId: string, newBody: string) {
    const comment = await prisma.productComment.findUnique({
      where: { commentId: commentId },
    });
    if (!comment) throw new NotFoundError("Comment not found");

    return prisma.productComment.update({
      where: { commentId: commentId },
      data: { body: newBody },
    });
  }
}
